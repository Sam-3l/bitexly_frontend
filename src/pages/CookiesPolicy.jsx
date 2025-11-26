import React from "react";
import Header from "/src/components/home/Header";
import Footer from "/src/components/home/Footer";
import usePageTitle from "../hooks/usePageTitle";

const CookiesPolicy = () => {
  usePageTitle("Cookies Policy - Bitexly");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 pt-24 text-slate-800 dark:text-slate-200 leading-relaxed space-y-8">

        <h1 className="text-3xl font-bold text-inherit">Cookies Policy</h1>

        <p>
          <strong>Effective Date:</strong> June 12 2024 <br />
          <strong>Last Updated:</strong> November 11 2025
        </p>

        <div className="space-y-6">

          <h2 className="text-2xl font-semibold text-inherit">1. Introduction</h2>
          <p>
            This Cookies Policy explains how BTL Technologies Ltd, operating as Bitexly
            (“Bitexly,” “we,” “us,” or “our”), uses cookies and similar technologies
            on https://bitexly.com (the “Website”).
          </p>
          <p>
            By using our Website, you consent to the use of cookies in accordance with
            this Policy, unless you disable cookies through your browser settings.
          </p>

          <h2 className="text-2xl font-semibold text-inherit">2. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website.
            They allow the site to recognize your device and store certain information
            about your preferences or past actions.
          </p>
          <p>
            Cookies improve your browsing experience, enhance website functionality,
            and provide insights into site usage.
          </p>

          <h2 className="text-2xl font-semibold text-inherit">3. Types of Cookies We Use</h2>

          <h3 className="text-xl font-semibold text-inherit">A. Essential Cookies</h3>
          <p>These cookies are required for the Website to operate properly. They enable:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Security and session management</li>
            <li>Navigation and access to secure areas</li>
            <li>Load balancing and fraud prevention</li>
          </ul>
          <p>Example: session cookies that keep you logged in during a visit.</p>

          <h3 className="text-xl font-semibold text-inherit">B. Functional Cookies</h3>
          <p>These cookies allow the Website to remember preferences, such as:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your preferred language</li>
            <li>Theme settings (light/dark mode)</li>
            <li>Preferred fiat currency or crypto pair</li>
          </ul>

          <h3 className="text-xl font-semibold text-inherit">C. Analytics and Performance Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our Website and
            improve its performance.
          </p>
          <p>
            We may use third-party analytics tools (e.g., Google Analytics, Cloudflare
            Insights) to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Measure website traffic and usage patterns</li>
            <li>Identify navigation problems or errors</li>
            <li>Enhance user experience</li>
          </ul>

          <h3 className="text-xl font-semibold text-inherit">D. Marketing and Advertising Cookies</h3>
          <p>
            Some pages may include tracking pixels or cookies from partners (e.g.,
            Twitter Ads, Google Ads) to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Deliver personalized advertising</li>
            <li>Track ad campaign performance</li>
            <li>Limit ad frequency</li>
          </ul>
          <p>
            You may opt out of targeted advertising through browser settings or NAI
            opt-out tools.
          </p>

          <h3 className="text-xl font-semibold text-inherit">E. Third-Party Cookies</h3>
          <p>
            Bitexly integrates with external crypto on-ramp/off-ramp providers (e.g.,
            Changelly, Onramp Money, Mercuryo, Transak, Shift4, Kryptonim).
          </p>
          <p>
            These providers may use their own cookies for transactions, compliance checks,
            or analytics. Bitexly does not control these cookies and recommends reviewing
            each provider’s cookie policy.
          </p>

          <h2 className="text-2xl font-semibold text-inherit">4. How We Use Cookies</h2>
          <p>We use cookies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Operate and secure the Website</li>
            <li>Analyze performance and usage</li>
            <li>Personalize content and preferences</li>
            <li>Improve functionality and updates</li>
            <li>Deliver targeted ads (where applicable)</li>
          </ul>
          <p>We do NOT sell or share cookie data for unrelated marketing.</p>

          <h2 className="text-2xl font-semibold text-inherit">5. How to Manage Cookies</h2>
          <p>
            You can control or delete cookies at any time. Most browsers allow you to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accept or reject cookies</li>
            <li>Delete existing cookies</li>
            <li>Set site preferences</li>
          </ul>
          <p>Check your browser’s help section for instructions:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Google Chrome</li>
            <li>Mozilla Firefox</li>
            <li>Microsoft Edge</li>
            <li>Safari</li>
          </ul>
          <p>Disabling cookies may affect website functionality.</p>

          <h2 className="text-2xl font-semibold text-inherit">6. Do Not Track (DNT) Signals</h2>
          <p>
            Some browsers send DNT signals. Bitexly does not currently respond to DNT
            requests, as no standard exists for interpreting them.
          </p>

          <h2 className="text-2xl font-semibold text-inherit">7. Changes to This Cookies Policy</h2>
          <p>
            We may update this Policy to reflect technological, legal, or operational
            changes. Updates will include a revised “Effective Date.”
          </p>

          <h2 className="text-2xl font-semibold text-inherit">8. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, contact us at:<br />
            <strong>Email:</strong> info@bitexly.com<br />
            <strong>Website:</strong> https://bitexly.com
          </p>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default CookiesPolicy;