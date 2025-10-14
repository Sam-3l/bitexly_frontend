import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import axios from "axios";

const CACHE_KEY = "fiat_currencies";
const CACHE_EXPIRY_KEY = "fiat_currencies_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default function CurrencySelect({ value, onChange }) {
  const [currencies, setCurrencies] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (cached && expiry && Date.now() < Number(expiry)) {
          setCurrencies(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const res = await axios.get("https://api.exchangerate.host/symbols");
        const symbols = res.data?.symbols || {};
        const formatted = Object.entries(symbols).map(([code, { description }]) => ({
          code,
          name: description,
        }));

        setCurrencies(formatted);
        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
        localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION);
      } catch (err) {
        console.error("Error fetching currencies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const filtered = currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selected = currencies.find((c) => c.code === value);

  return (
    <div className="relative w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-600 rounded-xl bg-[#1b1c1f] hover:bg-[#232428] transition text-gray-200 focus:outline-none"
      >
        <span className="font-medium truncate">
          {selected ? selected.code : "Select currency"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-2 w-[250px] bg-[#1f2023] border border-gray-700 rounded-xl shadow-lg overflow-hidden animate-fade-in text-gray-200">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading currencies...
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-gray-700 bg-[#25262a]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency..."
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#2a2b2f] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filtered.length ? (
                  filtered.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => {
                        onChange(currency.code);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#2a2b2f] ${
                        currency.code === value
                          ? "bg-[#2a2b2f] text-blue-400"
                          : "text-gray-200"
                      }`}
                    >
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
            </>
          )}
        </div>
      )}
    </div>
  );
}