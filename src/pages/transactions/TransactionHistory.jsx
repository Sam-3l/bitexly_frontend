import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Filter,
  Download,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Calendar,
  ChevronDown,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Particles from "../../components/ui/Particles";
import usePageTitle from "../../hooks/usePageTitle";
import apiClient from "../../utils/apiClient";
import TransactionCard from "../../components/transactions/TransactionCard";
import TransactionFilters from "../../components/transactions/TransactionFilters";
import QuickStatsCards from "../../components/transactions/QuickStatsCards";
import TransactionTable from "../../components/transactions/TransactionTable";

export default function TransactionHistory() {
  usePageTitle("Transaction History");

  const [transactions, setTransactions] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    provider: "",
    type: "",
    status: "",
    source_currency: "",
    destination_currency: "",
    date_from: "",
    date_to: "",
    search: "",
    ordering: "-created_at",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch quick stats
  const fetchQuickStats = async () => {
    try {
      setStatsLoading(true);
      const tokens = JSON.parse(localStorage.getItem("bitexly_tokens") || "{}");
      const response = await apiClient.get("/users/transactions/stats/quick/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (response.data.success) {
        setQuickStats(response.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const tokens = JSON.parse(localStorage.getItem("bitexly_tokens") || "{}");

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "20",
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(
        `/users/transactions/history/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );

      if (response.data.results) {
        setTransactions(response.data.results);
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / 20));
      } else if (response.data.transactions) {
        setTransactions(response.data.transactions);
        setTotalCount(response.data.count || response.data.transactions.length);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Export transactions
  const handleExport = async (format = "csv") => {
    try {
      const tokens = JSON.parse(localStorage.getItem("bitexly_tokens") || "{}");
      const response = await apiClient.get(
        `/users/transactions/export/?format=${format}`,
        {
          headers: { Authorization: `Bearer ${tokens.access}` },
          responseType: format === "csv" ? "blob" : "json",
        }
      );

      if (format === "csv") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchTransactions(1);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      provider: "",
      type: "",
      status: "",
      source_currency: "",
      destination_currency: "",
      date_from: "",
      date_to: "",
      search: "",
      ordering: "-created_at",
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchQuickStats();
    fetchTransactions(currentPage);
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
      fetchTransactions(currentPage);
    }
  }, [currentPage]);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] bg-blue-500/20 dark:bg-blue-700/30 rounded-full top-[-200px] left-[-200px] filter blur-3xl"
          animate={{ x: [0, 200, 0], y: [0, 150, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] bg-purple-400/15 dark:bg-purple-500/20 rounded-full bottom-[-150px] right-[-150px] filter blur-3xl"
          animate={{ x: [0, -150, 0], y: [0, -100, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
        />
        <Particles />
      </div>

      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage all your transactions
          </p>
        </motion.div>

        {/* Quick Stats */}
        <QuickStatsCards stats={quickStats} loading={statsLoading} />

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {Object.values(filters).some((v) => v && v !== "-created_at") && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => fetchTransactions(currentPage)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-lg"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-blue-500 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === "table"
                  ? "bg-blue-500 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Table
            </button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <TransactionFilters
              filters={filters}
              setFilters={setFilters}
              onApply={applyFilters}
              onReset={resetFilters}
              onClose={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {Object.entries(filters).some(([key, value]) => value && key !== "ordering") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex flex-wrap gap-2"
          >
            {Object.entries(filters).map(
              ([key, value]) =>
                value &&
                key !== "ordering" && (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    <span className="font-medium capitalize">{key.replace("_", " ")}:</span>
                    <span>{value}</span>
                    <button
                      onClick={() => setFilters({ ...filters, [key]: "" })}
                      className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Transactions Display */}
        {!loading && !error && (
          <>
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {transactions.map((transaction, index) => (
                    <TransactionCard
                      key={transaction.transaction_id}
                      transaction={transaction}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <TransactionTable transactions={transactions} />
            )}

            {/* Empty State */}
            {transactions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Activity className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No transactions found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Try adjusting your filters or make your first transaction
                </p>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-center items-center gap-2"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:shadow-md"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  Next
                </button>
              </motion.div>
            )}

            {/* Results Count */}
            {totalCount > 0 && (
              <p className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                Showing {(currentPage - 1) * 20 + 1} -{" "}
                {Math.min(currentPage * 20, totalCount)} of {totalCount} transactions
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}