import { Menu, Bell } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  return (
    <nav className="w-full flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-blue-600">Bitexly</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-[4px] py-[1px] rounded-full">
            3
          </span>
        </button>

        <img
          src="https://i.pravatar.cc/40"
          alt="User avatar"
          className="w-10 h-10 rounded-full border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
        />
      </div>
    </nav>
  );
}