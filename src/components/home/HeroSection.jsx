import React, { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Button from './Button';
import ExchangeBox from "/src/components/ui/ExchangeBox";

const HeroSection = () => {
  const [amount, setAmount] = useState('500');
  const btcAmount = (parseFloat(amount) / 40650).toFixed(6);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 pt-20">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-left space-y-6 animate-slide-in-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                One Platform.
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">All Crypto</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient animation-delay-1000">
                On-ramps, Off-ramps
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">and Swap</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Bitexly aggregates the world's leading fiat-to-crypto providers into one simple interface.
              Compare rates in real-time, buy, sell and swap with your favorite payment method. Fast, secure, and borderless.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/register">
                <Button size="lg" icon={ArrowRight}>
                    Register Now
                </Button>
              </a>
              <a href="#providers">
                <Button size="lg" variant="secondary" icon={ChevronRight} >
                    View Providers
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 sm:gap-8 pt-4 flex-wrap">
              {[
                { value: '100+', label: 'Currencies' },
                { value: '15+', label: 'Providers' },
                { value: '24/7', label: 'Support' }
              ].map((stat, idx) => (
                <React.Fragment key={idx}>
                  <div className="animate-fade-in" style={{ animationDelay: `${idx * 200}ms` }}>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                  </div>
                  {idx < 2 && <div className="w-px h-10 sm:h-12 bg-slate-300 dark:bg-slate-700"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="relative animate-slide-in-right">
            <ExchangeBox />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;