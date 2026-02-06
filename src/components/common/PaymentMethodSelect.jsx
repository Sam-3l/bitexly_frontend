import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Loader2, X, Wallet } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function PaymentMethodSelect({
  availableMethods,
  selectedMethod,
  setSelectedMethod,
  loadingMethods,
  action,
}) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();

  // Auto-select first method when methods load
  useEffect(() => {
    if (availableMethods && availableMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(availableMethods[0]);
    }
  }, [availableMethods, selectedMethod, setSelectedMethod]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open]);

  const handleSelect = (method) => {
    setSelectedMethod(method);
    setOpen(false);
  };

  const getMethodName = (method) => {
    return method.name || method.type || method.paymentMethod || "Payment Method";
  };

  // Get logo based on current theme
  const getMethodLogo = (method) => {
    if (!method.logos) return null;
    return isDark ? method.logos.dark : method.logos.light;
  };

  const currentMethodName = selectedMethod ? getMethodName(selectedMethod) : null;
  const currentMethodLogo = selectedMethod ? getMethodLogo(selectedMethod) : null;

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
            {action === "BUY" ? "Select Payment Method" : "Select Receiving Method"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {!availableMethods || availableMethods.length === 0 ? (
            <div className="p-8 text-gray-500 dark:text-gray-400 text-center">
              No payment methods available
            </div>
          ) : (
            availableMethods.map((method, idx) => {
              const name = getMethodName(method);
              const logo = getMethodLogo(method);
              const isSelected = currentMethodName === name;
              const fee =
                method.fee !== undefined && method.fee !== null
                  ? typeof method.fee === "number"
                    ? `${method.fee}%`
                    : method.fee
                  : method.feePercentage
                  ? `${method.feePercentage}%`
                  : null;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(method)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-[#2a2b2f] transition ${
                    idx === 0 ? "rounded-t-2xl" : ""
                  } ${
                    idx === availableMethods.length - 1 ? "rounded-b-2xl" : ""
                  } ${
                    isSelected
                      ? "bg-gray-100 dark:bg-[#2a2b2f] text-blue-600 dark:text-blue-400"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img
                        src={logo}
                        alt={name}
                        className="w-8 h-8 rounded-lg object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <Wallet className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{name}</p>
                      {fee && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fee: {fee}
                        </p>
                      )}
                    </div>
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
      <div className="relative z-20 w-full">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{action === "BUY" ? "Payment Method" : "Receive Funds"}</p>

        {/* Dropdown Trigger - Original Style */}
        <div
          onClick={() =>
            !loadingMethods && availableMethods?.length > 0 && setOpen((prev) => !prev)
          }
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-all max-w-max ${
            loadingMethods || !availableMethods || availableMethods.length === 0
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98]"
          }`}
        >
          {loadingMethods ? (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : !availableMethods || availableMethods.length === 0 ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              No methods available
            </span>
          ) : currentMethodName ? (
            <>
              {currentMethodLogo ? (
                <img
                  src={currentMethodLogo}
                  alt={currentMethodName}
                  className="w-5 h-5 rounded object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
              <span className="text-sm text-gray-900 dark:text-white font-medium tracking-wide">
                {currentMethodName}
              </span>
              {availableMethods.length > 1 && (
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              )}
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Select method</span>
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