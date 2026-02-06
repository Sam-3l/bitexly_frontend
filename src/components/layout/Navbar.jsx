import { Bell, Sun, Moon, History, Home, Menu, X } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "/logo.png";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Transactions", path: "/transactions", icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-4 relative z-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bitexly Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-wide transition-colors duration-300">
            Bitexly
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive(item.path)
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-slate-300 dark:hover:bg-white/30 transition"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-700 dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700 dark:text-white" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-slate-300 dark:hover:bg-white/30 transition"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full hover:bg-red-600 transition"
            title="Logout"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg z-50 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive(item.path)
                  ? "bg-blue-500 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}