import { useEffect, useState, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
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

        // 🔒 Secure call through backend
        const res = await apiClient.get("/meld/crypto-currencies/");
        const data = res.data || [];

        // Map backend data to unified format
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

  // Auto-select default coin if none is selected
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
    <div className="relative w-auto">
      {/* Selected Coin Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
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

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[99999] mt-2 w-[250px] bg-[#1f2023] border border-gray-700 rounded-xl shadow-lg overflow-hidden animate-fade-in text-gray-200">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading coins...
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="p-2 border-b border-gray-700 bg-[#25262a]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search coin..."
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#2a2b2f] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Coin list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCoins.length ? (
                  filteredCoins.map((coin) => (
                    <button
                      key={coin.symbol}
                      onClick={() => {
                        onChange(coin.symbol?.toUpperCase());
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#2a2b2f] ${
                        coin.symbol?.toUpperCase() === value
                          ? "bg-[#2a2b2f] text-blue-400"
                          : "text-gray-200"
                      }`}
                    >
                      {coin.logo && (
                        <img
                          src={coin.logo}
                          alt={coin.symbol}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <div className="flex-1 truncate">
                        <p className="font-medium">{coin.name}</p>
                        <p className="text-sm text-gray-400 uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-400 text-center">
                    No results found
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}