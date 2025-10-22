import React from 'react';
import Badge from './Badge';

const ProviderCard = ({ name, logo, delay }) => {
  return (
    <div 
      className="group relative bg-white dark:bg-slate-800 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 animate-fade-in-scale"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/5 group-hover:to-purple-600/5 rounded-2xl transition-all duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {/* Provider Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center p-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-slate-200 dark:border-slate-600">
            <img 
              src={`/providers/${logo}.png`} 
              alt={name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%234F46E5" width="100" height="100"/><text x="50" y="50" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">' + name.charAt(0) + '</text></svg>';
              }}
            />
          </div>
          
          {/* Live Badge */}
          <Badge variant="green">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            Live
          </Badge>
        </div>
        
        {/* Provider Info */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
          Verified partner with competitive rates
        </p>
      </div>

      {/* Corner Accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-500/20 to-purple-600/20 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

const ProvidersSection = () => {
  const providers = [
    { name: "Moonpay", logo: "moonpay" },
    { name: "Onramp Money", logo: "onramp" },
    { name: "Transak", logo: "transak" },
    { name: "Mercuryo", logo: "mercuryo" },
    { name: "Meld", logo: "meld" },
    { name: "Changelly", logo: "changelly" },
  ];

  return (
    <section id="providers" className="py-10 lg:py-10 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white mb-5">
            Trusted{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            We've partnered with the world's leading crypto providers to bring you the best rates, widest coverage, and most reliable service
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers.map((provider, index) => (
            <ProviderCard 
              key={index} 
              {...provider} 
              delay={index * 50}
            />
          ))}
        </div>

        {/* CTA Text */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            And more providers being added every month
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.5s ease-out forwards;
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

export default ProvidersSection;