import { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, Loader2, X, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { validateBankDetails } from "../../utils/bankValidator";
import { onrampClient } from "../../utils/onrampClient";
import { moonpayClient } from "../../utils/moonpayClient";
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

export default function SellFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Amount, Pair & Provider
  const [cryptoAmount, setCryptoAmount] = useState("0.01");
  const [fiatAmount, setFiatAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [userTyped, setUserTyped] = useState("crypto");

  const [bankValidationError, setBankValidationError] = useState(null);

  // Payment Method (if needed by provider)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);

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

  // Check if provider is direct integration
  const isDirectProvider = (provider) => {
    const providerName = (provider?.serviceProvider || provider?.provider || '').toUpperCase();
    return providerName === 'ONRAMP' || providerName === 'MOONPAY';
  };

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!toCurrency || !fromCoin || !selectedProvider) return;
  
    setLoadingPaymentMethods(true);
    try {
      const providerName = (selectedProvider.serviceProvider || selectedProvider.provider || '').toUpperCase();
      
      if (providerName === 'ONRAMP') {
        const methods = await onrampClient.getPaymentMethods({
          country: toCurrency.slice(0, 2),
          fiatCurrency: toCurrency,
          cryptoCurrency: fromCoin,
          type: 'sell',
        });
        setPaymentMethods(methods);
      } else if (providerName === 'MOONPAY') {
        const methods = await moonpayClient.getPaymentMethods({
          country: toCurrency.slice(0, 2),
          fiatCurrency: toCurrency,
        });
        setPaymentMethods(methods);
      } else {
        // Meld provider
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
      }
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

  // Fetch quotes from all providers (Meld + Direct)
  const fetchQuote = useCallback(async () => {
    setQuoteError(null);
    setCurrentQuote(null);

    try {
      if (!fromCoin || !toCurrency || !cryptoAmount || Number(cryptoAmount) <= 0) return;

      setLoadingQuote(true);

      const quoteParams = {
        sourceAmount: Number(cryptoAmount),
        sourceCurrency: fromCoin,
        destinationCurrency: toCurrency,
        countryCode: toCurrency === "NGN" ? "NG" : toCurrency === "USD" ? "US" : toCurrency.slice(0, 2),
      };

      // Fetch from all sources in parallel
      const quotePromises = [];

      // 1. Meld providers
      const meldPayload = {
        action: "SELL",
        sourceAmount: Number(cryptoAmount),
        sourceCurrencyCode: fromCoin,
        destinationCurrencyCode: toCurrency,
        countryCode: toCurrency === "NGN" ? "NG" : toCurrency === "USD" ? "US" : toCurrency.slice(0, 2),
      };
      quotePromises.push(
        apiClient.post("/meld/crypto-quote/", meldPayload)
          .then(res => {
            const data = res.data;
            const inner = data?.data || data;
            return inner?.quotes || (inner?.quote ? [inner.quote] : []);
          })
          .catch(err => {
            console.error("Meld quote error:", err);
            return [];
          })
      );

      // 2. OnRamp
      quotePromises.push(
        onrampClient.getSellQuote(quoteParams)
          .then(quote => [quote])
          .catch(err => {
            console.error("OnRamp quote error:", err);
            return [];
          })
      );

      // 3. MoonPay
      quotePromises.push(
        moonpayClient.getSellQuote(quoteParams)
          .then(quote => [quote])
          .catch(err => {
            console.error("MoonPay quote error:", err);
            return [];
          })
      );

      const results = await Promise.all(quotePromises);
      const allQuotes = results.flat();

      if (allQuotes.length === 0) {
        setQuoteError("No providers available for this transaction");
        setAvailableProviders([]);
        setSelectedProvider(null);
        return;
      }

      setAvailableProviders(allQuotes);

      // If no provider selected yet, select the first one
      if (!selectedProvider) {
        setSelectedProvider(allQuotes[0]);
      } else {
        // Keep the same provider if it still exists in new quotes
        const stillExists = allQuotes.find(
          q => (q.serviceProvider || q.provider) === (selectedProvider.serviceProvider || selectedProvider.provider)
        );
        if (stillExists) {
          setSelectedProvider(stillExists);
        } else {
          setSelectedProvider(allQuotes[0]);
        }
      }
    } catch (err) {
      console.error("Quote error:", err);
      setQuoteError("Unable to fetch quotes. Please try again.");
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

  const goToStep2 = () => {
    if (!cryptoAmount || Number(cryptoAmount) <= 0 || quoteError || !selectedProvider) return;
    setCurrentStep(2);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProceedToCheckout = async () => {
    if (!selectedProvider) return;
  
    setCreatingSession(true);
    try {  
      // Get user from localStorage (matches your AuthContext structure)
      const storedUser = localStorage.getItem("bitexly_user");
      
      if (!storedUser) {
        alert("User session not found. Please log in again.");
        return;
      }
  
      const userData = JSON.parse(storedUser);
      const user_details = userData.user_details || {};
      
      // Extract customerId - your user object has the data directly
      const customerId = user_details.id || user_details.email || user_details.username;
  
      if (!customerId) {
        console.error("User data:", userData);
        alert("Unable to identify user. Please log in again.");
        return;
      }
  
      console.log("✅ User identified:", customerId);

      const providerName = (selectedProvider.serviceProvider || selectedProvider.provider || '').toUpperCase();
      let url;
  
      if (providerName === 'ONRAMP') {
        url = await onrampClient.generateSellUrl({
          sourceCurrency: fromCoin,
          destinationCurrency: toCurrency,
          sourceAmount: Number(cryptoAmount),
        });
  
      } else if (providerName === 'MOONPAY') {
        url = await moonpayClient.generateSellUrl({
          sourceCurrency: fromCoin,
          destinationCurrency: toCurrency,
          sourceAmount: Number(cryptoAmount),
          bankDetails,
        });
  
      } else {
        // Meld provider
        const payload = {
          sessionData: {
            countryCode: toCurrency === "NGN" ? "NG" : toCurrency === "USD" ? "US" : toCurrency.slice(0, 2),
            sourceCurrencyCode: fromCoin,
            sourceAmount: Number(cryptoAmount),
            destinationCurrencyCode: toCurrency,
            serviceProvider: selectedProvider.serviceProvider || selectedProvider.provider,
            paymentMethod: selectedPaymentMethod?.type || selectedPaymentMethod?.id,
          },
          sessionType: "SELL",
          externalCustomerId: customerId,
        };
  
        console.log('Meld Sell Request:', payload);
  
        const res = await apiClient.post("/meld/session-widget/", payload);
        const data = res.data;
        url = data.widgetUrl || data.data?.widgetUrl;
      }
  
      if (!url) throw new Error("No widget URL returned");
      
      console.log("✅ Widget URL generated:", url);
      setWidgetUrl(url);
  
    } catch (err) {
      console.error("❌ Session creation error:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error
        || err.response?.data?.details
        || err.message 
        || "Unable to start sell session. Please try again.";
      
      alert(errorMsg);
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
          <div className="relative z-[10000]">
            <ProviderSelect
              availableProviders={availableProviders}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              loadingQuote={loadingQuote}
            />
          </div>

          {/* Payment Method Selection */}
          <div className="relative z-[9999]">
            <PaymentMethodSelect
                availableMethods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                setSelectedMethod={setSelectedPaymentMethod}
                loadingMethods={loadingPaymentMethods}
                currency={toCurrency}
                action="SELL"
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

      {/* STEP 2: Transaction Summary */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Your Sale</h3>
            <p className="text-sm text-gray-400">Review the details before proceeding</p>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-5 space-y-4">
            {/* Transaction visual */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-400 mb-1">You Sell</p>
                <p className="text-2xl font-bold text-white">{formatNumber(Number(cryptoAmount), 8)}</p>
                <p className="text-sm text-gray-400">{fromCoin}</p>
              </div>
              <ArrowDownUp className="w-6 h-6 text-indigo-400 mx-4" />
              <div className="text-center flex-1">
                <p className="text-xs text-gray-400 mb-1">You Receive</p>
                <p className="text-2xl font-bold text-white">{formatNumber(Number(fiatAmount), 2)}</p>
                <p className="text-sm text-gray-400">{toCurrency}</p>
              </div>
            </div>

            {/* Transaction details */}
            <div className="space-y-2 text-sm">
              {currentQuote?.rate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white">1 {fromCoin} ≈ {formatNumber(Number(currentQuote.rate), 2)} {toCurrency}</span>
                </div>
              )}
              
              {currentQuote?.fees?.total && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Fees</span>
                  <span className="text-white">{formatNumber(Number(currentQuote.fees.total), 2)} {toCurrency}</span>
                </div>
              )}

              {selectedProvider && (
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-gray-400">Provider</span>
                  <div className="flex items-center gap-2">
                    {currentQuote?.logo && (
                      <img src={currentQuote.logo} alt="provider" className="w-5 h-5 rounded" />
                    )}
                    <span className="text-white font-medium">
                      {currentQuote?.provider || selectedProvider.serviceProvider || selectedProvider.provider}
                    </span>
                  </div>
                </div>
              )}

              {selectedPaymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="text-white capitalize">
                    {selectedPaymentMethod.name || selectedPaymentMethod.type || 'Selected'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-blue-200">
              💡 After confirming, you'll be directed to complete your bank details and payment information securely with our payment partner.
            </p>
          </div>

          {/* Warning box */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <p className="text-xs text-yellow-200">
              ⚠️ Make sure you have {formatNumber(Number(cryptoAmount), 8)} {fromCoin} ready to send when prompted by the widget.
            </p>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={creatingSession}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
              creatingSession
                ? "bg-gray-700 cursor-not-allowed opacity-60"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {creatingSession ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              "Confirm & Proceed to Payment"
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