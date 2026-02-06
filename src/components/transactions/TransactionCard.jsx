import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Hash,
  Network,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

const statusConfig = {
  COMPLETED: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  PENDING: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  PROCESSING: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: Loader,
  },
  FAILED: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  CANCELLED: {
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900/20",
    border: "border-gray-200 dark:border-gray-800",
    icon: XCircle,
  },
};

const typeConfig = {
  BUY: {
    icon: ArrowDownLeft,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  SELL: {
    icon: ArrowUpRight,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  SWAP: {
    icon: RefreshCw,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
};

export default function TransactionCard({ transaction, index }) {
  const [expanded, setExpanded] = useState(false);

  const status = statusConfig[transaction.status] || statusConfig.PENDING;
  const type = typeConfig[transaction.transaction_type] || typeConfig.BUY;
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount) => {
    if (!amount) return "0.00";
    const num = parseFloat(amount);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all border ${status.border} overflow-hidden`}
    >
      {/* Main Content */}
      <div
        className="p-4 sm:p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Type Icon & Info */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${type.bg} flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${type.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                  {transaction.transaction_type}
                </h3>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                  {transaction.provider}
                </span>
              </div>

              {/* Amounts */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{formatAmount(transaction.source_amount)}</span>
                  <span className="text-slate-500 dark:text-slate-400">{transaction.source_currency}</span>
                  {transaction.destination_amount && (
                    <>
                      <span className="text-slate-400 dark:text-slate-500">→</span>
                      <span className="font-medium">{formatAmount(transaction.destination_amount)}</span>
                      <span className="text-slate-500 dark:text-slate-400">{transaction.destination_currency}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(transaction.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Right: Status & Expand */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
              <span className={`text-xs sm:text-sm font-medium ${status.color}`}>
                {transaction.status}
              </span>
            </div>

            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Transaction ID */}
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Transaction ID</p>
                  <p className="text-slate-900 dark:text-white font-mono text-xs break-all">
                    {transaction.transaction_id}
                  </p>
                </div>
              </div>

              {/* Provider Transaction ID */}
              {transaction.provider_transaction_id && (
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Provider ID</p>
                    <p className="text-slate-900 dark:text-white font-mono text-xs break-all">
                      {transaction.provider_transaction_id}
                    </p>
                  </div>
                </div>
              )}

              {/* Network */}
              {transaction.network && (
                <div className="flex items-start gap-2">
                  <Network className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Network</p>
                    <p className="text-slate-900 dark:text-white">{transaction.network}</p>
                  </div>
                </div>
              )}

              {/* Exchange Rate */}
              {transaction.exchange_rate && (
                <div className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Exchange Rate</p>
                    <p className="text-slate-900 dark:text-white">{formatAmount(transaction.exchange_rate)}</p>
                  </div>
                </div>
              )}

              {/* Fees */}
              {transaction.total_fees && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Total Fees</p>
                    <p className="text-slate-900 dark:text-white">
                      {formatAmount(transaction.total_fees)} {transaction.source_currency}
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              {transaction.destination_wallet_address && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Hash className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Destination Wallet</p>
                    <p className="text-slate-900 dark:text-white font-mono text-xs break-all">
                      {transaction.destination_wallet_address}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {transaction.error_message && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{transaction.error_message}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}