import { useEffect, useState, useMemo } from "react";
import { ChevronDown, Loader2, X, Search } from "lucide-react";
import apiClient from "../../utils/apiClient";

// In-memory cache
let coinsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function CoinSelect({
  value,
  onChange,
  coins: parentCoins,
  defaultSymbol = "BTC",
}) {
  const [coins, setCoins] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        if (parentCoins?.length) {
          setCoins(parentCoins);
          setLoading(false);
          return;
        }

        if (coinsCache && cacheTimestamp && Date.now() < cacheTimestamp) {
          setCoins(coinsCache);
          setLoading(false);
          return;
        }

        const res = await apiClient.get("/meld/crypto-currencies/");
        const data = res.data?.data || res.data || [];

        const formatted = data.map((coin) => ({
          id: coin.currencyCode,
          name: coin.name,
          symbol: coin.currencyCode,
          code: coin.currencyCode,
          logo: coin.symbolImageUrl,
          chain: coin.chainName,
        }));

        coinsCache = formatted;
        cacheTimestamp = Date.now() + CACHE_DURATION;
        setCoins(formatted);
      } catch (err) {
        console.error("Error fetching coins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [parentCoins]);

  useEffect(() => {
    if (!value && coins.length) {
      const defaultCoin = coins.find(
        (c) =>
          c.symbol?.toUpperCase() === defaultSymbol ||
          c.code?.toUpperCase() === defaultSymbol
      );
      if (defaultCoin)
        onChange(
          defaultCoin.symbol?.toUpperCase() || defaultCoin.code?.toUpperCase()
        );
    }
  }, [coins, value, defaultSymbol, onChange]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const filteredCoins = useMemo(() => {
    return coins.filter(
      (coin) =>
        coin.name?.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol?.toLowerCase().includes(search.toLowerCase()) ||
        coin.code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [coins, search]);

  const selectedCoin = useMemo(() => {
    return coins.find(
      (c) =>
        c.symbol?.toUpperCase() === value || c.code?.toUpperCase() === value
    );
  }, [coins, value]);

  return (
    <>
      {/* Selected Coin Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={!selectedCoin}
        className="flex items-center justify-between w-full max-w-xs px-4 py-2 border border-gray-600 rounded-xl bg-[#1b1c1f] hover:bg-[#232428] transition text-gray-200 focus:outline-none"
      >
        {selectedCoin ? (
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedCoin.logo && (
              <img
                src={selectedCoin.logo}
                alt={selectedCoin.symbol}
                className="w-5 h-5 rounded-full flex-shrink-0"
              />
            )}
            <span className="font-medium text-sm sm:text-base pr-[2px]">
              {selectedCoin.symbol?.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium text-sm sm:text-base">Loading...</span>
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[#1f2023] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[600px] my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200">Select Coin</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                }}
                className="p-1 hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading coins...
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search coin..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded-lg text-sm bg-[#2a2b2f] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Coin List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredCoins.length ? (
                    filteredCoins.map((coin) => (
                      <button
                        key={coin.symbol}
                        onClick={() => {
                          onChange(coin.symbol?.toUpperCase());
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#2a2b2f] transition ${
                          coin.symbol?.toUpperCase() === value
                            ? "bg-[#2a2b2f] text-blue-400"
                            : "text-gray-200"
                        }`}
                      >
                        {coin.logo && (
                          <img
                            src={coin.logo}
                            alt={coin.symbol}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{coin.name}</p>
                          <p className="text-sm text-gray-400 uppercase">
                            {coin.symbol}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-gray-400 text-center">
                      No results found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}