import { useState, useEffect } from "react";
import { Repeat, Loader2 } from "lucide-react";
import CoinSelect from "./CoinSelect";
import axios from "axios";
import toast from "react-hot-toast";

export default function ExchangeBox() {
  const [tab, setTab] = useState("buy"); // buy, sell, exchange
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [converted, setConverted] = useState("");
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);

  // Fetch coins with caching
  useEffect(() => {
    const CACHE_KEY = "coingecko_coins";
    const CACHE_EXPIRY_KEY = "coingecko_coins_expiry";
    const CACHE_DURATION = 24 * 60 * 60 * 1000;

    const fetchCoins = async () => {
      const cachedCoins = localStorage.getItem(CACHE_KEY);
      const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (cachedCoins && cachedExpiry && Date.now() < Number(cachedExpiry)) {
        setCoins(JSON.parse(cachedCoins));
        return;
      }

      try {
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 250,
              page: 1,
              sparkline: false,
            },
          }
        );
        setCoins(res.data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
        localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION);
      } catch (err) {
        toast.error("Failed to fetch coin list");
        console.error(err);
      }
    };

    fetchCoins();
  }, []);

  const getCoinBySymbol = (symbol) =>
    coins.find((c) => c.symbol.toUpperCase() === symbol);

  const fetchRate = async () => {
    const fromCoin = getCoinBySymbol(from);
    const toCoin = getCoinBySymbol(to);
    if (!fromCoin || !toCoin) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoin.id}&vs_currencies=${toCoin.id}`
      );
      const newRate = res.data[fromCoin.id]?.[toCoin.id.toLowerCase()];
      if (newRate) setRate(newRate);
      else toast.error("Rate unavailable for this pair");
    } catch {
      toast.error("Failed to fetch rate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coins.length) fetchRate();
  }, [from, to, coins]);

  useEffect(() => {
    if (rate && amount) setConverted((amount * rate).toFixed(6));
    else setConverted("");
  }, [amount, rate]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleAction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    toast.success(
      tab === "buy"
        ? `Buying ${amount} ${from}`
        : tab === "sell"
        ? `Selling ${amount} ${from}`
        : `Exchanging ${amount} ${from} → ${to}`
    );
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-6">
      {/* Tabs */}
      <div className="flex justify-center mb-6 bg-gray-100 rounded-full p-1">
        {["buy", "sell", "exchange"].map((type) => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`flex-1 py-2 rounded-full font-semibold capitalize transition-all ${
              tab === type
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* From */}
      <div className="mb-4">
        <label className="text-gray-500 text-sm mb-1 block">From</label>
        <div className="flex items-center justify-between border rounded-2xl p-3">
          <CoinSelect value={from} onChange={setFrom} coins={coins} />
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-52 text-right focus:outline-none no-spinner"
          />
        </div>
      </div>

      {/* Swap */}
      {tab === "exchange" && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleSwap}
            className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full transition"
          >
            <Repeat className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      )}

      {/* To */}
      <div className="mb-4">
        <label className="text-gray-500 text-sm mb-1 block">To</label>
        <div className="flex items-center justify-between border rounded-2xl p-3 bg-gray-50">
          <CoinSelect value={to} onChange={setTo} coins={coins} />
          <span className="text-gray-600 font-medium">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : converted ? (
              `≈ ${converted}`
            ) : (
              "≈ 0.00"
            )}
          </span>
        </div>
      </div>

      {/* Rate info */}
      <div className="text-sm text-gray-500 text-center mb-6">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            Fetching rates...
          </span>
        ) : rate ? (
          <span>
            1 {from} ≈ <span className="text-indigo-600 font-semibold">{rate}</span> {to}
          </span>
        ) : (
          "Rate unavailable"
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50"
      >
        {tab === "buy" && `Buy ${from}`}
        {tab === "sell" && `Sell ${from}`}
        {tab === "exchange" && `Exchange ${from} → ${to}`}
      </button>

      <div className="text-center mt-4 text-xs text-gray-400">
        Powered by <span className="text-indigo-600 font-semibold">Bitexly</span>
      </div>
    </div>
  );
}