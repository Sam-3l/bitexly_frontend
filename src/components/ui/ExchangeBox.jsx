import { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, Loader2 } from "lucide-react";
import CoinSelect from "./CoinSelect";
import CurrencySelect from "./CurrencySelect";
import apiClient from "../../utils/apiClient";

// Debounce hook: call `callback` after `delay` ms when deps change
function useDebounce(callback, delay, deps) {
  useEffect(() => {
    if (!deps || deps.length === 0) return;
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

export default function ExchangeBox() {
  const [activeTab, setActiveTab] = useState("buy"); // buy | sell | swap

  // BUY / SELL inputs
  const [fiatAmount, setFiatAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");

  // Swap fields (kept simple)
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("");

  const [fromCoin, setFromCoin] = useState("BTC"); // crypto code
  const [toCurrency, setToCurrency] = useState("NGN"); // fiat code

  // Quote state
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [quoteRate, setQuoteRate] = useState(null);
  const [quoteFees, setQuoteFees] = useState(null);
  const [quoteProvider, setQuoteProvider] = useState(null);
  const [quoteMin, setQuoteMin] = useState(null);
  const [lastQuoteRaw, setLastQuoteRaw] = useState(null);

  const [userTyped, setUserTyped] = useState(null);

  // Helpers
  const formatNumber = (n, decimals = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    // for fiat show 2 decimals, for crypto show up to `decimals`
    return typeof n === "number"
      ? n >= 1
        ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
      : Number(n) >= 1
      ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
      : Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  // Build payload and call quote endpoint
  const fetchQuote = useCallback(async () => {
    // Basic validations
    setQuoteError(null);
    setQuoteRate(null);
    setQuoteFees(null);
    setQuoteProvider(null);
    setQuoteMin(null);
    setLastQuoteRaw(null);

    try {
      if (!fromCoin || !toCurrency) return;

      // For BUY: user types fiat (NGN) -> want destination crypto
      // For SELL: user types crypto -> want destination fiat
      const action = activeTab.toUpperCase(); // BUY or SELL

      // Minimum check: require input
      if (action === "BUY" && (!fiatAmount || Number(fiatAmount) <= 0)) return;
      if (action === "SELL" && (!cryptoAmount || Number(cryptoAmount) <= 0)) return;

      setLoadingQuote(true);

      const payload =
        action === "BUY"
          ? {
              action: "BUY",
              sourceAmount: Number(fiatAmount),
              sourceCurrencyCode: toCurrency,
              destinationCurrencyCode: fromCoin,
              countryCode: toCurrency.slice(0, 2), // NGN -> NG
            }
          : {
              action: "SELL",
              sourceAmount: Number(cryptoAmount),
              sourceCurrencyCode: fromCoin,
              destinationCurrencyCode: toCurrency,
              countryCode: toCurrency.slice(0, 2),
            };

      const res = await apiClient.post("/meld/crypto-quote/", payload);
      const data = res.data;

      // unwrap Meld-style + backend-wrapped responses
      const inner = data?.data || data;

      // Handle various possible structures safely
      const quoteObj =
        (inner?.quotes && Array.isArray(inner.quotes) && inner.quotes.length > 0 && inner.quotes[0]) ||
        inner?.quote ||
        inner;

      setLastQuoteRaw(quoteObj);

      // Destination amount choose priority:
      const destAmount =
        quoteObj.destinationAmount ??
        quoteObj.destinationAmountWithoutFees ??
        data.destinationAmount ??
        null;

      const exchangeRate = quoteObj.exchangeRate ?? quoteObj.rate ?? data.rate ?? null;

      const fees = {
        total: quoteObj.totalFee ?? quoteObj.total_fees ?? quoteObj.totalFees ?? data.totalFee ?? null,
        transactionFee: quoteObj.transactionFee ?? quoteObj.transaction_fee ?? null,
        networkFee: quoteObj.networkFee ?? quoteObj.network_fee ?? null,
        partnerFee: quoteObj.partnerFee ?? quoteObj.partner_fee ?? null,
      };

      const provider = quoteObj.serviceProvider ?? quoteObj.provider ?? data.serviceProvider ?? null;

      // Some providers include a minimum / minAmount field — try to detect it
      const minAmount =
        quoteObj.minimumAmount ??
        quoteObj.minAmount ??
        quoteObj.minFiatAmount ??
        quoteObj.min_source_amount ??
        quoteObj.min_source_amount_in_fiat ??
        null;

      // Update UI values depending on action
      if (action === "BUY" && userTyped === "fiat") {
        setCryptoAmount(destAmount !== null ? String(destAmount) : "");
      } else if (action === "SELL" && userTyped === "crypto") {
        setFiatAmount(destAmount !== null ? String(destAmount) : "");
      }      

      setQuoteRate(exchangeRate);
      setQuoteFees(fees);
      setQuoteProvider(provider);
      setQuoteMin(minAmount || null);
    } catch (err) {
      console.error("Quote error:", err);

      // Try to parse returned server error message and minimums
      const resp = err?.response?.data;
      if (resp) {
        // Meld sometimes returns { message: "...", error: "...", minAmount: 12345 }
        const fallbackMessage =
          resp.message ||
          resp.error ||
          (resp.quotes && resp.quotes.length === 0 && "No quotes available") ||
          null;

        // Try to extract minimum from known keys
        const maybeMin =
          resp.minimumAmount ?? resp.minAmount ?? resp.min_source_amount ?? resp.min_source_amount_in_fiat ?? null;

        if (maybeMin) {
          setQuoteMin(maybeMin);
          setQuoteError(`Amount is below minimum: ${formatNumber(maybeMin)} ${activeTab === "BUY" ? toCurrency : fromCoin}`);
        } else if (fallbackMessage) {
          setQuoteError(fallbackMessage);
        } else {
          setQuoteError("Unable to fetch quote. Try a different amount or currency.");
        }
      } else {
        setQuoteError("Network error while fetching quote.");
      }
    } finally {
      setLoadingQuote(false);
    }

    setUserTyped(null);
  }, [activeTab, fiatAmount, cryptoAmount, fromCoin, toCurrency]);

  // Debounce quote calls (600ms)
  useDebounce(fetchQuote, 600, [activeTab, fiatAmount, cryptoAmount, fromCoin, toCurrency]);

  // Reset fields when switching tab
  useEffect(() => {
    setFiatAmount("");
    setCryptoAmount("");
    setQuoteError(null);
    setQuoteRate(null);
    setQuoteFees(null);
    setQuoteProvider(null);
    setQuoteMin(null);
    setLastQuoteRaw(null);
  }, [activeTab, fromCoin, toCurrency]);

  // UI helpers
  const isBuy = activeTab === "buy";
  const isSell = activeTab === "sell";
  const hasValidBuyInput = isBuy && fiatAmount && Number(fiatAmount) > 0 && !quoteError;
  const hasValidSellInput = isSell && cryptoAmount && Number(cryptoAmount) > 0 && !quoteError;

  const handleBuyNow = () => {
    // This is where you'd create session widget or proceed to checkout
    // e.g. POST /meld/session-widget/ with session data using lastQuoteRaw etc.
    console.log("Buy now", { fiatAmount, cryptoAmount, lastQuoteRaw });
  };

  const handleSellNow = () => {
    console.log("Sell now", { fiatAmount, cryptoAmount, lastQuoteRaw });
  };

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-8 overflow-visible backdrop-blur-2xl bg-gray-900/60 border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] text-gray-200">
      {/* Tabs */}
      <div className="flex justify-center mb-8 bg-gray-800/50 rounded-full p-1 backdrop-blur-md border border-white/10 relative z-10">
        {["buy", "sell", "swap"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
              activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* BUY Tab */}
      {isBuy && (
        <div className="space-y-6 relative">
          {/* You Pay (Fiat) */}
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

          {/* Icon */}
          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full shadow-lg hover:shadow-indigo-500/50 transition">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          {/* You Get (Crypto) */}
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
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Getting latest quote...
              </div>
            )}

            {/* Show rate / fees / provider */}
            {!loadingQuote && quoteRate && (
              <div className="mt-2 text-xs text-gray-300">
                <div>Rate: <span className="font-medium">{quoteRate ? formatNumber(Number(quoteRate), 2) : "-"} {toCurrency}/{fromCoin}</span></div>
                {quoteFees && (quoteFees.total || quoteFees.transactionFee || quoteFees.networkFee) && (
                  <div className="mt-1">Fees: <span className="font-medium">{quoteFees.total ? formatNumber(Number(quoteFees.total), 2) : "—"}</span></div>
                )}
                {quoteProvider && <div className="mt-1">Provider: <span className="font-medium">{quoteProvider}</span></div>}
                {quoteMin && <div className="mt-1 text-yellow-300">Minimum allowed: <span className="font-medium">{formatNumber(Number(quoteMin), 2)} {toCurrency}</span></div>}
              </div>
            )}

            {quoteError && <p className="text-xs text-red-400 mt-2">{quoteError}</p>}
          </div>

          <button
            onClick={handleBuyNow}
            disabled={!hasValidBuyInput}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg relative z-10 ${
              hasValidBuyInput ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/50" : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            {loadingQuote ? "Checking…" : "Buy Now"}
          </button>
        </div>
      )}

      {/* SELL Tab */}
      {isSell && (
        <div className="space-y-6 relative">
          {/* You Sell (Crypto) */}
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">You Sell</p>
            <div className="flex items-center justify-between">
              <input
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

          {/* Icon */}
          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full shadow-lg hover:shadow-indigo-500/50 transition">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          {/* You Receive (Fiat) */}
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
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Getting latest quote...
              </div>
            )}

            {/* Show rate / fees / provider */}
            {!loadingQuote && quoteRate && (
              <div className="mt-2 text-xs text-gray-300">
                <div>Rate: <span className="font-medium">{quoteRate ? formatNumber(Number(quoteRate), 2) : "-"} {toCurrency}/{fromCoin}</span></div>
                {quoteFees && (quoteFees.total || quoteFees.transactionFee || quoteFees.networkFee) && (
                  <div className="mt-1">Fees: <span className="font-medium">{quoteFees.total ? formatNumber(Number(quoteFees.total), 2) : "—"}</span></div>
                )}
                {quoteProvider && <div className="mt-1">Provider: <span className="font-medium">{quoteProvider}</span></div>}
                {quoteMin && <div className="mt-1 text-yellow-300">Minimum allowed: <span className="font-medium">{formatNumber(Number(quoteMin), 2)} {toCurrency}</span></div>}
              </div>
            )}

            {quoteError && <p className="text-xs text-red-400 mt-2">{quoteError}</p>}
          </div>

          <button
            onClick={handleSellNow}
            disabled={!hasValidSellInput}
            className={`w-full py-3 text-white font-semibold rounded-2xl transition-all shadow-lg relative z-10 ${
              hasValidSellInput ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/50" : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            {loadingQuote ? "Checking…" : "Sell Now"}
          </button>
        </div>
      )}

      {/* SWAP Tab (unchanged) */}
      {activeTab === "swap" && (
        <div className="space-y-6 relative">
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">From</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={swapFrom} onChange={setSwapFrom} defaultSymbol="BTC" />
            </div>
          </div>

          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full shadow-lg hover:shadow-indigo-500/50 transition">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">To</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={swapTo} onChange={setSwapTo} defaultSymbol="ETH" />
            </div>
          </div>

          <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 relative z-10">
            Swap
          </button>
        </div>
      )}
    </div>
  );
}