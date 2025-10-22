import { Bell, Sun, Moon } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "/logo.png";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Bitexly Logo" className="w-8 h-8 object-contain" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide transition-colors duration-300">
          Bitexly
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Google Play Store Icon */}
        <a
          href="https://play.google.com/store/apps/details?id=yourapp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-slate-300 dark:hover:bg-white/30 transition"
        >
          <img
            src="/google-play-badge.png"
            alt="Google Play"
            className="h-5 w-auto"
          />
        </a>

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

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-slate-300 dark:hover:bg-white/30 transition">
          <Bell className="w-5 h-5 text-slate-700 dark:text-white" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-[4px] py-[1px] rounded-full">
            3
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full hover:bg-red-600 transition"
        >
          <img
            src="/logout-icon.png"
            alt="Logout"
            className="w-5 h-5 text-white"
          />
        </button>
      </div>
    </nav>
  );
}