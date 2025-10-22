import React from 'react';
import { ThemeProvider } from '/src/context/ThemeContext';
import Header from '/src/components/home/Header';
import HeroSection from '/src/components/home/HeroSection';
import FeaturesSection from '/src/components/home/FeaturesSection';
import ProvidersSection from '/src/components/home/ProvidersSection';
import AboutSection from '/src/components/home/AboutSection';
import CTASection from '/src/components/home/CTASection';
import Footer from '/src/components/home/Footer';
import usePageTitle from "../hooks/usePageTitle";

const Home = () => {
  usePageTitle("Crypto Buy, Sell & Swap");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <ProvidersSection />
          <AboutSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Home;