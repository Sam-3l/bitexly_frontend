import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import CoinSelect from "./CoinSelect";
import CurrencySelect from "./CurrencySelect";

export default function ExchangeBox() {
  const [activeTab, setActiveTab] = useState("buy");

  const [fromCoin, setFromCoin] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("");

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-8 overflow-visible backdrop-blur-2xl bg-gray-900/60 border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] text-gray-200">
      {/* Tabs */}
      <div className="flex justify-center mb-8 bg-gray-800/50 rounded-full p-1 backdrop-blur-md border border-white/10 relative z-10">
        {["buy", "sell", "swap"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* BUY Tab */}
      {activeTab === "buy" && (
        <div className="space-y-6 relative">
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">You Pay</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
            </div>
          </div>

          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full shadow-lg hover:shadow-indigo-500/50 transition">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">You Get</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={fromCoin} onChange={setFromCoin} />
            </div>
          </div>

          <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 relative z-10">
            Buy Now
          </button>
        </div>
      )}

      {/* SELL Tab */}
      {activeTab === "sell" && (
        <div className="space-y-6 relative">
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">You Sell</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={fromCoin} onChange={setFromCoin} />
            </div>
          </div>

          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full shadow-lg hover:shadow-indigo-500/50 transition">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">You Receive</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
            </div>
          </div>

          <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 relative z-10">
            Sell Now
          </button>
        </div>
      )}

      {/* SWAP Tab */}
      {activeTab === "swap" && (
        <div className="space-y-6 relative">
          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-30">
            <p className="text-xs text-gray-400 mb-1">From</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={swapFrom} onChange={setSwapFrom} defaultSymbol="BTC" />
            </div>
          </div>

          <div className="flex justify-center relative z-10">
            <div className="p-2 bg-indigo-600 rounded-full shadow-lg hover:shadow-indigo-500/50 transition">
              <ArrowDownUp className="text-white w-5 h-5" />
            </div>
          </div>

          <div className="border border-white/10 bg-gray-800/40 rounded-2xl p-4 backdrop-blur-md relative z-20">
            <p className="text-xs text-gray-400 mb-1">To</p>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent outline-none text-xl font-semibold text-white w-full no-spinner"
              />
              <CoinSelect value={swapTo} onChange={setSwapTo} defaultSymbol="ETH" />
            </div>
          </div>

          <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 relative z-10">
            Swap
          </button>
        </div>
      )}
    </div>
  );
}