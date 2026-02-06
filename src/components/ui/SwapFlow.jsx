import { useState, useEffect, useCallback, useContext } from "react";
import { ArrowDownUp, Loader2, ChevronLeft, Check, AlertCircle, RefreshCw, Clock, Copy } from "lucide-react";
import { validateWalletAddress } from "../../utils/walletValidator";
import ThemeContext from "../../context/ThemeContext";
import CoinSelect from "./CoinSelect";
import apiClient from "../../utils/apiClient";
import ProviderSelect from "../common/ProviderSelect";

function useDebounce(callback, delay, deps) {
  useEffect(() => {
    if (!deps || deps.length === 0) return;
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export default function SwapFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  // Coins data - shared across all providers
  const [swapCoins, setSwapCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // Step 1: Amount & Pair
  const [fromAmount, setFromAmount] = useState("0.1");
  const [toAmount, setToAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCoin, setToCoin] = useState("ETH");

  // Provider selection
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [rateInfo, setRateInfo] = useState(null);

  // Step 2: Wallet address
  const [walletAddress, setWalletAddress] = useState("");
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValid, setAddressValid] = useState(null);
  const [addressError, setAddressError] = useState(null);

  // Step 3: Create & Await Payment
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Step 4: Confirm Transaction
  const [confirmingTransaction, setConfirmingTransaction] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const formatNumber = (n, decimals = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    const num = Number(n);
    return num >= 1
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Fetch coins (using Changelly as the master list for all providers)
  useEffect(() => {
    const fetchSwapCoins = async () => {
      try {
        const res = await apiClient.get("/users/api/changelly/get-coins/");
        const coinsList = res.data?.result || [];
        
        const formatted = coinsList.map(c => ({
          id: c.ticker?.toUpperCase() || c.name?.toUpperCase(),
          name: c.fullName || c.name,
          symbol: c.ticker?.toUpperCase() || c.name?.toUpperCase(),
          code: c.ticker?.toUpperCase() || c.name?.toUpperCase(),
          logo: c.image || c.logo || null,
          enabled: c.enabled !== false,
        })).filter(c => c.enabled);

        setSwapCoins(formatted);
      } catch (err) {
        console.error("Failed to fetch swap coins:", err);
        setSwapCoins([]);
      } finally {
        setLoadingCoins(false);
      }
    };

    fetchSwapCoins();
  }, []);

  // Fetch exchange rate from all providers
  const fetchExchangeRate = useCallback(async () => {
    if (!fromCoin || !toCoin || !fromAmount || Number(fromAmount) <= 0) {
      setToAmount("");
      setCurrentQuote(null);
      setRateInfo(null);
      setAvailableProviders([]);
      setSelectedProvider(null);
      return;
    }

    setQuoteError(null);
    setLoadingQuote(true);

    try {
      const quotePromises = [];

      // 1. Changelly quote
      quotePromises.push(
        apiClient.post("/users/api/changelly/exchange-amount/", {
          from: fromCoin.toLowerCase(),
          to: toCoin.toLowerCase(),
          amount: String(fromAmount),
        })
        .then(res => {
          const result = res.data?.result;
          if (!result) return null;

          let quoteData = result;
          if (Array.isArray(result) && result.length > 0) {
            quoteData = result[0];
          }

          const estimatedAmount = quoteData.amountTo || quoteData.result || quoteData.estimatedAmount;
          if (!estimatedAmount) return null;

          const rate = Number(estimatedAmount) / Number(fromAmount);
          
          return {
            provider: 'CHANGELLY',
            serviceProvider: 'Changelly',
            estimatedAmount: estimatedAmount,
            rate: rate,
            minAmount: quoteData.minFrom || quoteData.min || quoteData.minAmount || null,
            maxAmount: quoteData.maxFrom || quoteData.max || quoteData.maxAmount || null,
            networkFee: quoteData.networkFee || null,
            fee: quoteData.fee || null,
            rawData: quoteData,
            logo: 'providers/changelly.png'
          };
        })
        .catch(err => {
          console.error("Changelly quote error:", err);
          return null;
        })
      );

      // 2. Exolix quote
      quotePromises.push(
        apiClient.post("/exolix/rate/", {
          coinFrom: fromCoin.toUpperCase(),
          networkFrom: fromCoin.toUpperCase(), // Using same as coin for simplicity
          coinTo: toCoin.toUpperCase(),
          networkTo: toCoin.toUpperCase(),
          amount: String(fromAmount),
          rateType: "float"
        })
        .then(res => {
          const quote = res.data?.quote;
          if (!quote || !quote.estimatedAmount) return null;

          return {
            provider: 'EXOLIX',
            serviceProvider: 'Exolix',
            estimatedAmount: quote.estimatedAmount,
            rate: quote.rate,
            minAmount: quote.minAmount,
            maxAmount: quote.maxAmount,
            networkFee: null,
            fee: null,
            rawData: quote,
            rateType: quote.rateType,
            logo: 'providers/exolix.png'
          };
        })
        .catch(err => {
          console.error("Exolix quote error:", err);
          return null;
        })
      );

      const results = await Promise.all(quotePromises);
      const validQuotes = results.filter(q => q !== null);

      if (validQuotes.length === 0) {
        setQuoteError("No quotes available for this pair. Please try a different amount or currency.");
        setToAmount("");
        setCurrentQuote(null);
        setRateInfo(null);
        setAvailableProviders([]);
        setSelectedProvider(null);
        setLoadingQuote(false);
        return;
      }

      setAvailableProviders(validQuotes);

      // Auto-select best rate or keep current provider if still available
      if (!selectedProvider) {
        // Select provider with best rate (highest estimated amount)
        const bestQuote = validQuotes.reduce((best, current) => 
          Number(current.estimatedAmount) > Number(best.estimatedAmount) ? current : best
        );
        setSelectedProvider(bestQuote);
      } else {
        // Keep same provider if it still exists in new quotes
        const stillExists = validQuotes.find(
          q => q.provider === selectedProvider.provider
        );
        if (stillExists) {
          setSelectedProvider(stillExists);
        } else {
          const bestQuote = validQuotes.reduce((best, current) => 
            Number(current.estimatedAmount) > Number(best.estimatedAmount) ? current : best
          );
          setSelectedProvider(bestQuote);
        }
      }

    } catch (err) {
      console.error("Exchange rate error:", err);
      setQuoteError("Unable to fetch exchange rates. Please try again.");
      setToAmount("");
      setCurrentQuote(null);
      setRateInfo(null);
      setAvailableProviders([]);
      setSelectedProvider(null);
    } finally {
      setLoadingQuote(false);
    }
  }, [fromAmount, fromCoin, toCoin, selectedProvider]);

  // Update toAmount and rateInfo when selectedProvider changes
  useEffect(() => {
    if (selectedProvider && fromAmount && Number(fromAmount) > 0) {
      setToAmount(String(selectedProvider.estimatedAmount));
      setRateInfo({
        rate: selectedProvider.rate,
        minAmount: selectedProvider.minAmount,
        maxAmount: selectedProvider.maxAmount,
        networkFee: selectedProvider.networkFee,
        fee: selectedProvider.fee,
      });
      setCurrentQuote(selectedProvider);
    }
  }, [selectedProvider, fromAmount]);

  useDebounce(fetchExchangeRate, 600, [fromAmount, fromCoin, toCoin]);

  // Swap coins
  const handleSwapCoins = () => {
    const tempCoin = fromCoin;
    const tempAmount = toAmount;
    
    setFromCoin(toCoin);
    setToCoin(tempCoin);
    setFromAmount(tempAmount);
    setToAmount("");
  };

  // Validate wallet address
  const validateWalletAddressFunc = async () => {
    if (!walletAddress.trim()) {
      setAddressValid(false);
      setAddressError(null);
      return;
    }

    setValidatingAddress(true);
    setAddressError(null);

    try {
      const isValidLocally = validateWalletAddress(walletAddress, toCoin);
      
      if (!isValidLocally) {
        setAddressValid(false);
        setAddressError("Invalid wallet address format for " + toCoin);
        setValidatingAddress(false);
        return;
      }

      const res = await apiClient.post("/users/api/changelly/validate-wallet/", {
        currency: toCoin.toLowerCase(),
        wallet_address: walletAddress,
      });

      const result = res.data?.result;
      const isValid = result?.result === true || result === true;

      setAddressValid(isValid);
      if (!isValid) {
        setAddressError("Invalid wallet address for " + toCoin);
      }
    } catch (err) {
      console.error("Validation error:", err);
      setAddressValid(false);
      setAddressError(err.response?.data?.error || "Unable to validate address");
    } finally {
      setValidatingAddress(false);
    }
  };

  useEffect(() => {
    if (walletAddress && currentStep === 2) {
      const timer = setTimeout(validateWalletAddressFunc, 800);
      return () => clearTimeout(timer);
    }
  }, [walletAddress, toCoin]);

  // Navigation
  const goToStep2 = () => {
    if (!fromAmount || Number(fromAmount) <= 0 || quoteError || !currentQuote) return;
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    if (!walletAddress || !addressValid) return;
    setCurrentStep(3);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setWalletAddress("");
        setAddressValid(null);
        setAddressError(null);
      }
      if (currentStep === 3) {
        setTransactionResult(null);
        setTransactionError(null);
      }
      if (currentStep === 4) {
        setTransactionStatus(null);
        setStatusError(null);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    }
  };

  // Create transaction based on selected provider
  const handleCreateTransaction = async () => {
    if (!fromAmount || !walletAddress || !addressValid || !selectedProvider) return;

    setCreatingTransaction(true);
    setTransactionError(null);

    try {
      const providerName = selectedProvider.provider.toUpperCase();
      let result;

      if (providerName === 'CHANGELLY') {
        // Changelly transaction
        const res = await apiClient.post("/users/api/changelly/create-transaction/", {
          from: fromCoin.toLowerCase(),
          to: toCoin.toLowerCase(),
          amount: String(fromAmount),
          wallet_address: walletAddress,
        });

        result = res.data?.result;
        if (!result) throw new Error("Invalid response from Changelly");

      } else if (providerName === 'EXOLIX') {
        // Exolix transaction
        const res = await apiClient.post("/exolix/create-transaction/", {
          coinFrom: fromCoin.toUpperCase(),
          networkFrom: fromCoin.toUpperCase(),
          coinTo: toCoin.toUpperCase(),
          networkTo: toCoin.toUpperCase(),
          amount: String(fromAmount),
          withdrawalAddress: walletAddress,
          rateType: selectedProvider.rateType || "float"
        });

        const exolixData = res.data?.transaction;
        if (!exolixData) throw new Error("Invalid response from Exolix");

        // Map Exolix response to match Changelly structure for UI consistency
        result = {
          id: exolixData.id,
          payinAddress: exolixData.depositAddress,
          payoutAddress: exolixData.withdrawalAddress,
          payinExtraId: exolixData.depositExtraId || null,
          amountFrom: exolixData.amount,
          amountTo: exolixData.amountTo,
          status: exolixData.status,
          provider: 'EXOLIX'
        };

      } else {
        throw new Error(`Unknown provider: ${providerName}`);
      }

      // Add provider info to result
      result.provider = providerName;
      setTransactionResult(result);

    } catch (err) {
      console.error("Transaction error:", err);
      setTransactionError(
        err.response?.data?.error || 
        err.response?.data?.message ||
        err.message ||
        "Unable to create transaction. Please try again."
      );
    } finally {
      setCreatingTransaction(false);
    }
  };

  // Check transaction status based on provider
  const checkTransactionStatus = async (transactionId, provider) => {
    try {
      const providerName = provider?.toUpperCase() || 'CHANGELLY';
      let result;

      if (providerName === 'CHANGELLY') {
        const res = await apiClient.post("/users/api/changelly/confirm-transaction/", {
          transaction_id: transactionId,
        });
        result = res.data?.result;

      } else if (providerName === 'EXOLIX') {
        const res = await apiClient.get(`/exolix/transaction/${transactionId}/`);
        const exolixData = res.data?.transaction;
        
        // Map Exolix status to Changelly-like structure
        result = {
          id: exolixData.id,
          status: exolixData.status,
          amountFrom: exolixData.amount,
          amountTo: exolixData.amountTo,
          payoutHash: exolixData.hashOut?.hash || null,
          payoutHashLink: exolixData.hashOut?.link || null,
          payinHash: exolixData.hashIn?.hash || null,
          provider: 'EXOLIX'
        };
      }

      if (!result) {
        throw new Error("Invalid response from server");
      }

      return result;
    } catch (err) {
      console.error("Status check error:", err);
      throw err;
    }
  };

  // Auto-poll transaction status when on step 3 (after payment sent)
  useEffect(() => {
    if (currentStep === 3 && transactionResult && !transactionError) {
      const transactionId = transactionResult.id || transactionResult.transactionId;
      const provider = transactionResult.provider || 'CHANGELLY';
      
      // Initial check after 5 seconds
      const initialTimeout = setTimeout(async () => {
        try {
          const status = await checkTransactionStatus(transactionId, provider);
          setTransactionStatus(status);
          
          // Check if complete based on provider
          const statusValue = status?.status || status;
          const isComplete = provider === 'EXOLIX'
            ? statusValue === 'success'
            : ['finished', 'success', 'completed'].includes(statusValue);
          
          if (isComplete) {
            setCurrentStep(4);
          }
        } catch (err) {
          console.error("Initial status check error:", err);
        }
      }, 5000);
      
      // Poll every 10 seconds
      const interval = setInterval(async () => {
        try {
          const status = await checkTransactionStatus(transactionId, provider);
          setTransactionStatus(status);
          
          // Move to step 4 if transaction is complete
          const statusValue = status?.status || status;
          const isComplete = provider === 'EXOLIX'
            ? statusValue === 'success'
            : ['finished', 'success', 'completed'].includes(statusValue);
          
          const isFailed = provider === 'EXOLIX'
            ? ['overdue', 'refund', 'refunded'].includes(statusValue)
            : ['failed', 'expired'].includes(statusValue);
          
          if (isComplete) {
            clearInterval(interval);
            setCurrentStep(4);
          } else if (isFailed) {
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 10000);

      setPollingInterval(interval);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [currentStep, transactionResult, transactionError]);

  const resetFlow = () => {
    setCurrentStep(1);
    setFromAmount("");
    setToAmount("");
    setWalletAddress("");
    setAddressValid(null);
    setAddressError(null);
    setTransactionResult(null);
    setTransactionError(null);
    setCurrentQuote(null);
    setQuoteError(null);
    setTransactionStatus(null);
    setStatusError(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const isTransactionComplete = () => {
    if (!transactionStatus) return false;
    
    const statusValue = transactionStatus?.status || transactionStatus;
    const provider = transactionResult?.provider || 'CHANGELLY';
    
    if (provider === 'EXOLIX') {
      return statusValue === 'success';
    } else {
      return ['finished', 'success', 'completed'].includes(statusValue);
    }
  };

  const { theme } = useContext(ThemeContext);

  return (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6 gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === step 
                ? theme === "dark" ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                : currentStep > step || (step === 4 && isTransactionComplete())
                  ? theme === "dark" ? "bg-green-600 text-white" : "bg-green-500 text-white"
                  : theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-300 text-gray-600"
            }`}>
              {currentStep > step || (step === 4 && isTransactionComplete()) ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 4 && <div className={`w-12 h-1 ${
              currentStep > step 
                ? theme === "dark" ? "bg-green-600" : "bg-green-500"
                : theme === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Amount & Pair Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 relative">
          <div className={`border rounded-2xl p-4 backdrop-blur-md relative z-30 ${
            theme === "dark" 
              ? "border-white/10 bg-gray-800/40" 
              : "border-gray-300 bg-white/60"
          }`}>
            <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Send</p>
            <div className="flex items-center justify-between">
              <input
                inputMode="decimal"
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className={`bg-transparent outline-none text-xl font-semibold w-full no-spinner ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />
              <CoinSelect 
                value={fromCoin} 
                onChange={setFromCoin}
                coins={swapCoins.length > 0 ? swapCoins : undefined}
                defaultSymbol="BTC"
                useExtraCoins={false}
              />
            </div>
          </div>

          <div className="flex justify-center relative z-10">
            <button
              onClick={handleSwapCoins}
              className={`p-2 rounded-full transition-all duration-200 hover:rotate-180 cursor-pointer ${
                theme === "dark" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              <ArrowDownUp className="text-white w-5 h-5" />
            </button>
          </div>

          <div className={`border rounded-2xl p-4 backdrop-blur-md relative z-20 ${
            theme === "dark" 
              ? "border-white/10 bg-gray-800/40" 
              : "border-gray-300 bg-white/60"
          }`}>
            <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              You Get (estimated)
            </p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={toAmount ? formatNumber(Number(toAmount), 8) : ""}
                readOnly
                placeholder="0.00"
                className={`bg-transparent outline-none text-xl font-semibold w-full no-spinner ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              />
              <CoinSelect 
                value={toCoin} 
                onChange={setToCoin}
                coins={swapCoins.length > 0 ? swapCoins : undefined}
                defaultSymbol="ETH"
                useExtraCoins={false}
              />
            </div>

            {loadingQuote && (
              <div className={`flex items-center mt-2 text-sm ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`}>
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Calculating rate...
              </div>
            )}

            {!loadingQuote && rateInfo && (
              <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <div>Rate: <span className="font-medium">1 {fromCoin} ≈ {formatNumber(rateInfo.rate, 6)} {toCoin}</span></div>
                {rateInfo.networkFee && (
                  <div className="mt-1">Network Fee: <span className="font-medium">{formatNumber(Number(rateInfo.networkFee), 8)} {toCoin}</span></div>
                )}
                {rateInfo.minAmount && (
                  <div className={`mt-1 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                    Min: <span className="font-medium">{formatNumber(Number(rateInfo.minAmount), 8)} {fromCoin}</span>
                  </div>
                )}
              </div>
            )}

            {quoteError && (
              <div className={`flex items-start gap-2 mt-2 text-xs p-2 rounded ${
                theme === "dark" 
                  ? "text-red-400 bg-red-500/10" 
                  : "text-red-700 bg-red-100"
              }`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{quoteError}</span>
              </div>
            )}
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
            disabled={!fromAmount || Number(fromAmount) <= 0 || quoteError || loadingQuote || !currentQuote}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors duration-200 ${
              fromAmount && Number(fromAmount) > 0 && !quoteError && !loadingQuote && currentQuote
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
            }`}>Enter Recipient Address</h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Where should we send your {toCoin}?
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
              }`}>{toCoin} Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter ${toCoin} address`}
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

              {!validatingAddress && addressError && (
                <div className={`flex items-center gap-2 mt-2 text-xs ${
                  theme === "dark" ? "text-red-400" : "text-red-600"
                }`}>
                  <AlertCircle className="w-3 h-3" /> {addressError}
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

            <div className={`rounded-xl p-4 space-y-2 ${
              theme === "dark" ? "bg-gray-800/60" : "bg-gray-100"
            }`}>
              <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Transaction Summary
              </p>
              <div className="flex justify-between text-sm">
                <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>You send</span>
                <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatNumber(Number(fromAmount), 8)} {fromCoin}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>You get (estimated)</span>
                <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatNumber(Number(toAmount), 8)} {toCoin}
                </span>
              </div>
              {rateInfo && (
                <div className={`flex justify-between text-xs pt-2 border-t ${
                  theme === "dark" ? "text-gray-400 border-white/10" : "text-gray-600 border-gray-300"
                }`}>
                  <span>Exchange rate</span>
                  <span>1 {fromCoin} ≈ {formatNumber(rateInfo.rate, 6)} {toCoin}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={goToStep3}
            disabled={!walletAddress || !addressValid}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
              walletAddress && addressValid
                ? theme === "dark" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "bg-indigo-500 hover:bg-indigo-600"
                : theme === "dark" 
                  ? "bg-gray-700 cursor-not-allowed opacity-60" 
                  : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            Continue to Confirmation
          </button>
        </div>
      )}

      {/* STEP 3: Create Transaction & Await Payment */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {!transactionResult && !transactionError && (
            <>
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
                }`}>Confirm Your Swap</h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Please review the details before proceeding
                </p>
              </div>

              <div className={`rounded-xl p-5 space-y-4 ${
                theme === "dark" ? "bg-gray-800/60" : "bg-gray-100"
              }`}>
                <div className={`flex items-center justify-between pb-4 border-b ${
                  theme === "dark" ? "border-white/10" : "border-gray-300"
                }`}>
                  <div className="text-center flex-1">
                    <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Send</p>
                    <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(Number(fromAmount), 8)}
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{fromCoin}</p>
                  </div>
                  <ArrowDownUp className={`w-6 h-6 mx-4 ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  }`} />
                  <div className="text-center flex-1">
                    <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>You Get</p>
                    <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(Number(toAmount), 8)}
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{toCoin}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Recipient Address</span>
                    <span className={`font-mono text-xs break-all max-w-[60%] text-right ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
                    </span>
                  </div>
                  {rateInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Exchange Rate</span>
                        <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                          1 {fromCoin} ≈ {formatNumber(rateInfo.rate, 6)} {toCoin}
                        </span>
                      </div>
                      {rateInfo.networkFee && (
                        <div className="flex justify-between">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Network Fee</span>
                          <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                            {formatNumber(Number(rateInfo.networkFee), 8)} {toCoin}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className={`border rounded-xl p-3 ${
                theme === "dark" 
                  ? "bg-blue-500/10 border-blue-500/20" 
                  : "bg-blue-50 border-blue-300"
              }`}>
                <p className={`text-xs ${theme === "dark" ? "text-blue-200" : "text-blue-800"}`}>
                  💡 After confirming, you'll receive a deposit address. Send your {fromCoin} to complete the swap.
                </p>
              </div>

              <button
                onClick={handleCreateTransaction}
                disabled={creatingTransaction}
                className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
                  creatingTransaction
                    ? theme === "dark" 
                      ? "bg-gray-700 cursor-not-allowed opacity-60" 
                      : "bg-gray-400 cursor-not-allowed opacity-60"
                    : theme === "dark" 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "bg-indigo-500 hover:bg-indigo-600"
                }`}
              >
                {creatingTransaction ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Transaction...
                  </span>
                ) : (
                  "Create Swap Transaction"
                )}
              </button>
            </>
          )}

          {/* Transaction Created - Awaiting Payment */}
          {transactionResult && !transactionError && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className={`text-xl font-bold mt-10 mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {(() => {
                    const provider = transactionResult?.provider || 'CHANGELLY';
                    const statusValue = typeof transactionStatus === 'string' 
                      ? transactionStatus.toLowerCase() 
                      : (transactionStatus?.status || transactionStatus?.result || '').toLowerCase();
                    
                    const isComplete = provider === 'EXOLIX'
                      ? statusValue === 'success'
                      : ['finished', 'success', 'completed'].includes(statusValue);
                    
                    return isComplete ? '🎉 Transaction Complete!' : 'Send Payment to Complete Swap';
                  })()}
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {(() => {
                    const provider = transactionResult?.provider || 'CHANGELLY';
                    const statusValue = typeof transactionStatus === 'string' 
                      ? transactionStatus.toLowerCase() 
                      : (transactionStatus?.status || transactionStatus?.result || '').toLowerCase();
                    
                    const isComplete = provider === 'EXOLIX'
                      ? statusValue === 'success'
                      : ['finished', 'success', 'completed'].includes(statusValue);
                    
                    return isComplete 
                      ? 'Your swap has been processed successfully'
                      : 'Transfer the exact amount to the address below';
                  })()}
                </p>
              </div>

              {/* Payment Details Card */}
              <div className={`rounded-2xl p-5 space-y-4 ${
                theme === "dark" ? "bg-gray-800/60 backdrop-blur-md" : "bg-gray-100"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Payment Information</h4>
                </div>

                <div>
                  <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Transaction ID
                  </p>
                  <div className={`p-3 rounded-lg ${
                    theme === "dark" ? "bg-gray-900/50" : "bg-white"
                  }`}>
                    <p className={`text-xs font-mono break-all ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transactionResult.id || transactionResult.transactionId}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Deposit Address ({fromCoin})
                    </p>
                    <button
                      onClick={() => copyToClipboard(transactionResult.payinAddress || transactionResult.depositAddress)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
                        copiedAddress
                          ? theme === "dark"
                            ? "bg-green-600/20 text-green-300"
                            : "bg-green-100 text-green-700"
                          : theme === "dark" 
                            ? "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30" 
                            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                      {copiedAddress ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${
                    theme === "dark" 
                      ? "bg-gray-900/50 border-indigo-500/30" 
                      : "bg-white border-indigo-300"
                  }`}>
                    <p className={`text-sm font-mono break-all ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transactionResult.payinAddress || transactionResult.depositAddress}
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}>
                  <div>
                    <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Amount to Send
                    </p>
                    <p className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(Number(fromAmount), 8)} {fromCoin}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      You'll Receive
                    </p>
                    <p className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(Number(toAmount), 8)} {toCoin}
                    </p>
                  </div>
                </div>

                {transactionResult.payinExtraId && (
                  <div className={`p-3 rounded-lg border ${
                    theme === "dark" 
                      ? "bg-yellow-600/10 border-yellow-500/30" 
                      : "bg-yellow-50 border-yellow-300"
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${
                      theme === "dark" ? "text-yellow-300" : "text-yellow-800"
                    }`}>⚠️ Extra ID / Memo (Required)</p>
                    <p className={`text-sm font-mono ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transactionResult.payinExtraId}
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction Status Tracker */}
              {transactionStatus && (
                <div className={`rounded-2xl p-5 ${
                  theme === "dark" 
                    ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-white/5" 
                    : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>Transaction Progress</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      ['finished', 'success', 'completed'].includes(typeof transactionStatus === 'string' ? transactionStatus.toLowerCase() : (transactionStatus?.status || transactionStatus?.result || '').toLowerCase())
                        ? theme === "dark" 
                          ? "bg-green-600/20 text-green-300" 
                          : "bg-green-100 text-green-700"
                        : theme === "dark"
                          ? "bg-indigo-600/20 text-indigo-300"
                          : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {(typeof transactionStatus === 'string' ? transactionStatus : (transactionStatus?.status || transactionStatus?.result || 'processing')).replace('_', ' ')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(() => {
                      const provider = transactionResult?.provider || 'CHANGELLY';
                      const currentStatusValue = typeof transactionStatus === 'string' 
                        ? transactionStatus.toLowerCase() 
                        : (transactionStatus?.status || transactionStatus?.result || '').toLowerCase();
                      
                      // Define steps based on provider
                      const steps = provider === 'EXOLIX' 
                        ? [
                            { key: 'wait', label: 'Waiting for Payment', icon: Clock },
                            { key: 'confirmation', label: 'Confirming Deposit', icon: Loader2 },
                            { key: 'exchanging', label: 'Exchanging Currencies', icon: ArrowDownUp },
                            { key: 'sending', label: 'Sending to Your Wallet', icon: Check }
                          ]
                        : [
                            { key: 'waiting', label: 'Waiting for Payment', icon: Clock },
                            { key: 'confirming', label: 'Confirming Transaction', icon: Loader2 },
                            { key: 'exchanging', label: 'Exchanging Currencies', icon: ArrowDownUp },
                            { key: 'sending', label: 'Sending to Your Wallet', icon: Check }
                          ];
                      
                      const completedStatuses = provider === 'EXOLIX' 
                        ? ['success'] 
                        : ['finished', 'success', 'completed'];
                      
                      const currentIndex = steps.findIndex(s => s.key === currentStatusValue);
                      
                      return steps.map((step, idx) => {
                        const isActive = currentStatusValue === step.key;
                        const isPassed = currentIndex > idx || completedStatuses.includes(currentStatusValue);
                        const Icon = step.icon;
                        
                        return (
                          <div key={step.key} className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? theme === "dark" 
                                ? "bg-indigo-600/20 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20" 
                                : "bg-indigo-50 border-2 border-indigo-400 shadow-lg shadow-indigo-400/20"
                              : isPassed
                                ? theme === "dark"
                                  ? "bg-green-600/10 border border-green-500/30"
                                  : "bg-green-50 border border-green-300"
                                : theme === "dark"
                                  ? "bg-gray-800/30 border border-gray-700/30"
                                  : "bg-gray-100 border border-gray-200"
                          }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              isActive 
                                ? theme === "dark" 
                                  ? "bg-indigo-600 shadow-lg shadow-indigo-500/50" 
                                  : "bg-indigo-500 shadow-lg shadow-indigo-400/50"
                                : isPassed
                                  ? theme === "dark" ? "bg-green-600" : "bg-green-500"
                                  : theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                            }`}>
                              {isPassed && !isActive ? (
                                <Check className="w-5 h-5 text-white" />
                              ) : isActive ? (
                                <Icon className={`w-5 h-5 text-white ${step.key !== 'wait' && step.key !== 'waiting' ? 'animate-spin' : ''}`} />
                              ) : (
                                <div className={`w-2 h-2 rounded-full ${
                                  theme === "dark" ? "bg-gray-500" : "bg-gray-400"
                                }`} />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`text-sm font-medium transition-colors ${
                                isActive 
                                  ? theme === "dark" ? "text-indigo-300" : "text-indigo-700"
                                  : isPassed
                                    ? theme === "dark" ? "text-green-300" : "text-green-700"
                                    : theme === "dark" ? "text-gray-500" : "text-gray-500"
                              }`}>
                                {step.label}
                              </p>
                            </div>
                            
                            {isActive && (
                              <div className="flex gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                  theme === "dark" ? "bg-indigo-400" : "bg-indigo-600"
                                }`} style={{ animationDelay: '0ms' }} />
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                  theme === "dark" ? "bg-indigo-400" : "bg-indigo-600"
                                }`} style={{ animationDelay: '150ms' }} />
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                  theme === "dark" ? "bg-indigo-400" : "bg-indigo-600"
                                }`} style={{ animationDelay: '300ms' }} />
                              </div>
                            )}
                            
                            {isActive && (
                              <div className={`absolute inset-0 rounded-xl animate-pulse ${
                                theme === "dark" 
                                  ? "bg-indigo-500/10" 
                                  : "bg-indigo-400/10"
                              }`} style={{ animationDuration: '2s' }} />
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Info Banner */}
              {!transactionStatus && (
                <div className={`border rounded-xl p-4 ${
                  theme === "dark" 
                    ? "bg-blue-500/10 border-blue-500/20" 
                    : "bg-blue-50 border-blue-300"
                }`}>
                  <p className={`text-sm ${theme === "dark" ? "text-blue-200" : "text-blue-800"}`}>
                    💡 Send <strong>{formatNumber(Number(fromAmount), 8)} {fromCoin}</strong> to the address above. The exchange will begin automatically once your payment is detected.
                  </p>
                </div>
              )}

              {/* Completed - Show Details Button */}
              {(() => {
                const provider = transactionResult?.provider || 'CHANGELLY';
                const statusValue = typeof transactionStatus === 'string' 
                  ? transactionStatus.toLowerCase() 
                  : (transactionStatus?.status || transactionStatus?.result || '').toLowerCase();
                
                const isComplete = provider === 'EXOLIX'
                  ? statusValue === 'success'
                  : ['finished', 'success', 'completed'].includes(statusValue);
                
                return isComplete && (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
                      theme === "dark" 
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" 
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> View Transaction Details
                    </span>
                  </button>
                );
              })()}

              {/* Back button */}
              <button
                onClick={goBack}
                disabled={(() => {
                  if (!transactionStatus) return false;
                  
                  const provider = transactionResult?.provider || 'CHANGELLY';
                  const statusValue = (transactionStatus?.status || '').toLowerCase();
                  
                  const completedStatuses = provider === 'EXOLIX'
                    ? ['success', 'overdue', 'refund', 'refunded']
                    : ['finished', 'success', 'completed', 'failed', 'expired'];
                  
                  return transactionStatus && !completedStatuses.includes(statusValue);
                })()}
                className={`w-full py-3 font-semibold rounded-2xl transition-colors ${
                  (() => {
                    if (!transactionStatus) {
                      return theme === "dark" 
                        ? "bg-gray-700 hover:bg-gray-600 text-white" 
                        : "bg-gray-300 hover:bg-gray-400 text-gray-900";
                    }
                    
                    const provider = transactionResult?.provider || 'CHANGELLY';
                    const statusValue = (transactionStatus?.status || '').toLowerCase();
                    
                    const completedStatuses = provider === 'EXOLIX'
                      ? ['success', 'overdue', 'refund', 'refunded']
                      : ['finished', 'success', 'completed', 'failed', 'expired'];
                    
                    const isInProgress = !completedStatuses.includes(statusValue);
                    
                    return isInProgress
                      ? theme === "dark"
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                      : theme === "dark" 
                        ? "bg-gray-700 hover:bg-gray-600 text-white" 
                        : "bg-gray-300 hover:bg-gray-400 text-gray-900";
                  })()}
                `}
              >
                {(() => {
                  if (!transactionStatus) return 'Cancel & Go Back';
                  
                  const provider = transactionResult?.provider || 'CHANGELLY';
                  const statusValue = (transactionStatus?.status || '').toLowerCase();
                  
                  const completedStatuses = provider === 'EXOLIX'
                    ? ['success', 'overdue', 'refund', 'refunded']
                    : ['finished', 'success', 'completed', 'failed', 'expired'];
                  
                  const isInProgress = !completedStatuses.includes(statusValue);
                  
                  return isInProgress ? 'Transaction in Progress...' : 'Cancel & Go Back';
                })()}
              </button>
            </div>
          )}

          {/* Transaction Error */}
          {transactionError && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  theme === "dark" ? "bg-red-600" : "bg-red-500"
                }`}>
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>Transaction Failed</h3>
                <p className={`text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                  {transactionError}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className={`flex-1 py-3 font-semibold rounded-2xl transition-colors ${
                    theme === "dark" 
                      ? "bg-gray-700 hover:bg-gray-600 text-white" 
                      : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                  }`}
                >
                  Go Back
                </button>
                <button
                  onClick={handleCreateTransaction}
                  disabled={creatingTransaction}
                  className={`flex-1 py-3 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 ${
                    theme === "dark" 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "bg-indigo-500 hover:bg-indigo-600"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Transaction Complete */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className={`w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
              theme === "dark" 
                ? "from-green-500 to-green-600 shadow-green-500/50" 
                : "from-green-400 to-green-500 shadow-green-400/50"
            }`}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>Swap Complete!</h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Your transaction has been successfully processed
            </p>
          </div>

          {transactionStatus && (
            <div className={`rounded-xl p-5 space-y-4 ${
              theme === "dark" ? "bg-gray-800/60" : "bg-gray-100"
            }`}>
              <div>
                <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Transaction Status
                </p>
                <div className={`p-3 rounded-lg ${
                  theme === "dark" ? "bg-gray-900/50" : "bg-white"
                }`}>
                  <p className={`text-sm font-semibold capitalize ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}>
                    {transactionStatus.status || 'Completed'}
                  </p>
                </div>
              </div>

              {transactionStatus.payoutHash && (
                <div>
                  <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Payout Transaction Hash
                  </p>
                  <div className={`p-3 rounded-lg ${
                    theme === "dark" ? "bg-gray-900/50" : "bg-white"
                  }`}>
                    <p className={`text-sm font-mono break-all ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transactionStatus.payoutHash}
                    </p>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-2 gap-4 text-sm pt-4 border-t ${
                theme === "dark" ? "border-white/10" : "border-gray-300"
              }`}>
                <div>
                  <p className={`mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    You Sent
                  </p>
                  <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {formatNumber(Number(fromAmount), 8)} {fromCoin}
                  </p>
                </div>
                <div>
                  <p className={`mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    You Received
                  </p>
                  <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {formatNumber(Number(toAmount), 8)} {toCoin}
                  </p>
                </div>
              </div>

              {transactionStatus.payoutHashLink && (
                <a
                  href={transactionStatus.payoutHashLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center text-sm transition ${
                    theme === "dark" 
                      ? "text-indigo-400 hover:text-indigo-300" 
                      : "text-indigo-600 hover:text-indigo-700"
                  }`}
                >
                  View on Block Explorer →
                </a>
              )}
            </div>
          )}

          <div className={`border rounded-xl p-3 ${
            theme === "dark" 
              ? "bg-green-500/10 border-green-500/20" 
              : "bg-green-50 border-green-300"
          }`}>
            <p className={`text-xs ${theme === "dark" ? "text-green-200" : "text-green-800"}`}>
              ✅ Your {toCoin} has been sent to your wallet address. It may take a few minutes to appear in your wallet depending on network confirmation times.
            </p>
          </div>

          <button
            onClick={resetFlow}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors ${
              theme === "dark" 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            Start New Swap
          </button>
        </div>
      )}
    </>
  );
}