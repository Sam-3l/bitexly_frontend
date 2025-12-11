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
            These Terms of Use govern your relationship with Bitexly and outline the conditions for accessing and using our Services, including the Website, APIs, mobile applications, and related infrastructure. By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, you must stop using the Services.
          </p>
          <p>
            Bitexly operates as a non-custodial digital platform. We do not provide Virtual Currency storage, safekeeping, custodial, or withdrawal services. Our role is limited to aggregating and facilitating technical access to cryptocurrency swap, on-ramp, and off-ramp offerings provided by independent Third-Party Providers.
          </p>
          <p>
            You acknowledge that using Virtual Currencies involves inherent risks, including volatility and regulatory uncertainty. You confirm that you have the knowledge and risk tolerance required to use our Services.
          </p>
        </section>

        {/* 2. Eligibility and Access to Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">2. Eligibility and Access to Services</h2>
          <p>You represent and warrant that:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>You are at least 18 years old or of legal age in your jurisdiction.</li>
            <li>You have full legal capacity and authority to enter into these Terms.</li>
            <li>You are not located in or associated with any Restricted Jurisdiction.</li>
            <li>You will comply with all applicable laws and regulations when using the Services.</li>
          </ul>
          <p>
            Bitexly may restrict or suspend access at any time if we believe you breached these Terms, violated applicable laws, created legal or reputational risk, or failed to comply with AML/KYC procedures.
          </p>
        </section>

        {/* 3. Use of Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">3. Use of Services</h2>
          <p>
            You agree to use the Services only for lawful purposes. Bitexly provides technical access to Third-Party Providers but does not act as a counterparty, broker, or intermediary.
          </p>
          <p>You are solely responsible for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Providing accurate information, including wallet addresses and payment details.</li>
            <li>Maintaining the security of your wallets, private keys, and credentials.</li>
            <li>Understanding the terms and fees of Third-Party Providers before initiating a Transaction.</li>
            <li>Complying with all laws applicable to your use of the Services.</li>
          </ul>
          <p>Prohibited activities include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Money laundering, terrorist financing, and sanctions evasion.</li>
            <li>Hacking, disrupting, or attempting unauthorized access to the Services.</li>
            <li>Using bots or automated scripts without authorization.</li>
            <li>Providing false or misleading information.</li>
            <li>Any behavior that could harm Bitexly or its partners.</li>
          </ul>
        </section>

        {/* 4. Transactions and Execution */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">4. Transactions and Execution</h2>
          <p>All Transactions occur directly between you and a Third-Party Provider. Key stages include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Order Creation</li>
            <li>Deposit Address Generation</li>
            <li>Execution by the Third-Party Provider</li>
            <li>Delivery to your Recipient Address</li>
          </ul>
          <p>
            Bitexly does not control funds at any point. You are responsible for ensuring the accuracy of all wallet addresses. Transactions are final once confirmed on the blockchain and cannot be reversed.
          </p>
          <p>
            Refunds for failed or incomplete transactions are handled exclusively by the relevant Third-Party Provider.
          </p>
        </section>

        {/* 5. Third-Party Providers and External Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">5. Third-Party Providers and External Services</h2>
          <p>
            Bitexly integrates services from independent Third-Party Providers. We do not guarantee their performance, accuracy, reliability, or compliance. All disputes or claims related to a Transaction must be handled directly with the provider.
          </p>
          <p>
            External links, widgets, or integrations provided through Bitexly are used at your own risk.
          </p>
        </section>

        {/* 6. Fees, Rates, and Payments */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">6. Fees, Rates, and Payments</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Bitexly does not charge platform fees unless explicitly stated.</li>
            <li>Third-Party Providers may charge their own fees and spreads.</li>
            <li>Network or gas fees are paid directly to blockchain validators, not Bitexly.</li>
            <li>Exchange rates are informational and provided by Third-Party Providers.</li>
            <li>You are responsible for taxes and applicable regulatory costs.</li>
          </ul>
        </section>

        {/* 7. User Responsibilities and Representations */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">7. User Responsibilities and Representations</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>You must provide accurate and complete information.</li>
            <li>You are solely responsible for wallet security and private key management.</li>
            <li>You confirm compliance with AML, KYC, and all applicable laws.</li>
            <li>You acknowledge and accept all risks associated with Virtual Currencies.</li>
            <li>You agree not to rely on Bitexly for financial or investment advice.</li>
          </ul>
        </section>

        {/* 8. Intellectual Property */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">8. Intellectual Property</h2>
          <p>
            All trademarks, content, software, and intellectual property belong to Bitexly or its licensors. You are granted a limited, non-transferable license to use the Services. Unauthorized copying, modification, or distribution is prohibited.
          </p>
        </section>

        {/* 9. Risk Disclosure */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">9. Risk Disclosure</h2>
          <p>You understand and accept that:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Virtual Currencies are volatile and may lose value rapidly.</li>
            <li>Blockchain transactions are irreversible.</li>
            <li>Network congestion or failures may delay or impact Transactions.</li>
            <li>Cybersecurity risks, including hacks and phishing, may result in loss.</li>
            <li>Regulatory changes may affect your use of Virtual Currencies.</li>
          </ul>
        </section>

        {/* 10. Limitation of Liability and Indemnification */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">10. Limitation of Liability and Indemnification</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Bitexly is not liable for the actions or failures of Third-Party Providers.</li>
            <li>We are not responsible for indirect, incidental, or consequential damages.</li>
            <li>Total liability is capped at USD 100.</li>
            <li>You agree to indemnify Bitexly for any claims resulting from your misuse of the Services.</li>
          </ul>
        </section>

        {/* 11. Termination and Suspension */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">11. Termination and Suspension</h2>
          <p>
            Bitexly may suspend or terminate access immediately for policy violations, legal risks, or failure to comply with verification requirements. You may stop using the Services at any time. Certain obligations survive termination.
          </p>
        </section>

        {/* 12. Dispute Resolution and Governing Law */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">12. Dispute Resolution and Governing Law</h2>
          <p>
            Users should first attempt good-faith resolution through our support team. Unresolved disputes will be handled through binding arbitration in the British Virgin Islands, unless otherwise required by law.
          </p>
          <p>You waive any right to participate in class actions.</p>
        </section>

        {/* 13. Restricted Jurisdictions */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">13. Restricted Jurisdictions</h2>
          <p>
            Users from Restricted Jurisdictions are strictly prohibited from using the Services. You must not use VPNs, proxies, or tools to disguise your location.
          </p>
        </section>

        {/* 14. Complaints and Support */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">14. Complaints and Support</h2>
          <p>
            Complaints may be submitted to info@bitexly.com. We acknowledge complaints within 3 business days and aim to respond within 15 business days. Issues involving Third-Party Providers may require you to open a ticket directly with them.
          </p>
        </section>

        {/* 15. General Provisions */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">15. General Provisions</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>These Terms constitute the entire agreement between you and Bitexly.</li>
            <li>Bitexly may update these Terms at any time; continued use signifies acceptance.</li>
            <li>Users may not assign rights without approval; Bitexly may assign freely.</li>
            <li>Failure to enforce a provision is not a waiver.</li>
            <li>If any provision is invalid, remaining provisions remain enforceable.</li>
            <li>Notices will be sent electronically or posted on Bitexly.com.</li>
          </ul>
        </section>

        {/* 16. Regulatory Classification and Legal Status */}
              <section>
                <h2 className="text-2xl font-semibold text-inherit">16. Regulatory Classification and Legal Status</h2>
                <p>
                  Bitexly is a non-custodial technology platform. We do not operate as a bank, exchange, broker, financial advisor, payment institution, or money services business. All financial processing and settlement are performed by independent, regulated Third-Party Providers.
                </p>
                <p>
                  All information provided through our Services is for informational and technical purposes only. You are solely responsible for determining the legality of your activities, as well as any tax or compliance obligations.
                </p>
              </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;