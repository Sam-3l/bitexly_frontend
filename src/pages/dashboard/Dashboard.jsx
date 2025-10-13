import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import ExchangeBox from "../../components/ui/ExchangeBox";
import usePageTitle from "../../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">

      {/* Blurred animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[800px] h-[800px] bg-purple-700/30 rounded-full top-[-200px] left-[-200px] filter blur-3xl"
          animate={{ x: [0, 200, 0], y: [0, 150, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] bg-pink-500/20 rounded-full bottom-[-150px] right-[-150px] filter blur-3xl"
          animate={{ x: [0, -150, 0], y: [0, -100, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] bg-indigo-500/20 rounded-full top-[200px] right-[-150px] filter blur-3xl"
          animate={{ y: [0, 100, 0], x: [0, -50, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 35, ease: "easeInOut" }}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex justify-center items-center min-h-[calc(100vh-80px)] relative z-10 w-full">
        <div className="w-full">
          <ExchangeBox />
        </div>
      </main>
    </div>
  );
}