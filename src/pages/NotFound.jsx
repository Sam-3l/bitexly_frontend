import React from 'react';
import { Link } from 'react-router-dom';
import Header from '/src/components/home/Header';
import Footer from '/src/components/home/Footer';
import usePageTitle from '../hooks/usePageTitle';

const NotFound = () => {
  usePageTitle('Page Not Found | Bitexly');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
          404
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
        >
          Go Back Home
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;