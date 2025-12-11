import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { ArrowDownUp, Loader2, X, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { onrampClient } from "../../utils/onrampClient";
import { moonpayClient } from "../../utils/moonpayClient";
import { fetchProviderLimits, analyzeNoProvidersError, checkMoonPayLimits } from "../../utils/limitsChecker";
import ThemeContext from "../../context/ThemeContext";
import CoinSelect from "./CoinSelect";
import CurrencySelect from "./CurrencySelect";
import apiClient from "../../utils/apiClient";
import ProviderSelect from "../common/ProviderSelect";
import PaymentMethodSelect from "../common/PaymentMethodSelect";

function useDebounce(callback, delay, deps) {
  useEffect(() => {
    if (!deps || deps.length === 0) return;
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export default function SellFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  const [detailedError, setDetailedError] = useState(null);
  const [providerLimits, setProviderLimits] = useState(null);

  const [transactionId, setTransactionId] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Step 1: Amount, Pair & Provider
  const [cryptoAmount, setCryptoAmount] = useState("0.01");
  const [fiatAmount, setFiatAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [userTyped, setUserTyped] = useState("crypto");

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

  // Check if a coin is one of the network-specific USDT variants
  const isNetworkSpecificCoin = (coinCode) => {
    return ["USDT_TRC20", "USDT_ERC20"].includes(coinCode?.toUpperCase());
  };

  // Check if current pair only supports OnRamp
  // Returns true if:
  // 1. Coin is network-specific (USDT_TRC20, USDT_ERC20)
  // 2. Fiat currency is NGN/ZAR (OnRamp only supports NGN and ZAR)
  const shouldOnlyUseOnRamp = (coinCode, fiatCode) => {
    const isNetworkCoin = isNetworkSpecificCoin(coinCode);
    const isNGN = fiatCode === 'NGN' || fiatCode === 'ZAR';
    return isNetworkCoin && isNGN;
  };

  const pollTransactionStatus = useCallback(async (txnId, provider) => {
    try {
      const response = await apiClient.get('/meld/transaction-status/', {
        params: { 
          transactionId: txnId,
          provider: provider
        }
      });
      
      const data = response.data;
      if (data.success) {
        setTransactionStatus(data.status);
        
        console.log(`Transaction ${txnId} status: ${data.status}`);
        
        // Stop polling if transaction is complete, failed, or timed out
        if (data.status === 'COMPLETED' || data.status === 'FAILED' || data.status === 'TIMEOUT') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // Clear from localStorage
          localStorage.removeItem('pending_transaction');
        }
      }
    } catch (err) {
      console.error('Status polling error:', err);
    }
  }, []);
  
  const startPolling = useCallback((txnId, provider) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Do immediate check
    pollTransactionStatus(txnId, provider);
    
    // Start polling every 5 seconds
    const interval = setInterval(() => {
      pollTransactionStatus(txnId, provider);
    }, 5000);
    
    pollingIntervalRef.current = interval;
  }, [pollTransactionStatus]);
  
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

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
        const allMethods = Array.isArray(data) ? data : [];
        
        // Filter for sell-only payment methods (payout methods)
        const sellMethods = allMethods.filter(method => {
          const methodName = method.paymentMethod?.toUpperCase() || '';
          const name = method.name?.toUpperCase() || '';
          
          // Include only payout/withdrawal methods for selling
          return methodName.includes('PAYOUT') || 
                 name.includes('PAYOUT') ||
                 methodName.includes('WITHDRAWAL') ||
                 methodName.includes('BANK_TRANSFER') ||
                 methodName.includes('BANK_ACCOUNT');
        });
        
        setPaymentMethods(sellMethods);
      }
    } catch (err) {
      console.error("Payment methods error:", err);
      setPaymentMethods([]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [toCurrency, fromCoin, selectedProvider]);

  // Check for pending transaction on component mount
  useEffect(() => {
    const pendingTxn = localStorage.getItem('pending_transaction');
    if (pendingTxn) {
      try {
        const txnData = JSON.parse(pendingTxn);
        const { transactionId, provider, startTime, type } = txnData;
        
        // Only resume if transaction was started less than 1 hour ago and is a SELL
        if (Date.now() - startTime < 3600000 && type === 'SELL') {
          setTransactionId(transactionId);
          setCurrentStep(3);
          startPolling(transactionId, provider);
        } else {
          localStorage.removeItem('pending_transaction');
        }
      } catch (err) {
        console.error('Error resuming transaction:', err);
        localStorage.removeItem('pending_transaction');
      }
    }
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []);
  
  // Trigger fetch when provider changes
  useEffect(() => {
    if (selectedProvider) {
      setSelectedPaymentMethod(null);
      fetchPaymentMethods();
    }
  }, [selectedProvider, fetchPaymentMethods]);

  // Fetch quotes from all providers (Meld + Direct)
  const fetchQuote = useCallback(async () => {
    setQuoteError(null);
    setDetailedError(null);
    setCurrentQuote(null);

    try {
      if (!fromCoin || !toCurrency || !cryptoAmount || Number(cryptoAmount) <= 0) return;

      setLoadingQuote(true);

      // Check if we should only use OnRamp
      const onlyOnRamp = shouldOnlyUseOnRamp(fromCoin, toCurrency);

      // If not NGN/ZAR and using network-specific coin, show error
      if (isNetworkSpecificCoin(fromCoin) && (toCurrency !== 'NGN' && toCurrency !== 'ZAR')) {
        setQuoteError(`${fromCoin} is only available with NGN or ZAR`);
        setFiatAmount("");
        setAvailableProviders([]);
        setSelectedProvider(null);
        setLoadingQuote(false);
        return;
      }

      const quoteParams = {
        sourceAmount: Number(cryptoAmount),
        sourceCurrency: fromCoin,
        destinationCurrency: toCurrency,
        countryCode: toCurrency === "NGN" ? "NG" : toCurrency === "USD" ? "US" : toCurrency.slice(0, 2),
      };

      const quotePromises = [];
      let onrampError = null; // ADDED: Track OnRamp errors separately

      // Only fetch from OnRamp if using network-specific coins
      if (onlyOnRamp) {
        // Only OnRamp for USDT_TRC20/ERC20 + NGN
        quotePromises.push(
          onrampClient.getSellQuote(quoteParams)
            .then(quote => [quote])
            .catch(err => {
              console.error("OnRamp quote error:", err);
              if (err.minAmount !== undefined || err.maxAmount !== undefined) {
                onrampError = {
                  message: err.message || "Failed to get quote",
                  minAmount: err.minAmount || null,
                  maxAmount: err.maxAmount || null,
                  details: err.details || ""
                };
              }
              return [];
            })
        );
      } else {
        // Fetch from all providers

        // 1. OnRamp (ONLY for NGN and ZAR)
        if (toCurrency === "NGN" || toCurrency === "ZAR") {
          quotePromises.push(
            onrampClient.getSellQuote(quoteParams)
              .then(quote => [quote])
              .catch(err => {
                console.error("OnRamp quote error:", err);
                // FIXED: Store the error for special handling
                if (err.minAmount !== undefined || err.maxAmount !== undefined) {
                  onrampError = {
                    message: err.message || "Failed to get quote",
                    minAmount: err.minAmount || null,
                    maxAmount: err.maxAmount || null,
                    details: err.details || ""
                  };
                }
                return [];
              })
          );
        }

        // 2. Meld providers
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

        // 3. MoonPay (validate limits first)
        quotePromises.push(
          checkMoonPayLimits({
            fromCoin,
            toCurrency,
            amount: cryptoAmount,
            action: "SELL"
          }).then(limitCheck => {
            if (!limitCheck.isValid) {
              console.log("MoonPay: Amount outside limits", limitCheck.reason);
              return [];
            }
            
            return moonpayClient.getSellQuote(quoteParams)
              .then(quote => [quote])
              .catch(err => {
                console.error("MoonPay quote error:", err);
                return [];
              });
          })
        );
      }

      const results = await Promise.all(quotePromises);
      const allQuotes = results.flat();

      if (allQuotes.length === 0) {
        // FIXED: Check if we have OnRamp error with min/max info
        if (onrampError && (onrampError.minAmount || onrampError.maxAmount)) {
          setQuoteError(onrampError.message);
          setDetailedError({
            message: onrampError.message,
            minAmount: onrampError.minAmount,
            maxAmount: onrampError.maxAmount,
            suggestion: onrampError.minAmount 
              ? `Please enter an amount of at least ${formatNumber(onrampError.minAmount, 8)} ${fromCoin}`
              : onrampError.maxAmount
              ? `Please enter an amount less than ${formatNumber(onrampError.maxAmount, 8)} ${fromCoin}`
              : null
          });
        } else if (onlyOnRamp) {
          setQuoteError(`No quotes available for ${fromCoin} with ${toCurrency} via OnRamp.`);
        } else {
          // Fetch limits to provide detailed error
          const limits = await fetchProviderLimits({
            fromCoin,
            toCurrency,
            action: "SELL"
          });
          
          setProviderLimits(limits);
          
          const errorInfo = analyzeNoProvidersError(
            cryptoAmount,
            limits,
            "SELL",
            fromCoin,
            toCurrency
          );
          
          setQuoteError(errorInfo.message);
          setDetailedError(errorInfo);
        }
        
        setFiatAmount("");
        setAvailableProviders([]);
        setSelectedProvider(null);
        setLoadingQuote(false);
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
      setFiatAmount("");
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
  
    // Open tab immediately (must be in user gesture context)
    const newTab = window.open('', '_blank');
    
    setCreatingSession(true);
    try {
      // Get or create customer ID
      const storedUser = localStorage.getItem("bitexly_user");
      let customerId;
  
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const user_details = userData.user_details || {};
        customerId = user_details.id || user_details.email || user_details.username;
      }
  
      // Fallback for guests
      if (!customerId) {
        let guestId = localStorage.getItem("guest_customer_id");
        if (!guestId) {
          guestId = `guest-${crypto.randomUUID()}`;
          localStorage.setItem("guest_customer_id", guestId);
        }
        customerId = guestId;
      }
  
      console.log("✅ Customer ID:", customerId);
  
      const providerName = (selectedProvider.serviceProvider || selectedProvider.provider || '').toUpperCase();
      let url, txnId;
  
      if (providerName === 'ONRAMP') {
        // OnRamp SELL flow
        const payload = {
          action: "SELL",
          sourceCurrencyCode: fromCoin,
          destinationCurrencyCode: toCurrency,
          sourceAmount: Number(fiatAmount),
        };
  
        console.log('OnRamp Sell Request:', payload);
  
        const res = await apiClient.post("/onramp/generate-url/", payload);
        const data = res.data;
        
        url = data.widgetUrl || data.paymentUrl || data.data?.link;
        txnId = data.transactionId || data.data?.transactionId;
  
      } else if (providerName === 'MOONPAY') {
        // MoonPay SELL flow
        const payload = {
          action: "SELL",
          sourceCurrencyCode: fromCoin,
          destinationCurrencyCode: toCurrency,
          sourceAmount: Number(cryptoAmount),
          externalCustomerId: customerId,
        };
  
        console.log('MoonPay Sell Request:', payload);
  
        const res = await apiClient.post("/moonpay/generate-url/", payload);
        const data = res.data;
        
        url = data.widgetUrl || data.paymentUrl;
        txnId = data.transactionId || data.data?.transactionId;
  
      } else {
        // Meld SELL flow
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
        txnId = data.transactionId || data.data?.transactionId;
      }
  
      if (!url) throw new Error("No widget URL returned");
      
      console.log("✅ Widget URL generated:", url);
      console.log("✅ Transaction ID:", txnId);
      
      // Store transaction data in localStorage
      const transactionData = {
        transactionId: txnId,
        customerId,
        provider: providerName,
        startTime: Date.now(),
        type: 'SELL',
        amount: cryptoAmount,
        fromCurrency: fromCoin,
        toCurrency: toCurrency
      };
      localStorage.setItem('pending_transaction', JSON.stringify(transactionData));
      
      // Set transaction ID and start polling
      setTransactionId(txnId);
      startPolling(txnId, providerName);
      
      // Redirect the pre-opened tab to the actual URL
      newTab.location.href = url;
      
      // Move to step 3
      setCurrentStep(3);
      
    } catch (err) {
      console.error("❌ Session creation error:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error
        || err.response?.data?.details
        || err.message 
        || "Unable to start sell session. Please try again.";
      
      alert(errorMsg);
      
      // Close the pre-opened tab if an error occurs
      if (newTab) newTab.close();
      
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
          {/* You Sell */}
          <div className={`border rounded-2xl p-4 backdrop-blur-md relative z-30 ${
            theme === "dark" 
              ? "border-white/10 bg-gray-800/40" 
              : "border-gray-300 bg-white/60"
          }`}>
            <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Sell</p>
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
                className={`bg-transparent outline-none text-xl font-semibold w-full no-spinner ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />
              <CoinSelect value={fromCoin} onChange={setFromCoin} />
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

          {/* You Receive */}
          <div className={`border rounded-2xl p-4 backdrop-blur-md relative z-20 ${
            theme === "dark" 
              ? "border-white/10 bg-gray-800/40" 
              : "border-gray-300 bg-white/60"
          }`}>
            <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Receive</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={fiatAmount ? formatNumber(Number(fiatAmount), 2) : ""}
                readOnly
                placeholder="0.00"
                className={`bg-transparent outline-none text-xl font-semibold w-full no-spinner ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
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
                    Min: <span className="font-medium">{formatNumber(Number(currentQuote.minAmount), 8)} {fromCoin}</span>
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
                    Minimum: {formatNumber(detailedError.minAmount, 8)} {fromCoin}
                  </div>
                )}
                
                {detailedError && detailedError.maxAmount && (
                  <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Maximum: {formatNumber(detailedError.maxAmount, 8)} {fromCoin}
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
                action="SELL"
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
            disabled={!cryptoAmount || Number(cryptoAmount) <= 0 || quoteError || loadingQuote || !selectedProvider}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors duration-200 ${
              cryptoAmount && Number(cryptoAmount) > 0 && !quoteError && !loadingQuote && selectedProvider
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

      {/* STEP 2: Transaction Summary */}
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
            }`}>Confirm Your Sale</h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Review the details before proceeding
            </p>
          </div>

          <div className={`rounded-xl p-5 space-y-4 ${
            theme === "dark" ? "bg-gray-800/60" : "bg-gray-100"
          }`}>
            {/* Transaction visual */}
            <div className={`flex items-center justify-between pb-4 border-b ${
              theme === "dark" ? "border-white/10" : "border-gray-300"
            }`}>
              <div className="text-center flex-1">
                <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Sell</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatNumber(Number(cryptoAmount), 8)}
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{fromCoin}</p>
              </div>
              <ArrowDownUp className={`w-6 h-6 mx-4 ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`} />
              <div className="text-center flex-1">
                <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Receive</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatNumber(Number(fiatAmount), 2)}
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{toCurrency}</p>
              </div>
            </div>

            {/* Transaction details */}
            <div className="space-y-2 text-sm">
              {currentQuote?.rate && (
                <div className="flex justify-between">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Exchange Rate</span>
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                    1 {fromCoin} ≈ {formatNumber(Number(currentQuote.rate), 2)} {toCurrency}
                  </span>
                </div>
              )}
              
              {currentQuote?.fees?.total && (
                <div className="flex justify-between">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Total Fees</span>
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                    {formatNumber(Number(currentQuote.fees.total), 2)} {toCurrency}
                  </span>
                </div>
              )}

              {selectedProvider && (
                <div className={`flex justify-between items-center pt-2 border-t ${
                  theme === "dark" ? "border-white/10" : "border-gray-300"
                }`}>
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Provider</span>
                  <div className="flex items-center gap-2">
                    {currentQuote?.logo && (
                      <img src={currentQuote.logo} alt="provider" className="w-5 h-5 rounded" />
                    )}
                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {currentQuote?.provider || selectedProvider.serviceProvider || selectedProvider.provider}
                    </span>
                  </div>
                </div>
              )}

              {selectedPaymentMethod && (
                <div className="flex justify-between">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Payment Method</span>
                  <span className={`capitalize ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {selectedPaymentMethod.name || selectedPaymentMethod.type || 'Selected'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className={`border rounded-xl p-3 ${
            theme === "dark" 
              ? "bg-blue-500/10 border-blue-500/20" 
              : "bg-blue-50 border-blue-300"
          }`}>
            <p className={`text-xs ${theme === "dark" ? "text-blue-200" : "text-blue-800"}`}>
              💡 After confirming, you'll be directed to complete your bank details and payment information securely with our payment partner.
            </p>
          </div>

          {/* Warning box */}
          <div className={`border rounded-xl p-3 ${
            theme === "dark" 
              ? "bg-yellow-500/10 border-yellow-500/20" 
              : "bg-yellow-50 border-yellow-300"
          }`}>
            <p className={`text-xs ${theme === "dark" ? "text-yellow-200" : "text-yellow-800"}`}>
              ⚠️ Make sure you have {formatNumber(Number(cryptoAmount), 8)} {fromCoin} ready to send when prompted by the widget.
            </p>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={creatingSession}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
              creatingSession
                ? theme === "dark" 
                  ? "bg-gray-700 cursor-not-allowed opacity-60" 
                  : "bg-gray-400 cursor-not-allowed opacity-60"
                : theme === "dark" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "bg-indigo-500 hover:bg-indigo-600"
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

      {/* STEP 3: Transaction In Progress */}
      {currentStep === 3 && (
        <div className="space-y-6 text-center py-8">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            transactionStatus === 'COMPLETED'
              ? theme === "dark" ? "bg-green-600/20" : "bg-green-100"
              : transactionStatus === 'FAILED' || transactionStatus === 'TIMEOUT'
              ? theme === "dark" ? "bg-red-600/20" : "bg-red-100"
              : theme === "dark" ? "bg-indigo-600/20" : "bg-indigo-100"
          }`}>
            {transactionStatus === 'COMPLETED' ? (
              <Check className={`w-10 h-10 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`} />
            ) : transactionStatus === 'FAILED' || transactionStatus === 'TIMEOUT' ? (
              <X className={`w-10 h-10 ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              }`} />
            ) : (
              <Loader2 className={`w-10 h-10 animate-spin ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`} />
            )}
          </div>

          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {transactionStatus === 'COMPLETED' 
                ? 'Transaction Complete!' 
                : transactionStatus === 'FAILED'
                ? 'Transaction Failed'
                : transactionStatus === 'TIMEOUT'
                ? 'Transaction Timeout'
                : 'Transaction In Progress'}
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {transactionStatus === 'COMPLETED'
                ? `Your ${fromCoin} will arrive in your wallet shortly`
                : transactionStatus === 'FAILED'
                ? 'Something went wrong with your transaction'
                : transactionStatus === 'TIMEOUT'
                ? 'Transaction took too long - please check with provider'
                : 'Complete your purchase in the opened tab'}
            </p>
            
            {transactionId && (
              <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                ID: {transactionId.slice(0, 20)}...
              </p>
            )}
          </div>

          {(!transactionStatus || transactionStatus === 'PENDING') && (
            <div className={`border rounded-xl p-4 max-w-md mx-auto ${
              theme === "dark" 
                ? "bg-blue-500/10 border-blue-500/20" 
                : "bg-blue-50 border-blue-300"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-blue-200" : "text-blue-800"}`}>
                💡 A new tab has been opened with your payment provider. Complete the transaction there.
              </p>
              <p className={`text-xs mt-2 ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                ⏱️ Status updates automatically every 5 seconds
              </p>
            </div>
          )}

          {transactionStatus === 'COMPLETED' && (
            <div className={`border rounded-xl p-4 max-w-md mx-auto ${
              theme === "dark" 
                ? "bg-green-500/10 border-green-500/20" 
                : "bg-green-50 border-green-300"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-green-200" : "text-green-800"}`}>
                ✅ Your {formatNumber(Number(cryptoAmount), 8)} {fromCoin} will arrive shortly
              </p>
            </div>
          )}

          {(transactionStatus === 'FAILED' || transactionStatus === 'TIMEOUT') && (
            <div className={`border rounded-xl p-4 max-w-md mx-auto ${
              theme === "dark" 
                ? "bg-red-500/10 border-red-500/20" 
                : "bg-red-50 border-red-300"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-red-200" : "text-red-800"}`}>
                ❌ {transactionStatus === 'TIMEOUT' 
                  ? 'Please check your payment provider for transaction status'
                  : 'Please try again or contact support if the issue persists'}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setCurrentStep(1);
              setTransactionId(null);
              setTransactionStatus(null);
              stopPolling();
              localStorage.removeItem('pending_transaction');
            }}
            className={`px-6 py-3 rounded-2xl font-semibold transition-colors ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Start New Transaction
          </button>
        </div>
      )}
    </>
  );
}