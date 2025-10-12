import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
import ExchangeBox from "../../components/ui/ExchangeBox";
import usePageTitle from "../../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Welcome to Bitexly Dashboard
          </h2>
          <p className="text-gray-600 mb-8">
            Manage your crypto transactions seamlessly.
          </p>

          {/* Changelly-style exchange box */}
          <ExchangeBox />
        </main>

        <Footer />
      </div>
    </div>
  );
}