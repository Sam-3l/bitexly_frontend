import React from "react";
import Header from "/src/components/home/Header";
import Footer from "/src/components/home/Footer";
import usePageTitle from "../hooks/usePageTitle";

const TermsOfUse = () => {
  usePageTitle("Terms Of Use");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
    <Header />
    <main className="max-w-4xl mx-auto px-4 py-12 pt-24 text-slate-800 dark:text-slate-200 leading-relaxed space-y-8">
      <h1 className="text-3xl font-bold text-inherit">Terms of Use</h1>

      {/* 1. Introduction */}
      <section>
        <h2 className="text-2xl font-semibold text-inherit">1. Introduction</h2>
        <p>
          These Terms govern your relationship with Bitexly and define the rules for accessing and using our Services, including the website, APIs, and mobile applications. By using our Services, you accept these Terms. If you do not agree, do not use the Services.
        </p>
        <p>
          You acknowledge that using Virtual Currencies (VCs) involves risks, and Bitexly operates solely as a non-custodial aggregator, not holding or controlling user funds.
        </p>
      </section>

      {/* 2. Eligibility and Access */}
      <section>
        <h2 className="text-2xl font-semibold text-inherit">2. Eligibility and Access</h2>
        <p>You represent and warrant that:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>You are at least 18 years old or of legal age in your jurisdiction.</li>
          <li>You have full legal capacity to accept these Terms.</li>
          <li>You are not in a Restricted Jurisdiction.</li>
          <li>You will comply with all applicable laws when using the Services.</li>
        </ul>
        <p>Bitexly may restrict or suspend access for violations, legal or regulatory risks, or non-compliance with KYC/AML requirements.</p>
      </section>

      {/* 3. Use of Services */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">3. Use of Services</h2>
        <p>
          Services must be used lawfully. Bitexly acts only as a technical facilitator for VC swaps and third-party transactions. Users are responsible for:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Accuracy of information, wallet addresses, and payment details.</li>
          <li>Security of private keys, wallets, and credentials.</li>
          <li>Understanding terms, fees, and conditions of Third-Party Providers.</li>
          <li>Compliance with all laws and regulations.</li>
        </ul>
        <p>
          Prohibited uses include fraud, hacking, automation without authorization, misrepresentation, and abusive behavior. Bitexly may terminate access for violations.
        </p>
      </section>

      {/* 4. Transactions and Execution */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">4. Transactions and Execution</h2>
        <p>
          Transactions occur directly with Third-Party Providers. Key stages include:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Order Creation: selecting assets to exchange.</li>
          <li>Deposit Generation: system creates a unique deposit address.</li>
          <li>Execution: Third-Party Provider executes the swap.</li>
          <li>Delivery: converted funds sent to the Recipient Address.</li>
        </ul>
        <p>
          Bitexly does not store funds. Users are responsible for correct addresses. Refunds are handled exclusively by the relevant Third-Party Provider. Transactions are final once confirmed on the blockchain.
        </p>
      </section>

      {/* 5. Third-Party Providers */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">5. Third-Party Providers</h2>
        <p>
          Bitexly integrates with independent providers but does not guarantee performance, quality, or reliability. Disputes, refunds, or claims must be directed to the provider. Bitexly may facilitate communication but is not obligated to resolve disputes.
        </p>
      </section>

      {/* 6. Fees, Rates, and Payments */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">6. Fees, Rates, and Payments</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Bitexly itself does not charge fees, but Third-Party Providers may impose transaction or network fees.</li>
          <li>Exchange rates are provided by Third-Party Providers; Bitexly does not guarantee accuracy.</li>
          <li>Users are responsible for taxes, duties, and currency conversion risks.</li>
          <li>No custody or balance holding is provided by Bitexly.</li>
        </ul>
      </section>

      {/* 7. User Responsibilities */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">7. User Responsibilities</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide accurate and complete information.</li>
          <li>Maintain control and security of wallets and private keys.</li>
          <li>Comply with applicable laws, including AML/KYC obligations.</li>
          <li>Understand financial and technological risks.</li>
          <li>Not rely on Bitexly for financial advice.</li>
        </ul>
      </section>

      {/* 8. Intellectual Property */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">8. Intellectual Property</h2>
        <p>
          All materials on the platform are owned by Bitexly or its licensors. Users receive a limited, non-transferable license to access the Services lawfully. Unauthorized use is prohibited.
        </p>
      </section>

      {/* 9. Risk Disclosure */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">9. Risk Disclosure</h2>
        <p>
          Virtual Currencies are volatile and blockchain transactions are irreversible. Risks include market fluctuations, network failures, technical issues, regulatory changes, cybersecurity threats, and limited liquidity.
        </p>
      </section>

      {/* 10. Limitation of Liability */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">10. Limitation of Liability</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Bitexly is not liable for third-party actions, indirect, incidental, or consequential damages.</li>
          <li>Total liability is capped at USD 100.</li>
          <li>Users agree to indemnify Bitexly for claims arising from their actions or violations.</li>
        </ul>
      </section>

      {/* 11. Termination and Suspension */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">11. Termination and Suspension</h2>
        <p>
          Bitexly may suspend or terminate access for violations, legal risks, or AML/KYC non-compliance. Users may stop using the Services at any time. Obligations, indemnities, and survival clauses remain effective post-termination.
        </p>
      </section>

      {/* 12. Dispute Resolution */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">12. Dispute Resolution</h2>
        <p>
          Users should attempt good-faith resolution with support. Unresolved disputes may go to binding arbitration in the British Virgin Islands. Exceptions apply for intellectual property or emergency relief.
        </p>
      </section>

      {/* 13. Restricted Jurisdictions */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">13. Restricted Jurisdictions</h2>
        <p>
          Residents of Restricted Jurisdictions are prohibited from using the Services. Circumventing restrictions via VPN or proxies is a breach.
        </p>
      </section>

      {/* 14. Complaints and Support */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">14. Complaints and Support</h2>
        <p>
          Users can submit complaints to info@bitexly.com. Bitexly acknowledges complaints within 3 business days and aims to provide substantive responses within 15 business days. Third-party provider issues may require opening tickets with the provider.
        </p>
      </section>

      {/* 15. General Provisions */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">15. General Provisions</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>These Terms are the entire agreement and supersede prior communications.</li>
          <li>Bitexly may update Terms at any time; continued use constitutes acceptance.</li>
          <li>Users may not assign rights without consent; Bitexly may assign freely.</li>
          <li>Failure to enforce a provision is not a waiver.</li>
          <li>Invalid provisions do not affect the rest of the Terms.</li>
          <li>Notices may be sent electronically to the provided email.</li>
        </ul>
      </section>

      {/* 16. Regulatory Status */}
      <section>
        <h2 className="text-inherit text-2xl font-semibold">16. Regulatory Status</h2>
        <p>
          Bitexly is a non-custodial technology platform and not a bank, exchange, or financial advisor. Users are solely responsible for compliance with laws, taxation, and cross-border regulations.
        </p>
      </section>
    </main>
    <Footer />
    </div>
  );
};

export default TermsOfUse;