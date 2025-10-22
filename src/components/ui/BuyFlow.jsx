import { useState, useEffect, useCallback, useContext } from "react";
import { ArrowDownUp, Loader2, X, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { validateWalletAddress } from "../../utils/walletValidator";
import { onrampClient } from "../../utils/onrampClient";
import { moonpayClient } from "../../utils/moonpayClient";
import { fetchProviderLimits, analyzeNoProvidersError, checkMoonPayLimits } from "../../utils/limitsChecker";
import ThemeContext from "../../context/ThemeContext";
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

  const [detailedError, setDetailedError] = useState(null);
  const [providerLimits, setProviderLimits] = useState(null);

  // Step 1: Amount, Pair & Provider
  const [fiatAmount, setFiatAmount] = useState("1000");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
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

  // Check if provider is direct integration
  const isDirectProvider = (provider) => {
    const providerName = (provider?.serviceProvider || provider?.provider || '').toUpperCase();
    return providerName === 'ONRAMP' || providerName === 'MOONPAY';
  };

  // Fetch payment methods based on selected provider
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
          type: 'buy',
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
    setDetailedError(null);
    setCurrentQuote(null);
  
    try {
      if (!fromCoin || !toCurrency || !fiatAmount || Number(fiatAmount) <= 0) return;
  
      setLoadingQuote(true);
  
      const quoteParams = {
        sourceAmount: Number(fiatAmount),
        sourceCurrency: toCurrency,
        destinationCurrency: fromCoin,
        countryCode: toCurrency.slice(0, 2),
      };
  
      // Fetch from all sources in parallel
      const quotePromises = [];
  
      // 1. Meld providers
      const meldPayload = {
        action: "BUY",
        sourceAmount: Number(fiatAmount),
        sourceCurrencyCode: toCurrency,
        destinationCurrencyCode: fromCoin,
        countryCode: toCurrency.slice(0, 2),
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
  
      // 2. OnRamp (ONLY for NGN)
      if (toCurrency === "NGN") {
        quotePromises.push(
          onrampClient.getBuyQuote(quoteParams)
            .then(quote => [quote])
            .catch(err => {
              console.error("OnRamp quote error:", err);
              return [];
            })
        );
      }
  
      // 3. MoonPay (validate limits first)
      quotePromises.push(
        checkMoonPayLimits({
          fromCoin,
          toCurrency,
          amount: fiatAmount,
          action: "BUY"
        }).then(limitCheck => {
          if (!limitCheck.isValid) {
            console.log("MoonPay: Amount outside limits", limitCheck.reason);
            return [];
          }
          
          return moonpayClient.getBuyQuote(quoteParams)
            .then(quote => [quote])
            .catch(err => {
              console.error("MoonPay quote error:", err);
              return [];
            });
        })
      );
  
      const results = await Promise.all(quotePromises);
      const allQuotes = results.flat();
  
      if (allQuotes.length === 0) {
        // Fetch limits to provide detailed error
        const limits = await fetchProviderLimits({
          fromCoin,
          toCurrency,
          action: "BUY"
        });
        
        setProviderLimits(limits);
        
        const errorInfo = analyzeNoProvidersError(
          fiatAmount,
          limits,
          "BUY",
          fromCoin,
          toCurrency
        );
        
        setCryptoAmount("");
        setQuoteError(errorInfo.message);
        setDetailedError(errorInfo);
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
      setCryptoAmount("");
      setQuoteError("Unable to fetch quotes. Please try again.");
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
        logo: selectedProvider.logoUrl ?? selectedProvider.logo ?? null,
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
    
    const providerName = (selectedProvider.serviceProvider || selectedProvider.provider || '').toUpperCase();
    
    // Skip wallet address step for OnRamp since their widget collects it
    if (providerName === 'ONRAMP') {
      handleProceedToCheckout();
    } else {
      setCurrentStep(2);
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProceedToCheckout = async () => {
    const providerName = (selectedProvider?.serviceProvider || selectedProvider?.provider || '').toUpperCase();
    
    // OnRamp doesn't need wallet validation since their widget collects it
    if (providerName !== 'ONRAMP' && (!walletAddress || !addressValid)) {
      return;
    }
    
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
        url = await onrampClient.generateBuyUrl({
          sourceCurrency: toCurrency,
          destinationCurrency: fromCoin,
          sourceAmount: Number(fiatAmount),
        });
  
      } else if (providerName === 'MOONPAY') {
        url = await moonpayClient.generateBuyUrl({
          walletAddress,
          sourceCurrency: toCurrency,
          destinationCurrency: fromCoin,
          sourceAmount: Number(fiatAmount),
        });
  
      } else {
        // Meld provider
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
          externalCustomerId: customerId,
        };
  
        console.log('Meld Buy Request:', payload);
  
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
        || "Unable to start buy session. Please try again.";
      
      alert(errorMsg);
    } finally {
      setCreatingSession(false);
    }
  };

  const { theme } = useContext(ThemeContext);

  return (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6 gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === step 
                ? theme === "dark" ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                : currentStep > step 
                  ? theme === "dark" ? "bg-green-600 text-white" : "bg-green-500 text-white"
                  : theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-300 text-gray-600"
            }`}>
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 3 && <div className={`w-12 h-1 ${
              currentStep > step 
                ? theme === "dark" ? "bg-green-600" : "bg-green-500"
                : theme === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Amount, Pair & Provider Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 relative">
          {/* You Pay */}
          <div className={`border rounded-2xl p-4 backdrop-blur-md relative z-30 ${
            theme === "dark" 
              ? "border-white/10 bg-gray-800/40" 
              : "border-gray-300 bg-white/60"
          }`}>
            <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Pay</p>
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
                className={`bg-transparent outline-none text-xl font-semibold w-full no-spinner ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center relative z-10">
            <div className={`p-2 rounded-full transition-colors duration-200 cursor-pointer ${
              theme === "dark" 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}>
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          {/* You Get */}
          <div className={`border rounded-2xl p-4 backdrop-blur-md relative z-20 ${
            theme === "dark" 
              ? "border-white/10 bg-gray-800/40" 
              : "border-gray-300 bg-white/60"
          }`}>
            <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Get</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={cryptoAmount ? formatNumber(Number(cryptoAmount), 8) : ""}
                readOnly
                placeholder="0.00"
                className={`bg-transparent outline-none text-xl font-semibold w-full no-spinner ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />
              <CoinSelect value={fromCoin} onChange={setFromCoin} />
            </div>

            {loadingQuote && (
              <div className={`flex items-center mt-2 text-sm ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`}>
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Getting quote...
              </div>
            )}

            {!loadingQuote && currentQuote && (
              <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {currentQuote.rate && (
                  <div>Rate: <span className="font-medium">{formatNumber(Number(currentQuote.rate), 2)} {toCurrency}/{fromCoin}</span></div>
                )}
                {currentQuote.fees?.total && (
                  <div className="mt-1">Fees: <span className="font-medium">{formatNumber(Number(currentQuote.fees.total), 2)}</span></div>
                )}
                {currentQuote.minAmount && (
                  <div className={`mt-1 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                    Min: <span className="font-medium">{formatNumber(Number(currentQuote.minAmount), 2)} {toCurrency}</span>
                  </div>
                )}
              </div>
            )}

            {quoteError && (
              <div className="flex flex-col gap-2 mt-2">
                <div className={`flex items-start gap-2 text-xs p-2 rounded ${
                  theme === "dark" 
                    ? "text-red-400 bg-red-500/10" 
                    : "text-red-700 bg-red-100"
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{quoteError}</span>
                </div>
                
                {detailedError && detailedError.suggestion && (
                  <div className={`flex items-start gap-2 text-xs p-2 rounded ${
                    theme === "dark" 
                      ? "text-yellow-400 bg-yellow-500/10" 
                      : "text-yellow-800 bg-yellow-100"
                  }`}>
                    <span>💡 {detailedError.suggestion}</span>
                  </div>
                )}
                
                {detailedError && detailedError.minAmount && (
                  <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Minimum: {formatNumber(detailedError.minAmount, 2)} {toCurrency}
                  </div>
                )}
                
                {detailedError && detailedError.maxAmount && (
                  <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Maximum: {formatNumber(detailedError.maxAmount, 2)} {toCurrency}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="relative z-[8]">
            <PaymentMethodSelect
                availableMethods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                setSelectedMethod={setSelectedPaymentMethod}
                loadingMethods={loadingPaymentMethods}
                currency={toCurrency}
                action="BUY"
            />
          </div>

          {/* Provider Selection Dropdown */}
          <div className="relative z-[4]">
            <ProviderSelect
                availableProviders={availableProviders}
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
                loadingQuote={loadingQuote}
            />
          </div>

          <button
            onClick={goToStep2}
            disabled={!fiatAmount || Number(fiatAmount) <= 0 || quoteError || loadingQuote || !selectedProvider}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors duration-200 ${
                fiatAmount && Number(fiatAmount) > 0 && !quoteError && !loadingQuote && selectedProvider
                  ? theme === "dark" 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-indigo-500 hover:bg-indigo-600"
                  : theme === "dark" 
                    ? "bg-gray-700 cursor-not-allowed opacity-60" 
                    : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}              
          >
            {loadingQuote ? "Checking..." : "Continue"}
          </button>
        </div>
      )}

      {/* STEP 2: Wallet Address */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <button 
            onClick={goBack} 
            className={`flex items-center text-sm transition ${
              theme === "dark" 
                ? "text-gray-400 hover:text-white" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center">
            <h3 className={`text-xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>Enter Wallet Address</h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Where should we send your {fromCoin}?
            </p>
          </div>

          <div className="space-y-4">
            <div className={`border rounded-2xl p-4 ${
              theme === "dark" 
                ? "border-white/10 bg-gray-800/40" 
                : "border-gray-300 bg-white"
            }`}>
              <label className={`text-xs block mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>{fromCoin} Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${fromCoin} address`}
                className={`w-full bg-transparent outline-none text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />

              {validatingAddress && (
                <div className={`flex items-center gap-2 mt-2 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  <Loader2 className="w-3 h-3 animate-spin" /> Validating...
                </div>
              )}

              {!validatingAddress && addressValid === true && (
                <div className={`flex items-center gap-2 mt-2 text-xs ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}>
                  <Check className="w-3 h-3" /> Valid address
                </div>
              )}

              {!validatingAddress && addressValid === false && walletAddress && (
                <div className={`flex items-center gap-2 mt-2 text-xs ${
                  theme === "dark" ? "text-red-400" : "text-red-600"
                }`}>
                  <AlertCircle className="w-3 h-3" /> Invalid address
                </div>
              )}
            </div>

            <div className={`border rounded-xl p-3 ${
              theme === "dark" 
                ? "bg-yellow-500/10 border-yellow-500/20" 
                : "bg-yellow-50 border-yellow-300"
            }`}>
              <p className={`text-xs ${theme === "dark" ? "text-yellow-200" : "text-yellow-800"}`}>
                ⚠️ Double-check your address. Transactions cannot be reversed.
              </p>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={!walletAddress || !addressValid || creatingSession}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
                walletAddress && addressValid && !creatingSession
                  ? theme === "dark" 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-indigo-500 hover:bg-indigo-600"
                  : theme === "dark" 
                    ? "bg-gray-700 cursor-not-allowed opacity-60" 
                    : "bg-gray-400 cursor-not-allowed opacity-60"
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
            <div className={`rounded-2xl w-[95%] md:w-[80%] h-[80vh] shadow-xl border relative ${
              theme === "dark" 
                ? "bg-gray-900 border-white/10" 
                : "bg-white border-gray-300"
            }`}>
            <button
                onClick={() => setWidgetUrl(null)}
                className={`absolute top-3 right-3 rounded-full p-2 z-10 ${
                  theme === "dark" 
                    ? "bg-gray-800 text-gray-300 hover:text-white" 
                    : "bg-gray-200 text-gray-700 hover:text-gray-900"
                }`}
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