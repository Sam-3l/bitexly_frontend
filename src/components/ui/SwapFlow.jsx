import { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, Loader2, ChevronLeft, Check, AlertCircle, RefreshCw } from "lucide-react";
import { validateWalletAddress } from "../../utils/walletValidator";
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

  // Step 3: Confirm & Execute
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [transactionError, setTransactionError] = useState(null);

  const formatNumber = (n, decimals = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    const num = Number(n);
    return num >= 1
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  // Fetch Changelly coins
  useEffect(() => {
    const fetchChangellyCoins = async () => {
      try {
        const res = await apiClient.get("/users/api/changelly/get-coins/");
        const coinsList = res.data?.result || [];
        
        // Format coins to match CoinSelect component structure
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

      // Handle nested result structure: result: [{...}]
      let quoteData = result;
      if (Array.isArray(result) && result.length > 0) {
        quoteData = result[0];
      }

      // Extract the relevant data
      const estimatedAmount = quoteData.amountTo || quoteData.result || quoteData.estimatedAmount;
      
      if (!estimatedAmount) {
        throw new Error("No exchange amount returned");
      }

      setToAmount(String(estimatedAmount));
      setCurrentQuote(quoteData);
      
      // Calculate rate and extract fees
      const rate = Number(estimatedAmount) / Number(fromAmount);
      setRateInfo({
        rate: rate,
        minAmount: quoteData.minFrom || quoteData.min || quoteData.minAmount || null,
        maxAmount: quoteData.maxFrom || quoteData.max || quoteData.maxAmount || null,
        networkFee: quoteData.networkFee || null,
        fee: quoteData.fee || null,
      });

    } catch (err) {
      console.error("Exchange rate error:", err);
      setQuoteError(err.response?.data?.error || err.message || "Unable to fetch exchange rate. Please try again.");
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
      // Use local validation first
      const isValidLocally = validateWalletAddress(walletAddress, toCoin);
      
      if (!isValidLocally) {
        setAddressValid(false);
        setAddressError("Invalid wallet address format for " + toCoin);
        setValidatingAddress(false);
        return;
      }

      // Then verify with backend
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
  };

  return (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6 gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === step ? "bg-indigo-600 text-white" : 
              currentStep > step || (currentStep === 3 && transactionResult) ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"
            }`}>
              {currentStep > step || (step === 3 && transactionResult) ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 3 && <div className={`w-12 h-1 ${currentStep > step ? "bg-green-600" : "bg-gray-700"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Amount & Pair Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 relative">
          {/* You Send */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">You Send</p>
            <div className="flex items-center justify-between">
              <input
                inputMode="decimal"
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect 
                value={fromCoin} 
                onChange={setFromCoin}
                coins={changellyCoins.length > 0 ? changellyCoins : undefined}
                defaultSymbol="BTC"
              />
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center relative z-10">
            <button
              onClick={handleSwapCoins}
              className="p-2 bg-indigo-600 rounded-full transition-all duration-200 hover:bg-indigo-700 hover:rotate-180 cursor-pointer"
            >
              <ArrowDownUp className="text-white w-5 h-5" />
            </button>
          </div>

          {/* You Get */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">You Get (estimated)</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={toAmount ? formatNumber(Number(toAmount), 8) : ""}
                readOnly
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect 
                value={toCoin} 
                onChange={setToCoin}
                coins={changellyCoins.length > 0 ? changellyCoins : undefined}
                defaultSymbol="ETH"
              />
            </div>

            {loadingQuote && (
              <div className="flex items-center mt-2 text-sm text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Calculating rate...
              </div>
            )}

            {!loadingQuote && rateInfo && (
              <div className="mt-2 text-xs text-gray-300">
                <div>Rate: <span className="font-medium">1 {fromCoin} ≈ {formatNumber(rateInfo.rate, 6)} {toCoin}</span></div>
                {rateInfo.networkFee && (
                  <div className="mt-1">Network Fee: <span className="font-medium">{formatNumber(Number(rateInfo.networkFee), 8)} {fromCoin}</span></div>
                )}
                {rateInfo.minAmount && (
                  <div className="mt-1 text-yellow-300">Min: <span className="font-medium">{formatNumber(Number(rateInfo.minAmount), 8)} {fromCoin}</span></div>
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
            disabled={!fromAmount || Number(fromAmount) <= 0 || quoteError || loadingQuote || !currentQuote}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors duration-200 ${
              fromAmount && Number(fromAmount) > 0 && !quoteError && !loadingQuote && currentQuote
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
            <h3 className="text-xl font-bold text-white mb-2">Enter Recipient Address</h3>
            <p className="text-sm text-gray-400">Where should we send your {toCoin}?</p>
          </div>

          <div className="space-y-4">
            <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4">
              <label className="text-xs text-gray-400 block mb-2">{toCoin} Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter ${toCoin} address`}
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

              {!validatingAddress && addressError && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" /> {addressError}
                </div>
              )}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-xs text-yellow-200">⚠️ Double-check your address. Transactions cannot be reversed.</p>
            </div>

            {/* Transaction Summary */}
            <div className="bg-gray-800/60 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-400 mb-2">Transaction Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">You send</span>
                <span className="text-white font-semibold">{formatNumber(Number(fromAmount), 8)} {fromCoin}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">You get (estimated)</span>
                <span className="text-white font-semibold">{formatNumber(Number(toAmount), 8)} {toCoin}</span>
              </div>
              {rateInfo && (
                <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
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
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            Continue to Confirmation
          </button>
        </div>
      )}

      {/* STEP 3: Confirm & Execute */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {!transactionResult && !transactionError && (
            <>
              <button onClick={goBack} className="flex items-center text-sm text-gray-400 hover:text-white transition">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Confirm Your Swap</h3>
                <p className="text-sm text-gray-400">Please review the details before proceeding</p>
              </div>

              <div className="bg-gray-800/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">You Send</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(Number(fromAmount), 8)}</p>
                    <p className="text-sm text-gray-400">{fromCoin}</p>
                  </div>
                  <ArrowDownUp className="w-6 h-6 text-indigo-400 mx-4" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">You Get</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(Number(toAmount), 8)}</p>
                    <p className="text-sm text-gray-400">{toCoin}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recipient Address</span>
                    <span className="text-white font-mono text-xs break-all max-w-[60%] text-right">
                      {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
                    </span>
                  </div>
                  {rateInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exchange Rate</span>
                        <span className="text-white">1 {fromCoin} ≈ {formatNumber(rateInfo.rate, 6)} {toCoin}</span>
                      </div>
                      {rateInfo.networkFee && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network Fee</span>
                          <span className="text-white">{formatNumber(Number(rateInfo.networkFee), 8)} {fromCoin}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-xs text-blue-200">
                  💡 After confirming, you'll receive a deposit address. Send your {fromCoin} to complete the swap.
                </p>
              </div>

              <button
                onClick={handleCreateTransaction}
                disabled={creatingTransaction}
                className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg ${
                  creatingTransaction
                    ? "bg-gray-700 cursor-not-allowed opacity-60"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {creatingTransaction ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Transaction...
                  </span>
                ) : (
                  "Confirm Swap"
                )}
              </button>
            </>
          )}

          {/* Transaction Success */}
          {transactionResult && !transactionError && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Transaction Created!</h3>
                <p className="text-sm text-gray-400">Send your {fromCoin} to the address below to complete the swap</p>
              </div>

              <div className="bg-gray-800/60 rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Transaction ID</p>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-sm text-white font-mono break-all">
                      {transactionResult.id || transactionResult.transactionId}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Deposit Address ({fromCoin})</p>
                  <div className="bg-gray-900/50 p-3 rounded-lg border-2 border-indigo-500/30">
                    <p className="text-sm text-white font-mono break-all">
                      {transactionResult.payinAddress || transactionResult.depositAddress}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Send Amount</p>
                    <p className="text-white font-semibold">{formatNumber(Number(fromAmount), 8)} {fromCoin}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Receive Amount</p>
                    <p className="text-white font-semibold">{formatNumber(Number(toAmount), 8)} {toCoin}</p>
                  </div>
                </div>

                {transactionResult.payinExtraId && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Extra ID / Memo</p>
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <p className="text-sm text-white font-mono">{transactionResult.payinExtraId}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-xs text-yellow-200">
                  ⚠️ Send exactly {formatNumber(Number(fromAmount), 8)} {fromCoin} to the deposit address. 
                  Sending a different amount may result in delays or loss of funds.
                </p>
              </div>

              <button
                onClick={resetFlow}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-2xl transition-colors"
              >
                Start New Swap
              </button>
            </div>
          )}

          {/* Transaction Error */}
          {transactionError && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
                <p className="text-sm text-red-400">{transactionError}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-2xl transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCreateTransaction}
                  disabled={creatingTransaction}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}