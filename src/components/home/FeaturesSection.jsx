import React from 'react';
import { Globe, CreditCard, Shield, TrendingUp, Zap, Lock } from 'lucide-react';
import Badge from './Badge';

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
  return (
    <div 
      className="group relative bg-white dark:bg-slate-800 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/10 group-hover:to-purple-600/10 rounded-3xl transition-all duration-500"></div>
      
      <div className="relative z-10">
        {/* Icon Container */}
        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
          <Icon className="text-white" size={32} />
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Globe,
      title: "Multi-Provider Access",
      description: "Access verified partners like Moonpay, Onramp, Meld, Yellowcard, and more — all aggregated in one seamless interface.",
      color: "from-blue-500 to-cyan-500",
      delay: 0
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description: "Pay your way with cards, Apple Pay, Google Pay, Revolut Pay, bank transfers and multiple local payment methods.",
      color: "from-purple-500 to-pink-500",
      delay: 100
    },
    {
      icon: Shield,
      title: "Non-Custodial Security",
      description: "Your crypto goes straight to your wallet. Bitexly never holds your funds — complete ownership and control.",
      color: "from-green-500 to-emerald-500",
      delay: 200
    },
    {
      icon: TrendingUp,
      title: "Best Rates Always",
      description: "Compare providers in real-time and automatically get the best available price. Smart routing saves you money.",
      color: "from-orange-500 to-red-500",
      delay: 300
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "Industry-leading encryption, KYC verification, and compliance measures keep your transactions safe and secure.",
      color: "from-indigo-500 to-purple-500",
      delay: 400
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant quotes, rapid verification, and fast settlement. Most transactions complete in under 10 minutes.",
      color: "from-yellow-500 to-orange-500",
      delay: 500
    }
  ];

  return (
    <section id="features" className="py-24 lg:py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 animate-fade-in">
          <Badge variant="blue" className="mb-6">Core Features</Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Everything You Need in
            <span className="block mt-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">One Platform</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Experience the future of crypto trading with our comprehensive suite of features designed for simplicity and security
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;