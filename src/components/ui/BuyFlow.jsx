import { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, Loader2, X, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { validateWalletAddress } from "../../utils/walletValidator";
import CoinSelect from "./CoinSelect";
import CurrencySelect from "./CurrencySelect";
import apiClient from "../../utils/apiClient";
import ProviderSelect from "../common/ProviderSelect";
import PaymentMethodSelect from "../common/PaymentMethodSelect";
import IframeWithFallback from "../common/IframeWithFallback";

function useDebounce(callback, delay, deps) {
  useEffect(() => {
    if (!deps || deps.length === 0) return;
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export default function BuyFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  // Payment Method (if needed by provider)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Step 1: Amount, Pair & Provider
  const [fiatAmount, setFiatAmount] = useState("800000");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [userTyped, setUserTyped] = useState("fiat");

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);

  // Step 2: Wallet address
  const [walletAddress, setWalletAddress] = useState("");
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValid, setAddressValid] = useState(null);

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

  // Fetch payment methods based on selected provider
  const fetchPaymentMethods = useCallback(async () => {
    if (!toCurrency || !fromCoin || !selectedProvider) return;
  
    setLoadingPaymentMethods(true);
    try {
      const params = {
        countries: toCurrency.slice(0, 2),
        fiatCurrencies: toCurrency,
        cryptoCurrencies: fromCoin,
        statuses: 'LIVE',
        serviceProviders: selectedProvider.serviceProvider || selectedProvider.provider,
      };
      
      const res = await apiClient.get("/meld/payment-methods/", { params });
      const data = res.data?.data || res.data || [];
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payment methods error:", err);
      setPaymentMethods([]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [toCurrency, fromCoin, selectedProvider]);
  
  // Trigger fetch when provider changes
  useEffect(() => {
    if (selectedProvider) {
      fetchPaymentMethods();
    }
  }, [selectedProvider, fetchPaymentMethods]);

  // Fetch quotes from all providers
  const fetchQuote = useCallback(async () => {
    setQuoteError(null);
    setCurrentQuote(null);

    try {
      if (!fromCoin || !toCurrency || !fiatAmount || Number(fiatAmount) <= 0) return;

      setLoadingQuote(true);

      const payload = {
        action: "BUY",
        sourceAmount: Number(fiatAmount),
        sourceCurrencyCode: toCurrency,
        destinationCurrencyCode: fromCoin,
        countryCode: toCurrency.slice(0, 2),
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
          setQuoteError(`Amount is below minimum: ${formatNumber(maybeMin)} ${toCurrency}`);
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
  }, [fiatAmount, fromCoin, toCurrency, selectedProvider]);

  // Update cryptoAmount whenever fiatAmount or selectedProvider changes
  useEffect(() => {
        if (selectedProvider && fiatAmount && Number(fiatAmount) > 0) {
        const destAmount = selectedProvider.destinationAmount ?? selectedProvider.destinationAmountWithoutFees ?? null;
        if (destAmount !== null) {
            setCryptoAmount(String(destAmount));
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
            logo: selectedProvider.logoUrl ?? selectedProvider.logo ?? null, // if API returns logos
        });
        }
  }, [selectedProvider, fiatAmount]);

  useDebounce(fetchQuote, 600, [fiatAmount, fromCoin, toCurrency]);

  const validateWalletAddressFunc = async () => {
    if (!walletAddress.trim()) {
      setAddressValid(false);
      return;
    }
  
    setValidatingAddress(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const isValid = validateWalletAddress(walletAddress, fromCoin);
      setAddressValid(isValid);
    } catch (err) {
      setAddressValid(false);
    } finally {
      setValidatingAddress(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      const timer = setTimeout(validateWalletAddressFunc, 800);
      return () => clearTimeout(timer);
    }
  }, [walletAddress]);

  const goToStep2 = () => {
    if (!fiatAmount || Number(fiatAmount) <= 0 || quoteError || !selectedProvider) return;
    setCurrentStep(2);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProceedToCheckout = async () => {
    if (!selectedProvider || !walletAddress || !addressValid) return;

    setCreatingSession(true);
    try {
      const user = JSON.parse(localStorage.getItem("bitexly_user") || "{}");
      
      const payload = {
        sessionData: {
          walletAddress: walletAddress,
          countryCode: toCurrency.slice(0, 2),
          sourceCurrencyCode: toCurrency,
          sourceAmount: Number(fiatAmount),
          destinationCurrencyCode: fromCoin,
          serviceProvider: selectedProvider.serviceProvider || selectedProvider.provider,
          paymentMethod: selectedPaymentMethod?.type || selectedPaymentMethod?.id,
        },
        sessionType: "BUY",
        externalCustomerId: user.id || user.email,
      };

      const res = await apiClient.post("/meld/session-widget/", payload);
      const data = res.data;
      const url = data.widgetUrl || data.data?.widgetUrl;

      if (!url) throw new Error("No widget URL returned");
      
      setWidgetUrl(url);
    } catch (err) {
      console.error("Session creation error:", err);
      alert("Unable to start buy session. Please try again.");
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
          {/* You Pay */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">You Pay</p>
            <div className="flex items-center justify-between">
              <input
                inputMode="decimal"
                type="number"
                value={fiatAmount}
                onChange={(e) => {
                  setUserTyped("fiat");
                  setFiatAmount(e.target.value);
                }}
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
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

          {/* Payment Method Selection */}
          <div className="relative z-20">
            <PaymentMethodSelect
                availableMethods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                setSelectedMethod={setSelectedPaymentMethod}
                loadingMethods={loadingPaymentMethods}
                currency={toCurrency}
                action="BUY"
            />
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full transition-colors duration-200 hover:bg-indigo-700 cursor-pointer">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          {/* You Get */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">You Get</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={cryptoAmount ? formatNumber(Number(cryptoAmount), 8) : ""}
                readOnly
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={fromCoin} onChange={setFromCoin} />
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
                  <div className="mt-1 text-yellow-300">Min: <span className="font-medium">{formatNumber(Number(currentQuote.minAmount), 2)} {toCurrency}</span></div>
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
            disabled={!fiatAmount || Number(fiatAmount) <= 0 || quoteError || loadingQuote || !selectedProvider || !selectedPaymentMethod}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors duration-200 ${
                fiatAmount && Number(fiatAmount) > 0 && !quoteError && !loadingQuote && selectedProvider
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-700 cursor-not-allowed opacity-60"
              }`}              
          >
            {loadingQuote ? "Checking..." : "Continue"}
          </button>
        </div>
      )}

      {/* STEP 2: Wallet Address */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Enter Wallet Address</h3>
            <p className="text-sm text-gray-400">Where should we send your {fromCoin}?</p>
          </div>

          <div className="space-y-4">
            <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4">
              <label className="text-xs text-gray-400 block mb-2">{fromCoin} Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${fromCoin} address`}
                className="w-full bg-transparent outline-none text-white text-sm"
              />

              {validatingAddress && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Validating...
                </div>
              )}

              {!validatingAddress && addressValid === true && (
                <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                  <Check className="w-3 h-3" /> Valid address
                </div>
              )}

              {!validatingAddress && addressValid === false && walletAddress && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" /> Invalid address
                </div>
              )}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-xs text-yellow-200">⚠️ Double-check your address. Transactions cannot be reversed.</p>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={!walletAddress || !addressValid || creatingSession}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
                walletAddress && addressValid && !creatingSession
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-700 cursor-not-allowed opacity-60"
              }`}              
          >
            {creatingSession ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              `Buy ${formatNumber(Number(cryptoAmount), 8)} ${fromCoin}`
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

            <IframeWithFallback src={widgetUrl} fallbackUrl={widgetUrl} />
            </div>
        </div>
      )}
    </>
  );
}