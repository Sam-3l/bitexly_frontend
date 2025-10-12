import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import axios from "axios";

const CACHE_KEY = "coingecko_coins";
const CACHE_EXPIRY_KEY = "coingecko_coins_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function CoinSelect({ value, onChange, coins: parentCoins }) {
  const [coins, setCoins] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (parentCoins?.length) {
      setCoins(parentCoins);
      setLoading(false);
      return;
    }

    const fetchCoins = async () => {
      try {
        const cachedCoins = localStorage.getItem(CACHE_KEY);
        const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        if (cachedCoins && cachedExpiry && Date.now() < Number(cachedExpiry)) {
          setCoins(JSON.parse(cachedCoins));
          setLoading(false);
          return;
        }

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
        console.error("Error fetching coins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [parentCoins]);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCoin = coins.find(c => c.symbol.toUpperCase() === value);

  return (
    <div className="relative w-auto">
      {/* Selected Coin Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2 pr-1">
          {selectedCoin && (
            <img
              src={selectedCoin.image}
              alt={selectedCoin.symbol}
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="font-medium truncate">
            {selectedCoin ? selectedCoin.symbol.toUpperCase() : "Select coin"}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-[250px] max-w-lg bg-white border rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading coins...
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search coin..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Coin list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCoins.length ? (
                  filteredCoins.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => {
                        onChange(coin.symbol.toUpperCase());
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 ${
                        coin.symbol.toUpperCase() === value ? "bg-gray-50" : ""
                      }`}
                    >
                      <img
                        src={coin.image}
                        alt={coin.symbol}
                        className="w-5 h-5 rounded-full"
                      />
                      <div className="flex-1 truncate">
                        <p className="font-medium">{coin.name}</p>
                        <p className="text-sm text-gray-400 uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-400 text-center">No results found</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}