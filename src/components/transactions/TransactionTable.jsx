import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
} from "lucide-react";

const statusConfig = {
  COMPLETED: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: CheckCircle,
  },
  PENDING: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: Clock,
  },
  PROCESSING: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: Loader,
  },
  FAILED: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: XCircle,
  },
  CANCELLED: {
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900/20",
    icon: XCircle,
  },
};

const typeConfig = {
  BUY: {
    icon: ArrowDownLeft,
    color: "text-green-600 dark:text-green-400",
  },
  SELL: {
    icon: ArrowUpRight,
    color: "text-red-600 dark:text-red-400",
  },
  SWAP: {
    icon: RefreshCw,
    color: "text-blue-600 dark:text-blue-400",
  },
};

export default function TransactionTable({ transactions }) {
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Transaction ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {transactions.map((transaction, index) => {
              const status = statusConfig[transaction.status] || statusConfig.PENDING;
              const type = typeConfig[transaction.transaction_type] || typeConfig.BUY;
              const StatusIcon = status.icon;
              const TypeIcon = type.icon;

              return (
                <motion.tr
                  key={transaction.transaction_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  {/* Type */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <TypeIcon className={`w-5 h-5 ${type.color}`} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {transaction.transaction_type}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatAmount(transaction.source_amount)} {transaction.source_currency}
                      </div>
                      {transaction.destination_amount && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          → {formatAmount(transaction.destination_amount)}{" "}
                          {transaction.destination_currency}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                      {transaction.provider}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                      <span className={`text-xs font-medium ${status.color}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(transaction.created_at)}
                  </td>

                  {/* Transaction ID */}
                  <td className="px-6 py-4">
                    <code className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                      {transaction.transaction_id.slice(0, 12)}...
                    </code>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden divide-y divide-slate-200 dark:divide-slate-700">
        {transactions.map((transaction, index) => {
          const status = statusConfig[transaction.status] || statusConfig.PENDING;
          const type = typeConfig[transaction.transaction_type] || typeConfig.BUY;
          const StatusIcon = status.icon;
          const TypeIcon = type.icon;

          return (
            <motion.div
              key={transaction.transaction_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TypeIcon className={`w-5 h-5 ${type.color}`} />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {transaction.transaction_type}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                    {transaction.provider}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
                  <StatusIcon className={`w-3 h-3 ${status.color}`} />
                  <span className={`text-xs font-medium ${status.color}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatAmount(transaction.source_amount)} {transaction.source_currency}
                  </span>
                </div>
                {transaction.destination_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Received:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatAmount(transaction.destination_amount)}{" "}
                      {transaction.destination_currency}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ID:</span>
                  <code className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                    {transaction.transaction_id.slice(0, 16)}...
                  </code>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}