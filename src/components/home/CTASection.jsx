import React from 'react';
import { ArrowRight, ChevronRight, Shield, Zap, Globe } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const features = [
    { icon: Shield, text: "Bank-Level Security" },
    { icon: Zap, text: "Instant Processing" },
    { icon: Globe, text: "Global Access" }
  ];

  return (
    <section className="py-10 lg:py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in-up">
            Your Crypto Journey
            <span className="block mt-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Starts Here
            </span>
          </h2>
          
          {/* Subheading */}
          <p className="text-2xl text-slate-600 dark:text-slate-300 mb-12 animate-fade-in-up animation-delay-200">
            Fast, secure, and transparent — the way crypto should be.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up animation-delay-400">
            <Link to="/register">
                <Button size="lg" icon={ArrowRight} className="group w-full">
                    Get Started
                </Button>
            </Link>
            <Button size="lg" variant="secondary" icon={ChevronRight}>
              Learn More
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 animate-fade-in-up animation-delay-600">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-slate-800 backdrop-blur-xl rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <feature.icon 
                  size={20} 
                  className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" 
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 animate-fade-in-up animation-delay-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "100+", label: "Supported Countries" },
                { value: "10+", label: "Trusted Partners" },
                { value: "Global", label: "User Reach" },
                { value: "24/7", label: "Platform Availability" }
              ].map((stat, index) => (
                <div key={index} className="group hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
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
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default CTASection;