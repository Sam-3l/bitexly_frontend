import React from 'react';
import Header from '/src/components/home/Header';
import Footer from '/src/components/home/Footer';
import usePageTitle from '../hooks/usePageTitle';
import { Mail, MapPin } from 'lucide-react';

const Contact = () => {
  usePageTitle('Contact Us');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 pt-20">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-12">
            We’d love to hear from you! Reach out to us via email or visit our office.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Email */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <Mail className="text-blue-500 dark:text-blue-400 mb-4" size={36} />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Email Us</h2>
              <a 
                href="mailto:Info@bitexly.com"
                className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-300"
              >
                Info@bitexly.com
              </a>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <MapPin className="text-blue-500 dark:text-blue-400 mb-4" size={36} />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Visit Us</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Morgan & Morgan Building<br />
                Pasea Estate, Road Town<br />
                Tortola, British Virgin Islands
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;