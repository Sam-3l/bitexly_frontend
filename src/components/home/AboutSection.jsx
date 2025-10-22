import React from 'react';
import { Check } from 'lucide-react';
import Badge from './Badge';

const AboutSection = () => {
  const benefits = [
    "Fast and reliable crypto transactions",
    "Secure infrastructure and data protection",
    "Transparent and fair pricing",
    "Responsive customer support"
  ];

  const stats = [
    { value: "2024", label: "Founded", gradient: "from-blue-500 to-cyan-500" },
    { value: "10+", label: "Partners & Integrations", gradient: "from-purple-500 to-pink-500" },
    { value: "Active", label: "Growing User Base", gradient: "from-green-500 to-emerald-500" },
    { value: "24/7", label: "Platform Availability", gradient: "from-orange-500 to-red-500" }
  ];

  return (
    <section id="about" className="py-24 lg:py-32 bg-white dark:bg-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <Badge variant="purple" className="mb-6">About Bitexly</Badge>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Simplifying Access to
                <span className="block mt-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Digital Assets
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                Bitexly is a digital asset platform designed to make crypto trading simple and accessible.
                We bring together trusted providers, intuitive tools, and secure infrastructure — helping users buy and manage cryptocurrencies with confidence.
              </p>
              
              {/* Benefits List */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 group animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Check className="text-white" size={16} />
                    </div>
                    <span className="text-lg text-slate-700 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className="relative animate-slide-in-right">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              
              {/* Stats Container */}
              <div className="relative bg-white dark:bg-slate-900 backdrop-blur-2xl rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group animate-scale-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        {stat.value}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 font-medium">
                        {stat.label}
                      </div>
                      
                      {/* Decorative Element */}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>

                {/* Bottom Accent */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    Built with trust, transparency, and user empowerment in mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default AboutSection;