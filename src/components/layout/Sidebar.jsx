import { Home, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // correct path
import logo from "/logo.png";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useContext(AuthContext);

  return (
    <aside
      className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:translate-x-0`}
    >
      <div className="h-full flex flex-col justify-between">
        {/* Logo + App Name */}
        <div>
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <img src={logo} alt="Bitexly Logo" className="w-8 h-8 object-contain" />
            <h2 className="text-xl font-semibold text-blue-600">Bitexly</h2>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 flex flex-col">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-md mx-2 ${
                    isActive ? "bg-blue-50 text-blue-600 font-medium" : ""
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout} // ✅ call context logout directly
          className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition mx-2 mb-4 rounded-md"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}