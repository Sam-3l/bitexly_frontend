import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Icon mapping for payment methods
const paymentIcons = {
  CARD: CreditCard,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  BANK_TRANSFER: Building2,
  BANK_ACCOUNT: Building2,
  ACH: Building2,
  SEPA: Building2,
  APPLE_PAY: Smartphone,
  GOOGLE_PAY: Smartphone,
  WALLET: Wallet,
  MOBILE_MONEY: Smartphone,
  PIX: Smartphone,
  DEFAULT: Wallet,
};

const getPaymentIcon = (type) => {
  if (!type) return paymentIcons.DEFAULT;

  const upperType = type.toUpperCase();

  if (paymentIcons[upperType]) return paymentIcons[upperType];

  if (upperType.includes("CARD")) return CreditCard;
  if (upperType.includes("BANK") || upperType.includes("ACH") || upperType.includes("SEPA"))
    return Building2;
  if (upperType.includes("APPLE") || upperType.includes("GOOGLE") || upperType.includes("MOBILE"))
    return Smartphone;
  if (upperType.includes("WALLET")) return Wallet;

  return paymentIcons.DEFAULT;
};

export default function PaymentMethodSelect({
  availableMethods,
  selectedMethod,
  setSelectedMethod,
  loadingMethods,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-select first method when methods load
  useEffect(() => {
    if (availableMethods && availableMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(availableMethods[0]);
    }
  }, [availableMethods, selectedMethod, setSelectedMethod]);

  const handleSelect = (method) => {
    setSelectedMethod(method);
    setOpen(false);
  };

  const getMethodName = (method) => {
    return method.name || method.type || method.paymentMethod || "Payment Method";
  };

  const getMethodType = (method) => {
    return method.type || method.paymentMethod || method.methodType || "DEFAULT";
  };

  const currentMethodName = selectedMethod ? getMethodName(selectedMethod) : null;
  const CurrentIcon = selectedMethod
    ? getPaymentIcon(getMethodType(selectedMethod))
    : Wallet;

  return (
    <div className="relative z-20 w-full" ref={dropdownRef}>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Method</p>

      {/* Dropdown Trigger */}
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
            <CurrentIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
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

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && availableMethods && availableMethods.length > 1 && (
          <motion.div className="absolute top-full left-0 mt-2 rounded-xl shadow-xl bg-white dark:bg-gray-900/85 backdrop-blur-md border border-gray-200 dark:border-white/10 overflow-hidden min-w-[14rem] w-auto">
            <ul className="max-h-52 overflow-y-auto">
              {availableMethods.map((method, idx) => {
                const name = getMethodName(method);
                const MethodIcon = getPaymentIcon(getMethodType(method));
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
                  <li
                    key={idx}
                    onClick={() => handleSelect(method)}
                    className={`flex items-center justify-between px-3 py-2 transition-all ${
                      isSelected
                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-gray-900 dark:text-white"
                        : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-300"
                    } cursor-pointer`}
                  >
                    <div className="flex items-center gap-2">
                      <MethodIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <div>
                        <span className="text-sm font-medium">{name}</span>
                        {fee && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            Fee: {fee}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}