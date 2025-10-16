import { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, Loader2, X, ChevronLeft, Check, AlertCircle } from "lucide-react";
import CoinSelect from "./CoinSelect";
import CurrencySelect from "./CurrencySelect";
import apiClient from "../../utils/apiClient";
import ProviderSelect from "../common/ProviderSelect";

function useDebounce(callback, delay, deps) {
  useEffect(() => {
    if (!deps || deps.length === 0) return;
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export default function SellFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Amount, Pair & Provider
  const [cryptoAmount, setCryptoAmount] = useState("0.01");
  const [fiatAmount, setFiatAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [userTyped, setUserTyped] = useState("crypto");

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);

  // Step 2: Bank details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
    routingNumber: "", // For international transfers if needed
  });
  const [validatingBankDetails, setValidatingBankDetails] = useState(false);
  const [bankDetailsValid, setBankDetailsValid] = useState(null);

  // Session modal
  const [creatingSession, setCreatingSession] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState(null);

  const formatNumber = (n, decimals = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    const num = Number(n);
    return num >= 1
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  // Fetch quotes from all providers
  const fetchQuote = useCallback(async () => {
    setQuoteError(null);
    setCurrentQuote(null);

    try {
      if (!fromCoin || !toCurrency || !cryptoAmount || Number(cryptoAmount) <= 0) return;

      setLoadingQuote(true);

      const payload = {
        action: "SELL",
        sourceAmount: Number(cryptoAmount),
        sourceCurrencyCode: fromCoin,
        destinationCurrencyCode: toCurrency,
        countryCode: toCurrency === "NGN" ? "NG" : toCurrency === "USD" ? "US" : toCurrency.slice(0, 2),
      };

      const res = await apiClient.post("/meld/crypto-quote/", payload);
      const data = res.data;
      const inner = data?.data || data;

      const quotes = inner?.quotes || (inner?.quote ? [inner.quote] : []);

      if (quotes.length === 0) {
        setQuoteError("No providers available for this transaction");
        setAvailableProviders([]);
        setSelectedProvider(null);
        return;
      }

      setAvailableProviders(quotes);

      // If no provider selected yet, select the first one
      if (!selectedProvider) {
        setSelectedProvider(quotes[0]);
      } else {
        // Keep the same provider if it still exists in new quotes
        const stillExists = quotes.find(
          q => (q.serviceProvider || q.provider) === (selectedProvider.serviceProvider || selectedProvider.provider)
        );
        if (stillExists) {
          setSelectedProvider(stillExists);
        } else {
          setSelectedProvider(quotes[0]);
        }
      }
    } catch (err) {
      console.error("Quote error:", err);
      const resp = err?.response?.data;
      
      if (resp) {
        const fallbackMessage = resp.message || resp.error || "Unable to fetch quote";
        const maybeMin = resp.minimumAmount ?? resp.minAmount ?? resp.min_source_amount ?? null;

        if (maybeMin) {
          setQuoteError(`Amount is below minimum: ${formatNumber(maybeMin)} ${fromCoin}`);
        } else {
          setQuoteError(fallbackMessage);
        }
      } else {
        setQuoteError("Network error while fetching quote.");
      }
      
      setAvailableProviders([]);
      setSelectedProvider(null);
    } finally {
      setLoadingQuote(false);
    }
    setUserTyped(null);
  }, [cryptoAmount, fromCoin, toCurrency, selectedProvider]);

  // Update fiatAmount whenever cryptoAmount or selectedProvider changes
  useEffect(() => {
    if (selectedProvider && cryptoAmount && Number(cryptoAmount) > 0) {
      const destAmount = selectedProvider.destinationAmount ?? selectedProvider.destinationAmountWithoutFees ?? null;
      if (destAmount !== null) {
        setFiatAmount(String(destAmount));
      }
      setCurrentQuote({
        rate: selectedProvider.exchangeRate ?? selectedProvider.rate ?? null,
        fees: {
          total: selectedProvider.totalFee ?? selectedProvider.total_fees ?? null,
          transaction: selectedProvider.transactionFee ?? null,
          network: selectedProvider.networkFee ?? null,
        },
        provider: selectedProvider.serviceProvider ?? selectedProvider.provider ?? null,
        minAmount: selectedProvider.minimumAmount ?? selectedProvider.minAmount ?? null,
        logo: selectedProvider.logoUrl ?? selectedProvider.logo ?? null,
      });
    }
  }, [selectedProvider, cryptoAmount]);

  useDebounce(fetchQuote, 600, [cryptoAmount, fromCoin, toCurrency]);

  // Validate bank details
  const validateBankDetails = async () => {
    const { accountNumber, accountName, bankName } = bankDetails;
    
    if (!accountNumber.trim() || !accountName.trim() || !bankName.trim()) {
      setBankDetailsValid(false);
      return;
    }

    setValidatingBankDetails(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Basic validation: account number should be numeric and reasonable length
      const isValidAccount = /^\d{10,20}$/.test(accountNumber);
      const isValidName = accountName.length >= 3;
      const isValidBank = bankName.length >= 2;
      
      setBankDetailsValid(isValidAccount && isValidName && isValidBank);
    } catch (err) {
      setBankDetailsValid(false);
    } finally {
      setValidatingBankDetails(false);
    }
  };

  useEffect(() => {
    if (bankDetails.accountNumber || bankDetails.accountName || bankDetails.bankName) {
      const timer = setTimeout(validateBankDetails, 800);
      return () => clearTimeout(timer);
    }
  }, [bankDetails]);

  const goToStep2 = () => {
    if (!cryptoAmount || Number(cryptoAmount) <= 0 || quoteError || !selectedProvider) return;
    setCurrentStep(2);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProceedToCheckout = async () => {
    if (!selectedProvider || !bankDetailsValid) return;

    setCreatingSession(true);
    try {
      const user = JSON.parse(localStorage.getItem("bitexly_user") || "{}");
      
      const payload = {
        sessionData: {
          countryCode: toCurrency === "NGN" ? "NG" : toCurrency === "USD" ? "US" : toCurrency.slice(0, 2),
          sourceCurrencyCode: fromCoin,
          sourceAmount: Number(cryptoAmount),
          destinationCurrencyCode: toCurrency,
          serviceProvider: selectedProvider.serviceProvider || selectedProvider.provider,
          // Include bank details if needed by the API
          bankDetails: {
            accountNumber: bankDetails.accountNumber,
            accountName: bankDetails.accountName,
            bankName: bankDetails.bankName,
            routingNumber: bankDetails.routingNumber || undefined,
          },
        },
        sessionType: "SELL",
        externalCustomerId: user.id || user.email,
      };

      const res = await apiClient.post("/meld/session-widget/", payload);
      const data = res.data;
      const url = data.widgetUrl || data.data?.widgetUrl;

      if (!url) throw new Error("No widget URL returned");
      
      setWidgetUrl(url);
    } catch (err) {
      console.error("Session creation error:", err);
      alert("Unable to start sell session. Please try again.");
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6 gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === step ? "bg-indigo-600 text-white" : 
              currentStep > step ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"
            }`}>
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 3 && <div className={`w-12 h-1 ${currentStep > step ? "bg-green-600" : "bg-gray-700"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Amount, Pair & Provider Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 relative">
          {/* You Sell */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">You Sell</p>
            <div className="flex items-center justify-between">
              <input
                inputMode="decimal"
                type="number"
                value={cryptoAmount}
                onChange={(e) => {
                  setUserTyped("crypto");
                  setCryptoAmount(e.target.value);
                }}
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={fromCoin} onChange={setFromCoin} />
            </div>
          </div>

          {/* Provider Selection Dropdown */}
          <div className="relative z-30">
            <ProviderSelect
              availableProviders={availableProviders}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              loadingQuote={loadingQuote}
            />
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full transition-colors duration-200 hover:bg-indigo-700 cursor-pointer">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          {/* You Receive */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">You Receive</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={fiatAmount ? formatNumber(Number(fiatAmount), 2) : ""}
                readOnly
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
            </div>

            {loadingQuote && (
              <div className="flex items-center mt-2 text-sm text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Getting quote...
              </div>
            )}

            {!loadingQuote && currentQuote && (
              <div className="mt-2 text-xs text-gray-300">
                {currentQuote.rate && (
                  <div>Rate: <span className="font-medium">{formatNumber(Number(currentQuote.rate), 2)} {toCurrency}/{fromCoin}</span></div>
                )}
                {currentQuote.fees?.total && (
                  <div className="mt-1">Fees: <span className="font-medium">{formatNumber(Number(currentQuote.fees.total), 2)}</span></div>
                )}
                {currentQuote.minAmount && (
                  <div className="mt-1 text-yellow-300">Min: <span className="font-medium">{formatNumber(Number(currentQuote.minAmount), 8)} {fromCoin}</span></div>
                )}
              </div>
            )}

            {quoteError && (
              <div className="flex items-start gap-2 mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{quoteError}</span>
              </div>
            )}
          </div>

          <button
            onClick={goToStep2}
            disabled={!cryptoAmount || Number(cryptoAmount) <= 0 || quoteError || loadingQuote || !selectedProvider}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors duration-200 ${
              cryptoAmount && Number(cryptoAmount) > 0 && !quoteError && !loadingQuote && selectedProvider
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            {loadingQuote ? "Checking..." : "Continue"}
          </button>
        </div>
      )}

      {/* STEP 2: Bank Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Enter Bank Details</h3>
            <p className="text-sm text-gray-400">Where should we send your {toCurrency}?</p>
          </div>

          <div className="space-y-4">
            {/* Account Number */}
            <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4">
              <label className="text-xs text-gray-400 block mb-2">Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Enter your account number"
                className="w-full bg-transparent outline-none text-white text-sm"
              />
            </div>

            {/* Account Name */}
            <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4">
              <label className="text-xs text-gray-400 block mb-2">Account Name</label>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                placeholder="Enter account holder name"
                className="w-full bg-transparent outline-none text-white text-sm"
              />
            </div>

            {/* Bank Name */}
            <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4">
              <label className="text-xs text-gray-400 block mb-2">Bank Name</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="Enter your bank name"
                className="w-full bg-transparent outline-none text-white text-sm"
              />
            </div>

            {/* Routing Number (Optional for international) */}
            {toCurrency !== "NGN" && (
              <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4">
                <label className="text-xs text-gray-400 block mb-2">Routing Number (Optional)</label>
                <input
                  type="text"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                  placeholder="Enter routing number if applicable"
                  className="w-full bg-transparent outline-none text-white text-sm"
                />
              </div>
            )}

            {/* Validation Status */}
            {validatingBankDetails && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Validating...
              </div>
            )}

            {!validatingBankDetails && bankDetailsValid === true && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" /> Bank details verified
              </div>
            )}

            {!validatingBankDetails && bankDetailsValid === false && (bankDetails.accountNumber || bankDetails.accountName || bankDetails.bankName) && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> Please check your bank details
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-xs text-yellow-200">⚠️ Ensure your bank details are correct. Incorrect details may result in payment delays.</p>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={!bankDetailsValid || creatingSession}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
              bankDetailsValid && !creatingSession
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            {creatingSession ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              `Sell ${formatNumber(Number(cryptoAmount), 8)} ${fromCoin}`
            )}
          </button>
        </div>
      )}

      {/* Widget Modal */}
      {widgetUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 rounded-2xl w-[95%] md:w-[80%] h-[80vh] shadow-xl border border-white/10 relative">
            <button
              onClick={() => setWidgetUrl(null)}
              className="absolute top-3 right-3 bg-gray-800 text-gray-300 hover:text-white rounded-full p-2 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={widgetUrl}
              title="Meld Widget"
              className="w-full h-full rounded-2xl border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </>
  );
}