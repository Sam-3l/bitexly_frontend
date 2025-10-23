import { useState, useEffect, useCallback, useContext } from "react";
import { ArrowDownUp, Loader2, ChevronLeft, Check, AlertCircle, RefreshCw, Clock, Copy } from "lucide-react";
import { validateWalletAddress } from "../../utils/walletValidator";
import ThemeContext from "../../context/ThemeContext";
import CoinSelect from "./CoinSelect";
import apiClient from "../../utils/apiClient";

function useDebounce(callback, delay, deps) {
  useEffect(() => {
    if (!deps || deps.length === 0) return;
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export default function SwapFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  // Coins data from Changelly
  const [changellyCoins, setChangellyCoins] = useState([]);
  const [loadingChangellyCoins, setLoadingChangellyCoins] = useState(true);

  // Step 1: Amount & Pair
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("BTC");
  const [toCoin, setToCoin] = useState("ETH");

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

  // Fetch Changelly coins
  useEffect(() => {
    const fetchChangellyCoins = async () => {
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

        setChangellyCoins(formatted);
      } catch (err) {
        console.error("Failed to fetch Changelly coins:", err);
        setChangellyCoins([]);
      } finally {
        setLoadingChangellyCoins(false);
      }
    };

    fetchChangellyCoins();
  }, []);

  // Fetch exchange rate
  const fetchExchangeRate = useCallback(async () => {
    if (!fromCoin || !toCoin || !fromAmount || Number(fromAmount) <= 0) {
      setToAmount("");
      setCurrentQuote(null);
      setRateInfo(null);
      return;
    }

    setQuoteError(null);
    setLoadingQuote(true);

    try {
      const res = await apiClient.post("/users/api/changelly/exchange-amount/", {
        from: fromCoin.toLowerCase(),
        to: toCoin.toLowerCase(),
        amount: String(fromAmount),
      });

      const result = res.data?.result;
      
      if (!result) {
        throw new Error("Invalid response from server");
      }

      let quoteData = result;
      if (Array.isArray(result) && result.length > 0) {
        quoteData = result[0];
      }

      const estimatedAmount = quoteData.amountTo || quoteData.result || quoteData.estimatedAmount;
      
      if (!estimatedAmount) {
        throw new Error("No exchange amount returned");
      }

      setToAmount(String(estimatedAmount));
      setCurrentQuote(quoteData);
      
      const rate = Number(estimatedAmount) / Number(fromAmount);
      setRateInfo({
        rate: rate,
        minAmount: quoteData.minFrom || quoteData.min || quoteData.minAmount || null,
        maxAmount: quoteData.maxFrom || quoteData.max || quoteData.maxAmount || null,
        networkFee: quoteData.networkFee || null,
        fee: quoteData.fee || null,
      });

    } // Replace the catch block in fetchExchangeRate:
    catch (err) {
      console.error("Exchange rate error:", err);
      
      let errorMessage = "Unable to fetch exchange rate. Please try again.";
      
      // Check if amount is below minimum
      if (rateInfo?.minAmount && Number(fromAmount) < Number(rateInfo.minAmount)) {
        errorMessage = `Amount is below minimum. Minimum: ${formatNumber(Number(rateInfo.minAmount), 8)} ${fromCoin}`;
      }
      // Check if amount is above maximum
      else if (rateInfo?.maxAmount && Number(fromAmount) > Number(rateInfo.maxAmount)) {
        errorMessage = `Amount exceeds maximum. Maximum: ${formatNumber(Number(rateInfo.maxAmount), 8)} ${fromCoin}`;
      }
      // Check response for min/max info even if rateInfo not set
      else if (err.response?.data?.result) {
        const result = err.response.data.result;
        const resultData = Array.isArray(result) ? result[0] : result;
        
        if (resultData?.minFrom && Number(fromAmount) < Number(resultData.minFrom)) {
          errorMessage = `Amount is below minimum. Minimum: ${formatNumber(Number(resultData.minFrom), 8)} ${fromCoin}`;
        } else if (resultData?.maxFrom && Number(fromAmount) > Number(resultData.maxFrom)) {
          errorMessage = `Amount exceeds maximum. Maximum: ${formatNumber(Number(resultData.maxFrom), 8)} ${fromCoin}`;
        }
      }
      
      setQuoteError(err.response?.data?.error || errorMessage);
      setToAmount("");
      setCurrentQuote(null);
      setRateInfo(null);
    } finally {
      setLoadingQuote(false);
    }
  }, [fromAmount, fromCoin, toCoin]);

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

  // Create transaction
  const handleCreateTransaction = async () => {
    if (!fromAmount || !walletAddress || !addressValid) return;

    setCreatingTransaction(true);
    setTransactionError(null);

    try {
      const res = await apiClient.post("/users/api/changelly/create-transaction/", {
        from: fromCoin.toLowerCase(),
        to: toCoin.toLowerCase(),
        amount: String(fromAmount),
        wallet_address: walletAddress,
      });

      const result = res.data?.result;
      
      if (!result) {
        throw new Error("Invalid response from server");
      }

      setTransactionResult(result);
    } catch (err) {
      console.error("Transaction error:", err);
      setTransactionError(err.response?.data?.error || "Unable to create transaction. Please try again.");
    } finally {
      setCreatingTransaction(false);
    }
  };

  // Check transaction status
  const checkTransactionStatus = async (transactionId) => {
    try {
      const res = await apiClient.post("/users/api/changelly/confirm-transaction/", {
        transaction_id: transactionId,
      });

      const result = res.data?.result;
      
      if (!result) {
        throw new Error("Invalid response from server");
      }

      return result;
    } catch (err) {
      console.error("Status check error:", err);
      throw err;
    }
  };

  // Confirm transaction (manual check)
  const handleConfirmTransaction = async () => {
    if (!transactionResult?.id && !transactionResult?.transactionId) return;
  
    setConfirmingTransaction(true);
    setStatusError(null);
    setConfirmCountdown(15);
  
    try {
      const transactionId = transactionResult.id || transactionResult.transactionId;
      
      // Countdown from 15 to 0
      for (let i = 14; i >= 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConfirmCountdown(i);
      }
      
      const status = await checkTransactionStatus(transactionId);
      
      setTransactionStatus(status);
      
      // If status is complete, move to step 4
      const statusValue = status?.status || status;
      if (statusValue === 'finished' || statusValue === 'success' || statusValue === 'completed') {
        setCurrentStep(4);
      } else if (statusValue === 'failed' || statusValue === 'expired') {
        setStatusError(`Transaction ${statusValue}. Please try again or contact support.`);
      } else if (statusValue === 'waiting' || statusValue === 'confirming' || statusValue === 'exchanging' || statusValue === 'sending') {
        setStatusError(`Transaction is still processing (${statusValue}). Please wait a few more minutes and try again.`);
      } else {
        setStatusError(`Payment not detected yet. Please ensure you sent the exact amount to the correct address, then try again in a few minutes.`);
      }
    } catch (err) {
      console.error("Confirmation error:", err);
      setStatusError("Unable to verify transaction status. Please wait a few minutes and try again, or contact support if the issue persists.");
    } finally {
      setConfirmingTransaction(false);
      setConfirmCountdown(0);
    }
  };

  // Auto-poll transaction status when on step 4
  useEffect(() => {
    if (currentStep === 4 && transactionResult) {
      const transactionId = transactionResult.id || transactionResult.transactionId;
      
      // Poll every 10 seconds
      const interval = setInterval(async () => {
        try {
          const status = await checkTransactionStatus(transactionId);
          setTransactionStatus(status);
          
          // Stop polling if transaction is complete or failed
          const statusValue = status?.status || status;
          if (statusValue === 'finished' || statusValue === 'success' || statusValue === 'completed' || 
              statusValue === 'failed' || statusValue === 'expired') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 10000);

      setPollingInterval(interval);

      return () => clearInterval(interval);
    }
  }, [currentStep, transactionResult]);

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
    const statusValue = transactionStatus?.status || transactionStatus;
    return statusValue === 'finished' || statusValue === 'success' || statusValue === 'completed';
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
                coins={changellyCoins.length > 0 ? changellyCoins : undefined}
                defaultSymbol="BTC"
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
                coins={changellyCoins.length > 0 ? changellyCoins : undefined}
                defaultSymbol="ETH"
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
                  <div className="mt-1">Network Fee: <span className="font-medium">{formatNumber(Number(rateInfo.networkFee), 8)} {fromCoin}</span></div>
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
                            {formatNumber(Number(rateInfo.networkFee), 8)} {fromCoin}
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
                <div className={`w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                  theme === "dark" 
                    ? "from-indigo-500 to-indigo-600 shadow-indigo-500/50" 
                    : "from-indigo-400 to-indigo-500 shadow-indigo-400/50"
                }`}>
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>Send Your {fromCoin}</h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Transfer funds to the address below to complete your swap
                </p>
              </div>

              <div className={`rounded-xl p-5 space-y-4 ${
                theme === "dark" ? "bg-gray-800/60" : "bg-gray-100"
              }`}>
                <div>
                  <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Transaction ID
                  </p>
                  <div className={`p-3 rounded-lg ${
                    theme === "dark" ? "bg-gray-900/50" : "bg-white"
                  }`}>
                    <p className={`text-sm font-mono break-all ${
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
                      className={`flex items-center gap-1 text-xs transition ${
                        theme === "dark" 
                          ? "text-indigo-400 hover:text-indigo-300" 
                          : "text-indigo-600 hover:text-indigo-700"
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

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={`mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Amount to Send
                    </p>
                    <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(Number(fromAmount), 8)} {fromCoin}
                    </p>
                  </div>
                  <div>
                    <p className={`mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      You Will Receive
                    </p>
                    <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(Number(toAmount), 8)} {toCoin}
                    </p>
                  </div>
                </div>

                {transactionResult.payinExtraId && (
                  <div>
                    <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Extra ID / Memo (Required)
                    </p>
                    <div className={`p-3 rounded-lg border ${
                      theme === "dark" 
                        ? "bg-gray-900/50 border-yellow-500/30" 
                        : "bg-white border-yellow-400"
                    }`}>
                      <p className={`text-sm font-mono ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {transactionResult.payinExtraId}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`border rounded-xl p-3 ${
                theme === "dark" 
                  ? "bg-yellow-500/10 border-yellow-500/20" 
                  : "bg-yellow-50 border-yellow-300"
              }`}>
                <p className={`text-xs mb-2 font-semibold ${
                  theme === "dark" ? "text-yellow-200" : "text-yellow-800"
                }`}>⚠️ Important Instructions:</p>
                <ul className={`text-xs space-y-1 list-disc list-inside ${
                  theme === "dark" ? "text-yellow-200" : "text-yellow-800"
                }`}>
                  <li>Send exactly {formatNumber(Number(fromAmount), 8)} {fromCoin} to the deposit address above</li>
                  <li>Sending a different amount may result in delays or loss of funds</li>
                  {transactionResult.payinExtraId && (
                    <li>Don't forget to include the Extra ID/Memo when sending</li>
                  )}
                  <li>After sending, click "Confirm Transaction" below to verify completion</li>
                </ul>
              </div>

              {statusError && (
                <div className={`border rounded-xl p-3 ${
                  theme === "dark" 
                    ? "bg-red-500/10 border-red-500/20" 
                    : "bg-red-50 border-red-300"
                }`}>
                  <p className={`text-xs ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>
                    {statusError}
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirmTransaction}
                disabled={confirmingTransaction}
                className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
                  confirmingTransaction
                    ? theme === "dark" 
                      ? "bg-gray-700 cursor-not-allowed opacity-60" 
                      : "bg-gray-400 cursor-not-allowed opacity-60"
                    : theme === "dark" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {confirmingTransaction ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> 
                    {confirmCountdown > 0 
                      ? `Checking payment... (${confirmCountdown}s)` 
                      : "Verifying transaction..."
                    }
                  </span>
                ) : (
                  "Confirm Transaction"
                )}
              </button>

              <button
                onClick={goBack}
                className={`w-full py-3 font-semibold rounded-2xl transition-colors ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                }`}
              >
                Go Back
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