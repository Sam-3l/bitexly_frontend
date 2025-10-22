import { useState } from "react";
import BuyFlow from "./BuyFlow";
import SellFlow from "./SellFlow";
import SwapFlow from "./SwapFlow";

export default function ExchangeBox() {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-8 overflow-visible backdrop-blur-2xl bg-white/80 dark:bg-gray-900/60 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_40px_rgba(99,102,241,0.2)] text-slate-900 dark:text-gray-200 transition-colors duration-300">
      {/* Tabs */}
      <div className="flex justify-center mb-8 bg-slate-100 dark:bg-gray-800/50 rounded-full p-1 backdrop-blur-md border border-slate-200 dark:border-white/10 relative z-10 transition-colors duration-300">
        {["buy", "sell", "swap"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
              activeTab === tab 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
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