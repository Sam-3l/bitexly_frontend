import { useEffect, useState, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import apiClient from "../../utils/apiClient";

// In-memory cache
let currenciesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function CurrencySelect({
  value,
  onChange,
  defaultSymbol = "NGN",
}) {
  const [currencies, setCurrencies] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        if (currenciesCache && cacheTimestamp && Date.now() < cacheTimestamp) {
          setCurrencies(currenciesCache);
          setLoading(false);
          return;
        }

        // 🔒 Secure backend call
        const res = await apiClient.get("/meld/fiat-currencies/");
        const data = res.data || [];

        const formatted = data.map((item) => ({
          code: item.currencyCode,
          name: item.name,
          logo: item.symbolImageUrl,
        }));

        currenciesCache = formatted;
        cacheTimestamp = Date.now() + CACHE_DURATION;
        setCurrencies(formatted);
      } catch (err) {
        console.error("Error fetching fiat currencies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // ✅ Auto-select default currency (e.g. NGN)
  useEffect(() => {
    if (!value && currencies.length) {
      const defaultCurrency = currencies.find(
        (c) => c.code?.toUpperCase() === defaultSymbol
      );
      if (defaultCurrency) onChange(defaultCurrency.code);
    }
  }, [currencies, value, defaultSymbol, onChange]);

  // Filter + selected
  const filtered = useMemo(() => {
    return currencies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [currencies, search]);

  const selected = useMemo(() => {
    return currencies.find((c) => c.code === value);
  }, [currencies, value]);

  return (
    <div className="relative w-auto">
      {/* Button — fully adaptive like CoinSelect */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center justify-between w-full max-w-xs px-4 py-2 border border-gray-600 rounded-xl bg-[#1b1c1f] hover:bg-[#232428] transition text-gray-200 focus:outline-none"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium text-sm sm:text-base">Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-hidden">
            {selected?.logo && (
              <img
                src={selected.logo}
                alt={selected.code}
                className="w-5 h-5 rounded-full flex-shrink-0"
              />
            )}
            <span className="font-medium text-sm sm:text-base pr-[2px]">
              {selected ? selected.code.toUpperCase() : "Select currency"}
            </span>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && !loading && (
        <div className="absolute z-[99999] mt-2 w-[250px] bg-[#1f2023] border border-gray-700 rounded-xl shadow-lg overflow-hidden animate-fade-in text-gray-200">
          {/* Search */}
          <div className="p-2 border-b border-gray-700 bg-[#25262a]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency..."
              className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#2a2b2f] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Currency list */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length ? (
              filtered.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    onChange(currency.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#2a2b2f] ${
                    currency.code === value
                      ? "bg-[#2a2b2f] text-blue-400"
                      : "text-gray-200"
                  }`}
                >
                  {currency.logo && (
                    <img
                      src={currency.logo}
                      alt={currency.code}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <div className="flex-1 truncate">
                    <p className="font-medium">{currency.name}</p>
                    <p className="text-sm text-gray-400 uppercase">
                      {currency.code}
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
        </div>
      )}
    </div>
  );
}