import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import ExchangeBox from "../../components/ui/ExchangeBox";
import Particles from "../../components/ui/Particles";
import usePageTitle from "../../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-x-hidden">

      {/* Blurred animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Desktop/Tablet backgrounds */}
        <motion.div
          className="absolute w-[800px] h-[800px] sm:w-[600px] sm:h-[600px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px] bg-purple-700/30 rounded-full top-[-200px] sm:top-[-150px] left-[-200px] sm:left-[-150px] filter blur-3xl"
          animate={{ x: [0, 200, 0], y: [0, 150, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] sm:w-[500px] sm:h-[500px] md:w-[550px] md:h-[550px] lg:w-[600px] lg:h-[600px] bg-pink-500/20 rounded-full bottom-[-150px] sm:bottom-[-100px] right-[-150px] sm:right-[-100px] filter blur-3xl"
          animate={{ x: [0, -150, 0], y: [0, -100, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] sm:w-[550px] sm:h-[550px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] bg-indigo-500/20 rounded-full top-[200px] sm:top-[150px] right-[-150px] sm:right-[-100px] filter blur-3xl"
          animate={{ y: [0, 100, 0], x: [0, -50, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 35, ease: "easeInOut" }}
        />

        {/* Particle effect */}
        <Particles />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex justify-center items-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-70px)] relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full max-w-7xl">
          <ExchangeBox />
        </div>
      </main>
    </div>
  );
}