import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Activity,
  Loader,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

const statusConfig = {
  COMPLETED: {
    color: "text-green-600 dark:text-green-400",
    icon: CheckCircle,
  },
  PENDING: {
    color: "text-yellow-600 dark:text-yellow-400",
    icon: Clock,
  },
  PROCESSING: {
    color: "text-blue-600 dark:text-blue-400",
    icon: Loader,
  },
  FAILED: {
    color: "text-red-600 dark:text-red-400",
    icon: XCircle,
  },
  CANCELLED: {
    color: "text-gray-600 dark:text-gray-400",
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

export default function RecentTransactionsWidget() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("bitexly_tokens") || "{}");
      const response = await apiClient.get("/users/transactions/recent/?limit=5", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });

      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch recent transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return "0.00";
    const num = parseFloat(amount);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Transactions List */}
      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No transactions yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn, index) => {
            const status = statusConfig[txn.status] || statusConfig.PENDING;
            const type = typeConfig[txn.transaction_type] || typeConfig.BUY;
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;

            return (
              <motion.div
                key={txn.transaction_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <TypeIcon className={`w-5 h-5 ${type.color}`} />
                </div>

                {/* Transaction Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                      {txn.transaction_type}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {txn.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      {formatAmount(txn.source_amount)} {txn.source_currency}
                    </span>
                    {txn.destination_amount && (
                      <>
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {formatAmount(txn.destination_amount)} {txn.destination_currency}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {formatDate(txn.created_at)}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}