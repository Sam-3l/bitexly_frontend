import { useState } from "react";
import BuyFlow from "./BuyFlow";
import SellFlow from "./SellFlow";
import SwapFlow from "./SwapFlow";
import { AlertCircle } from "lucide-react";

export default function ExchangeBox() {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-8 overflow-visible backdrop-blur-2xl bg-gray-900/60 border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] text-gray-200">
      {/* Tabs */}
      <div className="flex justify-center mb-8 bg-gray-800/50 rounded-full p-1 backdrop-blur-md border border-white/10 relative z-10">
        {["buy", "sell", "swap"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
              activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Render appropriate flow */}
      {activeTab === "buy" && <BuyFlow />}
      {activeTab === "sell" && <SellFlow />}
      {activeTab === "swap" && <SwapFlow />}
    </div>
  );
}