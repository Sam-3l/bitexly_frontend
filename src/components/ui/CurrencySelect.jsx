import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import axios from "axios";

const CACHE_KEY = "fiat_currencies";
const CACHE_EXPIRY_KEY = "fiat_currencies_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function CurrencySelect({ value, onChange }) {
  const [currencies, setCurrencies] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const cachedCurrencies = localStorage.getItem(CACHE_KEY);
        const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        if (cachedCurrencies && cachedExpiry && Date.now() < Number(cachedExpiry)) {
          setCurrencies(JSON.parse(cachedCurrencies));
          setLoading(false);
          return;
        }

        const res = await axios.get("https://api.exchangerate.host/symbols");

        const symbols = res.data?.symbols;
        if (!symbols || typeof symbols !== "object") {
          console.error("No symbols data returned from API");
          setCurrencies([]);
          return;
        }

        const formatted = Object.entries(symbols).map(([code, { description }]) => ({
          code,
          name: description,
        }));

        setCurrencies(formatted);
        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
        localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION);
      } catch (err) {
        console.error("Error fetching currencies:", err);
        setCurrencies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(search.toLowerCase()) ||
      currency.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCurrency = currencies.find((c) => c.code === value);

  return (
    <div className="relative w-auto">
      {/* Selected Currency Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2 pr-1">
          <span className="font-medium truncate">
            {selectedCurrency ? selectedCurrency.code : "Select currency"}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-[250px] max-w-lg bg-white border rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading currencies...
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Currency list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCurrencies.length ? (
                  filteredCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => {
                        onChange(currency.code);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 ${
                        currency.code === value ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex-1 truncate">
                        <p className="font-medium">{currency.name}</p>
                        <p className="text-sm text-gray-400 uppercase">{currency.code}</p>
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