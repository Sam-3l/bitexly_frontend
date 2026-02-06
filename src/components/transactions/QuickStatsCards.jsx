import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
} from "lucide-react";

export default function QuickStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      icon: Activity,
      label: "Total Transactions",
      value: stats.total_transactions || 0,
      color: "blue",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completed_transactions || 0,
      color: "green",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      percentage:
        stats.total_transactions > 0
          ? ((stats.completed_transactions / stats.total_transactions) * 100).toFixed(0)
          : 0,
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats.pending_transactions || 0,
      color: "yellow",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      icon: XCircle,
      label: "Failed",
      value: stats.failed_transactions || 0,
      color: "red",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  const typeCards = [
    {
      icon: TrendingDown,
      label: "Buys",
      value: stats.total_buys || 0,
      color: "green",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: TrendingUp,
      label: "Sells",
      value: stats.total_sells || 0,
      color: "red",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      icon: RefreshCw,
      label: "Swaps",
      value: stats.total_swaps || 0,
      color: "purple",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: DollarSign,
      label: "Total Fees",
      value: parseFloat(stats.total_fees_paid || 0).toFixed(4),
      color: "orange",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      isAmount: true,
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} />
              </div>
              {card.percentage && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  {card.percentage}%
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
              {card.label}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Transaction Type Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {typeCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor}`} />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {card.label}
              </p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {card.isAmount ? `$${card.value}` : card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Badge */}
      {stats.recent_transactions_count > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5" />
              <span className="text-sm sm:text-base font-medium">
                Recent Activity (Last 7 days)
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold">
              {stats.recent_transactions_count}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}