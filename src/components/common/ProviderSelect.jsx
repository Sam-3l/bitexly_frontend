import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProviderSelect({
  availableProviders,
  selectedProvider,
  setSelectedProvider,
  loadingQuote,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔒 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (provider) => {
    setSelectedProvider(provider);
    setOpen(false);
  };

  const currentProviderName =
    selectedProvider?.serviceProvider || selectedProvider?.provider;

  return (
    <div className="relative z-30 w-full" ref={dropdownRef}>
      <p className="text-xs text-gray-400 mb-1">Payment Provider</p>

      {/* Dropdown Trigger */}
      <div
        onClick={() => !loadingQuote && setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-all max-w-max ${
          loadingQuote
            ? "cursor-wait opacity-70"
            : "cursor-pointer hover:bg-white/5 active:scale-[0.98]"
        }`}
      >
        {loadingQuote ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : currentProviderName ? (
          <>
            <img
              src={`/providers/${currentProviderName
                .toLowerCase()
                .replace(/\s+/g, "-")}.png`}
              alt={currentProviderName}
              className="w-5 h-5 rounded-full object-contain bg-white/10"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span className="text-sm text-white font-medium tracking-wide">
              {currentProviderName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        ) : (
          <>
            <span className="text-sm text-gray-400">Select provider</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 mt-2 rounded-xl shadow-2xl bg-[#0b0b0b] border border-white/10 overflow-hidden min-w-[14rem] w-auto z-50"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >                        
            {availableProviders.length === 0 ? (
              <p className="p-3 text-sm text-gray-400">No providers available</p>
            ) : (
              <ul className="max-h-52 overflow-y-auto">
                {availableProviders.map((provider, idx) => {
                  const name =
                    provider.serviceProvider ||
                    provider.provider ||
                    `Provider ${idx + 1}`;
                  const logoPath = `/providers/${name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}.png`;
                  const isSelected =
                    currentProviderName &&
                    currentProviderName.toLowerCase() === name.toLowerCase();

                  return (
                    <li
                      key={idx}
                      onClick={() => handleSelect(provider)}
                      className={`flex items-center justify-between px-3 py-2 transition-all ${
                        isSelected
                          ? "bg-indigo-500/20 text-white"
                          : "hover:bg-white/5 text-gray-300"
                      } cursor-pointer`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={logoPath}
                          alt={name}
                          className="w-5 h-5 rounded-full object-contain bg-white/10"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
