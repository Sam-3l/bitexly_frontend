import React from "react";
import Header from "/src/components/home/Header";
import Footer from "/src/components/home/Footer";
import usePageTitle from "../hooks/usePageTitle";

const PrivacyPolicy = () => {
  usePageTitle("Privacy Policy");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 pt-24 text-slate-800 dark:text-slate-200 leading-relaxed space-y-8">

        <h1 className="text-3xl font-bold text-inherit">Privacy Policy</h1>

        <p>
          <strong>Effective Date:</strong> June 11 2024<br />
          <strong>Last Updated:</strong> November 11 2025
        </p>

        <div className="space-y-6">
          <h2 className="text-inherit text-2xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to Bitexly, operated by BTL Technologies Ltd, a company
            incorporated under the laws of the British Virgin Islands (BVI)
            (“Bitexly,” “we,” “us,” or “our”).
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and
            protect your personal information when you access or use our website
            (bitexly.com) and related services (collectively, the “Services”).
          </p>
          <p>
            By accessing or using Bitexly, you agree to this Privacy Policy. If
            you do not agree, please discontinue use of our Services.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-inherit">A. Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact Information: such as name, email address, or phone number when you contact support.</li>
            <li>KYC Information: if required by certain on-ramp/off-ramp providers (e.g., ID, selfie, address proof).</li>
            <li>Transaction Details: wallet address, asset type, transaction amount, timestamps.</li>
            <li>Feedback and Communication: messages or inquiries you send to support.</li>
          </ul>

          <h3 className="text-xl font-semibold text-inherit">B. Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address, device identifiers, browser type.</li>
            <li>Usage data such as pages visited and actions taken.</li>
            <li>Cookies and tracking technologies for analytics and fraud prevention.</li>
          </ul>

          <h3 className="text-xl font-semibold text-inherit">C. Third-Party Data</h3>
          <p>
            We may receive limited data from integration partners like Changelly, Onramp Money, Mercuryo, Transak,
            Shift4, and Kryptonim for compliance, transaction processing, or troubleshooting.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Facilitate purchases, swaps, and sales.</li>
            <li>Comply with AML/KYC requirements.</li>
            <li>Detect and prevent fraud.</li>
            <li>Improve functionality and user experience.</li>
            <li>Provide customer support.</li>
            <li>Send security alerts and updates.</li>
          </ul>

          <p>We do not sell or rent your personal data.</p>

          <h2 className="text-inherit text-2xl font-semibold">4. How We Share Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Third-party providers for processing transactions.</li>
            <li>Compliance and analytics tools.</li>
            <li>Regulators when required by law.</li>
            <li>Business transfers in case of acquisition or restructuring.</li>
          </ul>

          <h2 className="text-inherit text-2xl font-semibold">5. Non-Custodial Nature</h2>
          <p>
            Bitexly does not store your crypto, private keys, or fiat balances. All transactions occur directly between
            you and connected providers.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">6. Data Retention</h2>
          <p>
            We retain data only as long as needed to operate the platform and comply with legal obligations.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">7. Data Security</h2>
          <p>
            We implement SSL, secure APIs, access controls, and periodic audits, but no online transmission is 100%
            secure.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">8. International Data Transfers</h2>
          <p>
            Your data may be processed in jurisdictions including the BVI, EU, or others where partners operate.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">9. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access or copies of your data.</li>
            <li>Request corrections or deletion.</li>
            <li>Withdraw consent where applicable.</li>
            <li>File complaints with a data protection authority.</li>
          </ul>

          <h2 className="text-inherit text-2xl font-semibold">10. Cookies</h2>
          <p>
            Cookies are used for functionality, analytics, and fraud prevention. You may disable cookies via browser
            settings.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">11. Third-Party Links</h2>
          <p>
            Bitexly integrates third-party services. We are not responsible for their data practices.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">12. Children’s Privacy</h2>
          <p>
            The service is not for users under 18. We do not knowingly collect data from minors.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">13. Updates to This Policy</h2>
          <p>
            Updates may occur periodically. Continued use means acceptance of changes.
          </p>

          <h2 className="text-inherit text-2xl font-semibold">14. Contact Us</h2>
          <p>
            Email: info@bitexly.com<br />
            Website: https://bitexly.com<br />
            Address: Morgan & Morgan Building, Pasea Estate, Road Town, Tortola, British Virgin Islands.
          </p>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;