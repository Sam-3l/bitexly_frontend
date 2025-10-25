import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Loader2, X } from "lucide-react";

// Helper to format provider names (MOONPAY -> Moonpay)
const formatProviderName = (name) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export default function ProviderSelect({
  availableProviders,
  selectedProvider,
  setSelectedProvider,
  loadingQuote,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open]);

  const handleSelect = (provider) => {
    setSelectedProvider(provider);
    setOpen(false);
  };

  const currentProviderName =
    selectedProvider?.serviceProvider || selectedProvider?.provider;
  const displayName = formatProviderName(currentProviderName);

  const modalContent = open ? (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#1f2023] rounded-2xl shadow-2xl flex flex-col mt-16 sm:mt-20 max-h-[90vh] sm:max-h-[600px]">
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Select Provider
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {availableProviders.length === 0 ? (
            <div className="p-8 text-gray-500 dark:text-gray-400 text-center">
              No providers available
            </div>
          ) : (
            availableProviders.map((provider, idx) => {
              const name =
                provider.serviceProvider ||
                provider.provider ||
                `Provider ${idx + 1}`;
              const displayProviderName = formatProviderName(name);
              const logoPath = `/providers/${name
                .toLowerCase()
                .replace(/\s+/g, "-")}.png`;
              const isSelected =
                currentProviderName &&
                currentProviderName.toLowerCase() === name.toLowerCase();

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(provider)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-[#2a2b2f] transition ${
                    isSelected
                      ? "bg-gray-100 dark:bg-[#2a2b2f] text-blue-600 dark:text-blue-400"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={logoPath}
                      alt={displayProviderName}
                      className="w-8 h-8 rounded-full object-contain bg-gray-200 dark:bg-white/10"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <span className="font-medium">{displayProviderName}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative z-30 w-full">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Provider</p>

        {/* Dropdown Trigger - Original Style */}
        <div
          onClick={() => !loadingQuote && setOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-all max-w-max ${
            loadingQuote
              ? "cursor-wait opacity-70"
              : "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98]"
          }`}
        >
          {loadingQuote ? (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : currentProviderName ? (
            <>
              <img
                src={`/providers/${currentProviderName
                  .toLowerCase()
                  .replace(/\s+/g, "-")}.png`}
                alt={displayName}
                className="w-5 h-5 rounded-full object-contain bg-gray-200 dark:bg-white/10"
                onError={(e) => (e.target.style.display = "none")}
              />
              <span className="text-sm text-gray-900 dark:text-white font-medium tracking-wide">
                {displayName}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">Select provider</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </div>
      </div>

      {typeof document !== "undefined" &&
        modalContent &&
        createPortal(modalContent, document.body)}
    </>
  );
}