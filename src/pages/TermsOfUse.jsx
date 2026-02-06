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

        {/* Company Information */}
        <section>
          <p>
            BTL Technologies Ltd is a technology and digital-products company incorporated in the British Virgin Islands with the registered address Morgan & Morgan Building, P.O. Box 958, Pasea Estate, Road Town, Tortola, British Virgin Island.
          </p>
        </section>

        {/* Definitions */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">Definitions</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Terms of Use</strong> – Refers to this legally binding document outlining the terms and conditions governing the use of Bitexly's Services.</li>
            <li><strong>User or You</strong> – Any individual or legal entity that accesses, browses, or uses the Services.</li>
            <li><strong>Website</strong> – The official Bitexly website located at Bitexly.com.</li>
            <li><strong>We, Us, or Service Provider</strong> – Refers to Bitexly, a non-custodial digital platform that aggregates cryptocurrency swap, on-ramp, and off-ramp offers, and provides Users with technical access to swap functionalities offered by independent Third-Party Providers. Bitexly does not provide digital asset storage, custodial, or wallet services.</li>
            <li><strong>Services</strong> – Collectively refers to the technology infrastructure provided by Bitexly, including (but not limited to) the Website, associated APIs, mobile applications, tools, and other functionalities developed to aggregate offers and facilitate User access to External Services.</li>
            <li><strong>External Services</strong> – Third-party platforms, websites, applications, or widgets that are integrated with or accessible through Bitexly's Services.</li>
            <li><strong>VC (Virtual Currency)</strong> – A digital representation of value that can be digitally transferred, traded, or used for exchange purposes.</li>
            <li><strong>API (Application Programming Interface)</strong> – A technical interface that allows different software systems to communicate and interact.</li>
            <li><strong>Third-Party Provider</strong> – Any independent company or individual, other than Bitexly, that offers products or services accessible through Bitexly's platform.</li>
            <li><strong>Swap Exchange</strong> – The conversion or trade of one asset (such as Virtual Currency or fiat currency) for another, executed by a Third-Party Provider.</li>
            <li><strong>Original Deposit Address</strong> – The User-controlled Virtual Currency address from which the initial transaction is sent.</li>
            <li><strong>Deposit Address</strong> – The temporary Virtual Currency address generated for technical processing of a Transaction. It is not intended for storage or safekeeping. Funds sent to this address are used exclusively for executing the intended exchange through Third-Party Providers.</li>
            <li><strong>Recipient Address</strong> – The Virtual Currency address provided by the User to receive the converted asset upon successful completion of a Transaction.</li>
            <li><strong>Transaction</strong> – The process of exchanging digital assets via the Services, initiated by the User and executed by a Third-Party Provider, encompassing all stages from order creation to completion or refund.</li>
            <li><strong>Politically Exposed Person (PEP)</strong> – An individual who currently holds or has previously held a prominent public position, whether domestic or international (e.g., head of state, senior politician), as well as their immediate family members and known associates linked through personal or business relationships.</li>
            <li><strong>Restricted Jurisdiction</strong> – Any country or region where use of the Services is prohibited or limited due to applicable laws, regulations, sanctions, or risk considerations identified by Bitexly.</li>
            <li><strong>AML/KYC (Anti-Money Laundering/Know Your Customer)</strong> – Refers to the compliance measures, policies, and procedures implemented to prevent illegal activities such as money laundering or terrorist financing.</li>
            <li><strong>VC Swap</strong> – The exchange of one form of Virtual Currency for another Virtual Currency.</li>
            <li><strong>Wallet Address</strong> – A unique alphanumeric identifier representing a specific Virtual Currency account or wallet.</li>
          </ol>
        </section>

        {/* About BTL Technologies */}
        <section>
          <p>
            BTL Technologies Ltd is a technology and digital-products company incorporated in the British Virgin Islands. It is the corporate entity behind Bitexly, a non-custodial cryptocurrency exchange-aggregator that allows users to buy, sell, and swap digital assets via third-party providers.
          </p>
          <p>
            BTL Technologies Ltd's core activities include developing and maintaining the Bitexly platform, managing integrations with licensed payment and liquidity partners, handling brand, marketing, and product strategy, and providing customer-facing support for the Bitexly website and app.
          </p>
          <p>
            The company itself does not operate as a custodian, exchange, or payment institution and does not hold user funds. All fiat processing and crypto settlement on Bitexly are carried out by external, regulated partners under their own licenses and compliance frameworks. BTL Technologies Ltd positions itself as a software and infrastructure provider, earning revenue from technology fees, referral/commission arrangements, and other business-to-business cooperation agreements.
          </p>
        </section>

        {/* 1. Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">1. Introduction</h2>
          <p>
            1.1. These Terms of Use govern your relationship with Bitexly and define the terms under which you may access and use our Services. The Services collectively refer to the technology platform integrated into the Bitexly.com website, associated application programming interfaces (APIs), mobile applications, and other related functionalities. These Terms constitute the entire agreement and understanding between You and Bitexly regarding the use of our Services.
          </p>
          <p>
            1.2. If You do not agree with these Terms of Use, You must refrain from accessing or using our Services. By accessing, browsing, or using the Services in any manner, You acknowledge that You have read, understood, and agreed to be bound by these Terms of Use, which form a legally binding agreement between You and Bitexly.
          </p>
          <p>
            1.3. You acknowledge and agree that using the Services involves inherent risks, including but not limited to those described in Section 9 (Risk Disclosure). By using the Services, You represent and warrant that You possess the necessary knowledge, understanding, and risk tolerance to engage in activities involving Virtual Currencies (VCs) and related services.
          </p>
          <p>
            1.4. You understand and acknowledge that Bitexly operates as a non-custodial digital platform. Bitexly does not provide Virtual Currency safekeeping, storage, or withdrawal services. Our platform functions solely as a technical aggregator, enabling Users to initiate Virtual Currency swaps and transactions through independent Third-Party Providers. Bitexly does not hold, control, or have access to Users' funds beyond the technical execution required for a specific Transaction. We do not operate or maintain user accounts that store or manage Virtual Currencies.
          </p>
        </section>

        {/* 2. Eligibility and Access to Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">2. Eligibility and Access to Services</h2>
          <p>2.1. By accessing or using the Services, You represent and warrant that You:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) are at least 18 years of age or the legal age of majority in Your jurisdiction;</li>
            <li>(b) have full legal capacity and authority to enter into these Terms of Use;</li>
            <li>(c) are not a resident, national, or citizen of a Restricted Jurisdiction; and</li>
            <li>(d) will comply with all applicable laws, regulations, and rules when using the Services.</li>
          </ul>
          <p>
            2.2. You are solely responsible for ensuring that Your use of the Services is lawful under the laws and regulations of the country or territory in which You reside or access the Services. Bitexly shall not be held liable for any unlawful or unauthorized use of the Services.
          </p>
          <p>2.3. Bitexly reserves the right to restrict, suspend, or terminate access to the Services at any time, without prior notice, if we reasonably believe that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) You have breached these Terms of Use;</li>
            <li>(b) Your use of the Services violates applicable laws or regulations;</li>
            <li>(c) You are located in, or transacting from, a Restricted Jurisdiction; or</li>
            <li>(d) Your activity poses legal, regulatory, or reputational risks to Bitexly or its Third-Party Providers.</li>
          </ul>
          <p>
            2.4. Bitexly may, at its sole discretion, implement identity verification, AML/KYC procedures, or other due diligence measures as required by law or internal policy. You agree to provide accurate, complete, and up-to-date information upon request. Failure to comply may result in the suspension or termination of access to the Services.
          </p>
          <p>
            2.5. Access to the Services does not establish or imply any form of partnership, fiduciary relationship, or joint venture between You and Bitexly. Your use of the Services is conducted entirely on a non-custodial and self-directed basis, with all control and responsibility over Your Virtual Currencies remaining with You.
          </p>
        </section>

        {/* 3. Use of Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">3. Use of Services</h2>
          <p>
            <strong>3.1. Permitted Use</strong><br />
            You agree to use the Services only for lawful purposes and in accordance with these Terms of Use. Bitexly provides access to a non-custodial platform that enables Users to discover, compare, and technically initiate Virtual Currency swaps, on-ramps, and off-ramps offered by independent Third-Party Providers. You acknowledge that Bitexly acts solely as a technical facilitator and not as a counterparty, broker, or financial intermediary to any Transaction.
          </p>
          <p>
            <strong>3.2. User Responsibility</strong><br />
            You are solely responsible for:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) ensuring the accuracy of all information You provide during a Transaction, including wallet addresses and payment details;</li>
            <li>(b) maintaining full control and security of Your private keys, wallets, and authentication credentials;</li>
            <li>(c) understanding the terms, fees, and conditions of each Third-Party Provider before initiating a Transaction; and</li>
            <li>(d) complying with all applicable laws and regulations in connection with Your use of the Services.</li>
          </ul>
          <p>
            Bitexly bears no responsibility for any loss arising from errors, omissions, or failures in the information You provide or in the handling of Your own digital assets.
          </p>
          <p>
            <strong>3.3. Prohibited Use</strong><br />
            You shall not use the Services for any unlawful, abusive, or fraudulent activity, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) engaging in money laundering, terrorist financing, or sanctions evasion;</li>
            <li>(b) attempting to hack, disrupt, or interfere with the functionality of the Services or any connected system;</li>
            <li>(c) using automated tools, bots, or scripts to access the Services without authorization;</li>
            <li>(d) providing false, misleading, or incomplete information;</li>
            <li>(e) conducting any activity that could damage Bitexly's reputation or that of its partners; or</li>
            <li>(f) attempting to circumvent regional, regulatory, or technical access restrictions.</li>
          </ul>
          <p>
            Bitexly reserves the right to restrict or terminate Your access if such activity is suspected or confirmed.
          </p>
          <p>
            <strong>3.4. Third-Party Providers</strong><br />
            Transactions facilitated through Bitexly are executed directly between You and independent Third-Party Providers. Bitexly neither executes nor settles Transactions. By initiating a swap or payment through the Services, You acknowledge that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Bitexly does not control the actions or performance of Third-Party Providers;</li>
            <li>(b) Bitexly is not responsible for the quality, delivery, or timeliness of any service provided by a Third-Party Provider; and</li>
            <li>(c) any dispute, refund, or inquiry related to a Transaction must be addressed directly with the relevant Third-Party Provider.</li>
          </ul>
          <p>
            <strong>3.5. Technical Integration and Availability</strong><br />
            Bitexly strives to maintain reliable access to its platform and integrations but does not guarantee uninterrupted availability. Temporary service interruptions may occur due to maintenance, upgrades, or network issues. Bitexly shall not be liable for any delay, downtime, or technical failure affecting access to or performance of the Services.
          </p>
          <p>
            <strong>3.6. User Conduct</strong><br />
            You agree to act in good faith when using the Services and to refrain from any conduct that may harm Bitexly, its partners, or other Users. Bitexly reserves the right to monitor compliance and take any lawful action, including suspension or termination of access, to ensure proper use of the platform.
          </p>
        </section>

        {/* 4. Transactions and Execution */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">4. Transactions and Execution</h2>
          <p>
            <strong>4.1. Transaction Overview</strong><br />
            By initiating a Transaction through the Bitexly platform, You instruct a connected Third-Party Provider to exchange one form of Virtual Currency or fiat currency for another. Bitexly does not execute, process, or control the underlying exchange but provides the technical infrastructure that enables You to connect to and interact with Third-Party Provider systems.
          </p>
          <p>
            <strong>4.2. Transaction Process</strong><br />
            Each Transaction consists of the following key stages:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Order Creation – You select the desired pair of assets and confirm Your intent to exchange via Bitexly's interface.</li>
            <li>(b) Deposit Generation – The system generates a Deposit Address for You to send the source asset. This address is unique to each Transaction and used only for technical routing by the selected Third-Party Provider.</li>
            <li>(c) Execution – Upon confirmation of the deposit, the Third-Party Provider executes the swap or conversion according to its own terms and exchange rate.</li>
            <li>(d) Delivery – The converted Virtual Currency is sent by the Third-Party Provider to the Recipient Address provided by You.</li>
          </ul>
          <p>Bitexly does not control or store any funds during this process.</p>
          <p>
            <strong>4.3. Deposit Address and Ownership</strong><br />
            The Deposit Address is provided for the sole purpose of completing a single Transaction and is not intended for long-term storage or reuse. You must ensure that the Original Deposit Address—from which You send funds—is under Your control. Any funds sent from unverified, incorrect, or unrelated sources may not be recoverable.
          </p>
          <p>
            <strong>4.4. Recipient Address</strong><br />
            You are solely responsible for providing the correct Recipient Address for the delivery of exchanged funds. Bitexly shall not be liable for any loss resulting from the use of an incorrect, incompatible, or compromised address provided by You.
          </p>
          <p>
            <strong>4.5. Confirmation and Settlement</strong><br />
            Transactions are considered final once confirmed by the blockchain and acknowledged by the relevant Third-Party Provider. Bitexly has no ability to alter, reverse, or cancel completed blockchain transactions.
          </p>
          <p>
            <strong>4.6. Refunds and Failed Transactions</strong><br />
            Refunds, reversals, or compensation for failed or incomplete Transactions are managed exclusively by the relevant Third-Party Provider, subject to its own refund policy and technical procedures. Bitexly does not hold or issue refunds directly. In case of an error or failed Transaction, You must contact the respective Third-Party Provider's support channel.
          </p>
          <p>
            <strong>4.7. Fees and Rates</strong><br />
            Bitexly does not directly charge Users for swaps or conversions. However, Third-Party Providers may apply their own fees, exchange spreads, or network costs as part of a Transaction. By proceeding, You acknowledge that Bitexly does not determine or guarantee exchange rates, fees, or execution times.
          </p>
          <p>
            <strong>4.8. Network and Blockchain Delays</strong><br />
            All Transactions rely on public blockchain networks. Network congestion, technical delays, or gas-fee fluctuations may impact processing times. Bitexly assumes no responsibility for such delays or any resulting impact on conversion rates or asset value.
          </p>
          <p>
            <strong>4.9. Transaction Irreversibility</strong><br />
            Due to the immutable nature of blockchain technology, all confirmed Virtual Currency transfers are final and irreversible. You acknowledge that Bitexly cannot retrieve, modify, or compensate for any funds lost due to errors, omissions, or incorrect addresses provided by You.
          </p>
          <p>
            <strong>4.10. Transaction Limits</strong><br />
            Third-Party Providers may impose minimum and maximum Transaction limits. Such limits are beyond Bitexly's control and are subject to change at any time without notice.
          </p>
        </section>

        {/* 5. Third-Party Providers and External Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">5. Third-Party Providers and External Services</h2>
          <p>
            <strong>5.1. Independent Nature of Third-Party Providers</strong><br />
            Bitexly integrates with independent Third-Party Providers to enable Users to access Virtual Currency swaps, on-ramps, and off-ramps. Each Third-Party Provider operates under its own terms, conditions, and policies. By engaging in a Transaction through the Bitexly platform, You acknowledge that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Bitexly does not act as an agent, broker, intermediary, or counterparty to any Transaction;</li>
            <li>(b) all exchanges, conversions, and payments are executed solely by the selected Third-Party Provider; and</li>
            <li>(c) any contractual relationship related to the Transaction exists exclusively between You and the relevant Third-Party Provider.</li>
          </ul>
          <p>
            <strong>5.2. No Endorsement or Guarantee</strong><br />
            Bitexly does not endorse, control, or guarantee the accuracy, availability, or quality of any product or service offered by Third-Party Providers. The inclusion of a Third-Party Provider within the Bitexly platform does not constitute an endorsement, recommendation, or certification of its reliability or regulatory status. You are encouraged to review and understand each provider's terms and policies before proceeding with any Transaction.
          </p>
          <p>
            <strong>5.3. External Links and Integrations</strong><br />
            The Services may contain links, widgets, APIs, or redirect features to External Services, including but not limited to third-party exchanges, payment processors, wallets, or analytics providers. Such integrations are provided solely for technical convenience. Bitexly has no control over the content, security, or practices of any External Service and shall not be responsible for any loss, damage, or liability arising from Your interaction with them.
          </p>
          <p>
            <strong>5.4. Third-Party Terms</strong><br />
            Your use of any Third-Party Provider or External Service is subject to that provider's own terms of service, privacy policy, and operational requirements. You acknowledge that those documents govern Your rights and obligations with respect to the Third-Party Provider, and Bitexly shall not be liable for any act, omission, delay, or default by such providers.
          </p>
          <p>
            <strong>5.5. Liability Disclaimer</strong><br />
            Bitexly expressly disclaims all liability arising from or related to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) the performance, security, or reliability of any Third-Party Provider or External Service;</li>
            <li>(b) any loss or damage caused by inaccurate exchange rates, technical errors, downtime, or network failures attributable to Third-Party Providers; and</li>
            <li>(c) any unauthorized or illegal activity, including fraud or misconduct, committed by Third-Party Providers or their affiliates.</li>
          </ul>
          <p>
            Bitexly's role is limited to providing the technological interface that enables the aggregation and technical facilitation of Transactions.
          </p>
          <p>
            <strong>5.6. Provider Changes and Discontinuation</strong><br />
            Bitexly reserves the right to modify, suspend, or terminate access to any Third-Party Provider or integration at any time, without prior notice, for reasons including but not limited to legal, regulatory, or operational considerations. Bitexly shall not be held liable for any loss resulting from such modification or discontinuation.
          </p>
          <p>
            <strong>5.7. Responsibility for Disputes</strong><br />
            All inquiries, disputes, or refund requests concerning a Transaction must be directed to the relevant Third-Party Provider. Bitexly may, at its discretion, facilitate communication between You and the provider but shall not be obligated to mediate, resolve, or compensate for any dispute.
          </p>
        </section>

        {/* 6. Fees, Rates, and Payment Terms */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">6. Fees, Rates, and Payment Terms</h2>
          <p>
            <strong>6.1. Overview of Fees</strong><br />
            Bitexly itself does not directly charge Users any platform or service fees for accessing its aggregation services unless expressly stated otherwise. However, Third-Party Providers accessible through Bitexly may impose their own fees, spreads, or transaction costs related to swaps, on-ramps, off-ramps, or conversions. You acknowledge that such fees are determined solely by the respective provider and are beyond Bitexly's control.
          </p>
          <p>
            <strong>6.2. Displayed Rates and Pricing Information</strong><br />
            All exchange rates, conversion estimates, and pricing information displayed on Bitexly are for informational purposes only and are provided by Third-Party Providers via automated API integrations.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Bitexly does not guarantee the accuracy, timeliness, or final execution rate of any quoted amount.</li>
            <li>(b) The final rate applicable to a Transaction may vary due to blockchain confirmation times, market volatility, liquidity conditions, or delays on the Third-Party Provider's side.</li>
            <li>(c) Bitexly shall not be held liable for any difference between the quoted and executed rates.</li>
          </ul>
          <p>
            <strong>6.3. Network and Transaction Fees</strong><br />
            Certain blockchain transactions require payment of network or gas fees to process and confirm operations on the relevant blockchain. These fees are not collected or controlled by Bitexly but are instead distributed to network validators or miners. Users are solely responsible for covering these fees, which may fluctuate based on blockchain congestion.
          </p>
          <p>
            <strong>6.4. Third-Party Payment Methods</strong><br />
            Some Third-Party Providers may offer fiat on-ramp or off-ramp services (e.g., via debit/credit card, Apple Pay, Google Pay, or other payment channels). These payment methods are processed directly by the relevant Third-Party Provider or their authorized payment processor. Bitexly does not collect, store, or process any fiat funds or payment card information.
          </p>
          <p>
            <strong>6.5. Currency Conversion Risks</strong><br />
            If Your Transaction involves multiple currencies (fiat or digital), You acknowledge that exchange rate fluctuations may affect the final amount received. Bitexly assumes no responsibility for any loss arising from unfavorable exchange movements, market volatility, or delays in settlement.
          </p>
          <p>
            <strong>6.6. No Custody or Balance Holding</strong><br />
            Bitexly is a non-custodial platform and does not maintain user balances, wallets, or stored value accounts. Any funds or assets exchanged through the platform are transmitted directly between You and the relevant Third-Party Provider. Bitexly never takes possession or control of User assets at any stage of the Transaction.
          </p>
          <p>
            <strong>6.7. Taxes and Regulatory Costs</strong><br />
            You are solely responsible for determining, reporting, and paying any taxes, duties, or levies that may apply to Your use of the Services or to any Transaction executed through the platform. Bitexly does not calculate, collect, or remit taxes on behalf of Users or Third-Party Providers.
          </p>
          <p>
            <strong>6.8. Fee Transparency</strong><br />
            Where possible, Bitexly will display relevant fee information as provided by Third-Party Providers. However, since such data may vary dynamically and originate from external systems, Bitexly cannot guarantee that displayed fees are exhaustive or fully up-to-date. It remains Your responsibility to review and confirm the applicable fees before confirming any Transaction.
          </p>
        </section>

        {/* 7. User Responsibilities and Representations */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">7. User Responsibilities and Representations</h2>
          <p>
            <strong>7.1. Accuracy of Information</strong><br />
            You agree to provide accurate, complete, and truthful information when using the Services, including when initiating Transactions or responding to verification requests. You are solely responsible for ensuring that all wallet addresses, transaction details, and other inputs are correct before proceeding. Bitexly shall not be held liable for losses resulting from errors, omissions, or inaccuracies in information You provide.
          </p>
          <p>
            <strong>7.2. Control and Security of Wallets</strong><br />
            You acknowledge that You are solely responsible for maintaining the security of Your digital wallets, private keys, and authentication credentials. Bitexly has no access to or control over Your wallets or funds. Any loss resulting from compromised keys, unauthorized access, or mishandling of wallet credentials shall be borne solely by You.
          </p>
          <p>
            <strong>7.3. Compliance with Applicable Laws</strong><br />
            You represent and warrant that Your use of the Services complies with all applicable laws, regulations, and directives in Your jurisdiction, including those relating to anti-money laundering (AML), counter-terrorist financing (CTF), and sanctions compliance. You agree not to use the Services in connection with any unlawful activity or for any purpose prohibited by these Terms of Use.
          </p>
          <p>
            <strong>7.4. AML/KYC Cooperation</strong><br />
            Bitexly and its Third-Party Providers may, where required by law or internal policy, request identity verification or supporting documentation from You. By using the Services, You agree to cooperate fully with any such request and to provide accurate information for AML/KYC purposes. Failure to comply may result in restricted access, suspension, or termination of Your use of the Services.
          </p>
          <p>
            <strong>7.5. Responsibility for Devices and Connections</strong><br />
            You are responsible for ensuring that the device, software, and internet connection You use to access the Services are secure, reliable, and free of malicious software. Bitexly shall not be responsible for technical issues, hacks, or vulnerabilities arising from Your device or network environment.
          </p>
          <p>
            <strong>7.6. Representation of Legal Capacity</strong><br />
            By using the Services, You represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) You have the full legal right, authority, and capacity to enter into and perform under these Terms of Use;</li>
            <li>(b) You are not acting on behalf of or for the benefit of any third party in violation of applicable law; and</li>
            <li>(c) You are not located in, a resident of, or otherwise subject to any Restricted Jurisdiction.</li>
          </ul>
          <p>
            <strong>7.7. Financial and Risk Acknowledgment</strong><br />
            You acknowledge and accept that engaging with Virtual Currencies involves market volatility, potential loss of value, and regulatory uncertainty. You confirm that You have sufficient knowledge and understanding of blockchain technology and digital assets to evaluate the risks independently before using the Services.
          </p>
          <p>
            <strong>7.8. No Reliance on Advice</strong><br />
            You understand that Bitexly does not provide financial, investment, or legal advice. Any information, rates, or market data displayed on the platform are for informational and technical purposes only. You are solely responsible for making independent decisions before initiating any Transaction.
          </p>
          <p>
            <strong>7.9. User Conduct</strong><br />
            You agree not to use the Services to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) engage in illegal, fraudulent, or deceptive activities;</li>
            <li>(b) upload or transmit malicious code or automated scripts;</li>
            <li>(c) interfere with or attempt to gain unauthorized access to Bitexly's systems;</li>
            <li>(d) impersonate another person or entity; or</li>
            <li>(e) abuse, threaten, or harass Bitexly staff, partners, or Users.</li>
          </ul>
          <p>
            Violation of these obligations may result in immediate suspension or permanent termination of access to the Services.
          </p>
          <p>
            <strong>7.10. Responsibility for Third-Party Interaction</strong><br />
            You acknowledge that all communications, payments, and exchanges with Third-Party Providers are conducted at Your own discretion and risk. Bitexly assumes no responsibility for any transaction, claim, or dispute arising from Your interactions with those providers.
          </p>
        </section>

        {/* 8. Intellectual Property Rights */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">8. Intellectual Property Rights</h2>
          <p>
            <strong>8.1. Ownership of Materials</strong><br />
            All content, designs, trademarks, service marks, trade names, logos, software, code, databases, and other intellectual property appearing on or related to the Services are the exclusive property of Bitexly or its licensors. These materials are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            <strong>8.2. Limited License to Users</strong><br />
            Bitexly grants You a non-exclusive, non-transferable, revocable, and limited license to access and use the Services strictly for lawful purposes and in accordance with these Terms. Nothing in these Terms shall be interpreted as granting any ownership rights or licenses beyond this limited right of use.
          </p>
          <p>
            <strong>8.3. Prohibited Uses</strong><br />
            You may not copy, modify, reproduce, distribute, reverse-engineer, decompile, or create derivative works based on the Services or any part thereof without Bitexly's prior written consent. Any unauthorized use of Bitexly's intellectual property shall result in immediate termination of this license and may lead to legal action.
          </p>
          <p>
            <strong>8.4. Third-Party Rights</strong><br />
            All third-party names, logos, or trademarks displayed on the Bitexly platform remain the property of their respective owners. Their inclusion does not imply affiliation, endorsement, or sponsorship by Bitexly.
          </p>
        </section>

        {/* 9. Risk Disclosure */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">9. Risk Disclosure</h2>
          <p>
            <strong>9.1. General Risk Statement</strong><br />
            The use of Virtual Currencies (VCs) and blockchain-based services involves substantial risk. By accessing or using the Services, You acknowledge and accept that You are engaging in activities that may result in partial or total financial loss. Bitexly strongly advises You to assess Your financial situation, experience level, and risk tolerance before engaging in any Transaction through the platform.
          </p>
          <p>
            <strong>9.2. Market and Price Volatility</strong><br />
            The value of Virtual Currencies is highly volatile and may fluctuate dramatically over short periods. Market movements can be unpredictable and influenced by external factors such as government regulations, technological changes, security breaches, or macroeconomic events. Bitexly does not control or influence market rates and shall not be liable for losses arising from adverse price movements or liquidity issues.
          </p>
          <p>
            <strong>9.3. Blockchain and Network Risks</strong><br />
            Transactions facilitated through the Services depend on decentralized blockchain networks that are beyond Bitexly's control. These networks may experience congestion, forks, attacks, or other technical failures that delay or prevent Transaction execution. Bitexly bears no responsibility for such network-related risks, including any resulting loss of funds or delays in settlement.
          </p>
          <p>
            <strong>9.4. Non-Custodial Nature of Services</strong><br />
            Bitexly operates as a non-custodial platform, meaning that it never holds, stores, or controls Your Virtual Currencies or private keys. You remain solely responsible for the management and safekeeping of Your wallets and digital assets. Any loss caused by the loss, theft, or compromise of private keys or wallet credentials shall be borne exclusively by You.
          </p>
          <p>
            <strong>9.5. Third-Party Provider Risks</strong><br />
            Transactions initiated through Bitexly are executed by independent Third-Party Providers. These providers may experience operational, regulatory, or technical issues that can impact Your Transaction. Bitexly does not guarantee their performance, solvency, or reliability. Any dispute, delay, or loss arising from the actions or omissions of a Third-Party Provider must be resolved directly with that provider.
          </p>
          <p>
            <strong>9.6. Regulatory and Legal Risks</strong><br />
            The legal status of Virtual Currencies varies by jurisdiction and is subject to change. Regulatory developments may affect the availability, legality, or taxation of Your activities involving VCs. Bitexly does not provide legal advice and shall not be responsible for determining the legality of Your use of the Services in any jurisdiction.
          </p>
          <p>
            <strong>9.7. Cybersecurity and Technical Risks</strong><br />
            Although Bitexly employs industry-standard security measures, no online system is immune to cybersecurity threats. Hacks, phishing, malware, or unauthorized access may result in financial loss or data exposure. You acknowledge that You use the Services at Your own risk and agree to implement best practices to secure Your devices, wallets, and network access.
          </p>
          <p>
            <strong>9.8. Irreversibility of Transactions</strong><br />
            All blockchain-based transactions are final and irreversible once recorded on the network. In the event of an error, loss, or unauthorized transfer, Bitexly has no ability to alter, cancel, or recover the transaction. You accept that responsibility for verifying transaction accuracy rests solely with You before submission.
          </p>
          <p>
            <strong>9.9. Liquidity and Conversion Risks</strong><br />
            Certain Virtual Currencies may have limited liquidity, resulting in unfavorable pricing or difficulty completing conversions. Bitexly cannot guarantee the availability of counterparties or the completion of a swap. You accept that liquidity risk may impact both execution times and final amounts received.
          </p>
          <p>
            <strong>9.10. Taxation Risks</strong><br />
            You are solely responsible for understanding and complying with applicable tax laws related to the acquisition, disposal, or exchange of Virtual Currencies. Bitexly does not provide tax advice and assumes no responsibility for Your tax obligations or reporting duties.
          </p>
          <p>
            <strong>9.11. Technology and System Risks</strong><br />
            Technical malfunctions, internet outages, or system upgrades may disrupt the Services temporarily. While Bitexly endeavors to maintain consistent uptime, it does not guarantee uninterrupted access. You acknowledge that such disruptions may affect the timing or outcome of Transactions.
          </p>
          <p>
            <strong>9.12. No Guarantee of Profit or Value</strong><br />
            Bitexly makes no representations or warranties regarding the future value, profitability, or performance of any Virtual Currency. All transactions are conducted at Your sole risk, and You acknowledge that You may lose the entire amount exchanged.
          </p>
        </section>

        {/* 10. Limitation of Liability and Indemnification */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">10. Limitation of Liability and Indemnification</h2>
          <p>
            <strong>10.1. No Liability for Third-Party Actions</strong><br />
            Bitexly provides technical access to Third-Party Providers but does not control, monitor, or influence their operations. You acknowledge and agree that Bitexly shall not be liable for any act, omission, delay, failure, or misconduct of any Third-Party Provider or External Service, including but not limited to failed, delayed, or incorrect Transactions, loss of funds, or service disruptions.
          </p>
          <p>
            <strong>10.2. Limitation of Damages</strong><br />
            To the maximum extent permitted by applicable law, Bitexly, its affiliates, directors, officers, employees, contractors, and agents shall not be liable for any indirect, incidental, consequential, exemplary, or special damages arising out of or in connection with:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) the use or inability to use the Services;</li>
            <li>(b) the cost of procurement of substitute goods or services;</li>
            <li>(c) unauthorized access to or alteration of Your data;</li>
            <li>(d) reliance on or use of any data, rates, or information obtained through the Services; or</li>
            <li>(e) loss of profits, revenue, goodwill, or anticipated savings.</li>
          </ul>
          <p>
            This limitation applies regardless of whether the alleged liability is based on contract, tort, negligence, strict liability, or any other legal theory—even if Bitexly was advised of the possibility of such damages.
          </p>
          <p>
            <strong>10.3. Aggregate Liability Cap</strong><br />
            In no event shall Bitexly's total aggregate liability to You for any and all claims arising from or related to these Terms of Use exceed the equivalent of one hundred U.S. dollars (USD 100), regardless of the cause or number of claims.
          </p>
          <p>
            <strong>10.4. No Warranty or Guarantee</strong><br />
            Bitexly provides the Services on an "as is" and "as available" basis without warranties or representations of any kind, express or implied. Bitexly makes no guarantees that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) the Services will be uninterrupted, error-free, or secure;</li>
            <li>(b) any Transaction will be completed or successful; or</li>
            <li>(c) any displayed rates or data will be accurate or current.</li>
          </ul>
          <p>
            All implied warranties, including those of merchantability, fitness for a particular purpose, and non-infringement, are expressly disclaimed to the fullest extent permitted by law.
          </p>
          <p>
            <strong>10.5. Force Majeure</strong><br />
            Bitexly shall not be responsible for any failure or delay in performance resulting from events beyond its reasonable control, including but not limited to natural disasters, acts of war, government action, labor disputes, internet failures, power outages, network congestion, or the acts of third parties.
          </p>
          <p>
            <strong>10.6. Indemnification</strong><br />
            You agree to indemnify, defend, and hold harmless Bitexly, its affiliates, employees, directors, and partners from and against any and all claims, damages, liabilities, losses, costs, or expenses (including reasonable legal fees) arising from or relating to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Your use or misuse of the Services;</li>
            <li>(b) any violation of these Terms of Use or applicable law by You;</li>
            <li>(c) any breach of Your representations or warranties under these Terms; or</li>
            <li>(d) any third-party claim resulting from Your actions, omissions, or conduct in connection with the Services.</li>
          </ul>
          <p>
            <strong>10.7. Third-Party Claims</strong><br />
            If any third party asserts a claim against Bitexly arising from Your conduct, Bitexly reserves the right to assume exclusive defense and control of the matter, in which case You agree to cooperate fully with any reasonable request in such defense.
          </p>
          <p>
            <strong>10.8. Regulatory Compliance Disclaimer</strong><br />
            Bitexly makes no representation or warranty regarding the legal or regulatory status of any Virtual Currency, exchange, or transaction. You are solely responsible for determining whether Your use of the Services complies with local laws, including taxation, reporting, and licensing obligations.
          </p>
          <p>
            <strong>10.9. Survival</strong><br />
            The provisions of this Section shall survive termination or expiration of these Terms of Use and shall remain in full force and effect to the extent necessary to protect Bitexly from ongoing or potential liabilities.
          </p>
        </section>

        {/* 11. Termination and Suspension of Services */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">11. Termination and Suspension of Services</h2>
          <p>
            <strong>11.1. Right to Terminate or Suspend</strong><br />
            Bitexly reserves the right, at its sole discretion and without prior notice, to suspend, restrict, or permanently terminate Your access to the Services if:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) You breach or violate any provision of these Terms of Use;</li>
            <li>(b) You engage in or are suspected of engaging in fraudulent, unlawful, or abusive conduct;</li>
            <li>(c) Your activity creates legal, regulatory, or reputational risk for Bitexly or its partners;</li>
            <li>(d) You refuse or fail to comply with AML/KYC requirements or provide accurate verification information; or</li>
            <li>(e) You are located in or transacting from a Restricted Jurisdiction.</li>
          </ul>
          <p>Such suspension or termination may occur immediately and without liability to Bitexly.</p>
          <p>
            <strong>11.2. Effect of Termination</strong><br />
            Upon termination or suspension of access:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Your right to use the Services shall immediately cease;</li>
            <li>(b) all pending or incomplete Transactions facilitated through Bitexly may be canceled or delayed by the respective Third-Party Provider;</li>
            <li>(c) Bitexly shall not be responsible for any losses or unexecuted Transactions resulting from such termination; and</li>
            <li>(d) any obligations, indemnities, or liabilities incurred prior to termination shall continue to apply.</li>
          </ul>
          <p>
            <strong>11.3. Termination by User</strong><br />
            You may stop using the Services at any time without notice to Bitexly. Discontinuing use of the platform constitutes termination of these Terms as they apply to You; however, any rights and obligations that, by their nature, should survive termination (including those under Sections 9 and 10) shall remain in effect.
          </p>
          <p>
            <strong>11.4. Compliance and Investigation Rights</strong><br />
            Bitexly may monitor and review activity on the platform to ensure compliance with these Terms and applicable laws. If required, Bitexly may report suspicious activities to regulatory authorities, law enforcement, or other relevant entities. You agree to cooperate with any lawful investigation related to Your use of the Services.
          </p>
          <p>
            <strong>11.5. No Obligation to Retain Access or Data</strong><br />
            Following termination, Bitexly is not obligated to maintain, store, or provide You with access to any information, transaction history, or data related to Your use of the Services. Any stored data will be handled in accordance with the Privacy and Data Protection provisions outlined in Section 8.
          </p>
          <p>
            <strong>11.6. Temporary Suspension</strong><br />
            Bitexly may temporarily suspend the Services for maintenance, upgrades, or unforeseen technical issues. Such suspensions will be minimized where possible but may occur without prior notice. Bitexly shall not be liable for any losses or delays resulting from temporary unavailability.
          </p>
          <p>
            <strong>11.7. Discretionary Reinstatement</strong><br />
            Reinstatement of access following suspension or termination is subject to Bitexly's sole discretion. Bitexly may require proof of identity, updated documentation, or assurances of compliance prior to restoring access.
          </p>
          <p>
            <strong>11.8. Survival of Provisions</strong><br />
            The following sections shall survive termination or suspension of these Terms: Sections 7 (User Responsibilities), 8 (Privacy and Data Protection), 9 (Risk Disclosure), 10 (Limitation of Liability), 12 (Dispute Resolution), and 13 (General Provisions), together with any others that, by their nature, are intended to survive.
          </p>
        </section>

        {/* 12. Dispute Resolution and Governing Law */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">12. Dispute Resolution and Governing Law</h2>
          <p>
            <strong>12.1. Good-Faith Resolution</strong><br />
            Bitexly encourages Users to first attempt to resolve any concerns or disputes amicably by contacting our support team at info@bitexly.com. We will make reasonable efforts to address and resolve such issues in good faith before formal proceedings are initiated.
          </p>
          <p>
            <strong>12.2. Informal Negotiation Period</strong><br />
            Before initiating any legal or arbitration proceeding, the disputing party must provide written notice to the other party describing the nature and basis of the dispute, along with the requested resolution. Both parties shall have thirty (30) days from receipt of the notice to engage in good-faith negotiations to resolve the matter.
          </p>
          <p>
            If the dispute cannot be resolved within this period, it shall be handled according to the provisions outlined below.
          </p>
          <p>
            <strong>12.3. Arbitration Agreement</strong><br />
            Except where prohibited by applicable law, any dispute, controversy, or claim arising out of or relating to these Terms of Use, the Services, or any Transaction executed through Bitexly shall be finally resolved by binding arbitration.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) The arbitration shall be conducted under the rules of the International Chamber of Commerce (ICC) or another recognized arbitration body agreed upon by both parties.</li>
            <li>(b) The seat of arbitration shall be British Virgin Islands, unless otherwise required by law.</li>
            <li>(c) The language of arbitration shall be English.</li>
            <li>(d) The arbitral tribunal shall consist of one (1) arbitrator, appointed in accordance with the applicable arbitration rules.</li>
            <li>(e) The arbitrator's award shall be final and binding on both parties, and judgment on the award may be entered in any court having competent jurisdiction.</li>
          </ul>
          <p>
            <strong>12.4. Exceptions to Arbitration</strong><br />
            Notwithstanding the foregoing, either party may seek injunctive or equitable relief in a competent court for:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) the protection of intellectual property rights; or</li>
            <li>(b) the enforcement of confidentiality obligations or interim relief necessary to prevent irreparable harm.</li>
          </ul>
          <p>
            <strong>12.5. Governing Law</strong><br />
            These Terms of Use and any dispute or claim arising from or related to their subject matter shall be governed and construed in accordance with the laws of British Virgin Islands, without regard to conflict-of-law principles.
          </p>
          <p>
            If You are accessing the Services from outside restricted territories, You are responsible for compliance with all local laws that may apply to You.
          </p>
          <p>
            <strong>12.6. Class Action Waiver</strong><br />
            To the fullest extent permitted by law, You agree that any dispute or claim shall be resolved solely on an individual basis and not as part of any class, collective, or representative action. You further waive any right to participate in such actions or to consolidate claims with those of other Users.
          </p>
          <p>
            <strong>12.7. Time Limitation for Claims</strong><br />
            Any claim or cause of action arising from or relating to these Terms or Your use of the Services must be filed within one (1) year after the cause of action arose. Failure to file within this period shall permanently bar such claims, regardless of any contrary statute or law.
          </p>
          <p>
            <strong>12.8. Costs and Expenses</strong><br />
            Unless otherwise determined by the arbitrator, each party shall bear its own costs and expenses related to dispute resolution proceedings, including legal and administrative fees.
          </p>
          <p>
            <strong>12.9. Non-Exclusive Jurisdiction</strong><br />
            Subject to the arbitration clause above, if any claim is permitted to be filed in court, the courts of British Virgin Islands shall have non-exclusive jurisdiction over such matters. You hereby consent to the personal jurisdiction of those courts and waive any objection to venue or forum.
          </p>
        </section>

        {/* 13. Restricted Jurisdictions */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">13. Restricted Jurisdictions</h2>
          <p>
            <strong>13.1. Prohibited Use</strong><br />
            You agree not to access or use the Services if You are a resident, citizen, or national of, or are otherwise located, incorporated, or operating from, any jurisdiction listed below, or any territory where the use of cryptocurrency exchange or aggregator services is restricted or prohibited by law.
          </p>
          <p>
            As of the effective date of these Terms, Restricted Jurisdictions include (but are not limited to):
          </p>
          <p>
            Afghanistan, Bangladesh, Belarus, Bolivia, Burma (Myanmar), Burundi, Canada, Central African Republic, China, Democratic Republic of the Congo, Côte d'Ivoire, Cuba, Eritrea, Ethiopia, Germany, Guinea, Guinea-Bissau, Haiti, Iran, Iraq, Lebanon, Liberia, Libya, Mali, Montenegro, Moldova, Nicaragua, North Korea, Non-government-controlled territories of Ukraine (including the Crimea, Donetsk, Kherson, Luhansk, and Zaporizhzhia regions), Russia, Somalia, South Sudan, St. Vincent and the Grenadines, Sudan, Syria, Tunisia, Turkey, United Kingdom, United States of America (including all U.S. territories such as Puerto Rico, American Samoa, Guam, Northern Mariana Islands, and the U.S. Virgin Islands—St. Croix, St. John, and St. Thomas), Venezuela, Yemen, and Zimbabwe, as well as any country or region subject to sanctions or restrictions imposed by the United Nations Security Council, European Union (EU), Office of Foreign Assets Control (OFAC), Office of Financial Sanctions Implementation (OFSI), or any equivalent authority.
          </p>
          <p>
            If You are associated with any Restricted Jurisdiction by virtue of nationality, citizenship, residence, incorporation, or other connection, You are strictly prohibited from accessing or using the Services.
          </p>
          <p>
            <strong>13.2. Circumvention Prohibited</strong><br />
            You agree not to use any technology, including VPNs, proxies, or similar tools, to obscure or falsify Your location or to otherwise circumvent the geographic restrictions imposed by Bitexly. Any attempt to disguise or misrepresent Your jurisdictional status constitutes a material breach of these Terms.
          </p>
          <p>
            <strong>13.3. Enforcement and Consequences</strong><br />
            If Bitexly determines, in its sole discretion, that You are accessing or have accessed the Services from a Restricted Jurisdiction or have otherwise violated this Section:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Bitexly may immediately suspend or terminate Your access to the Services without prior notice;</li>
            <li>(b) Bitexly may report Your activity to relevant regulatory, governmental, or law enforcement authorities; and</li>
            <li>(c) You shall forfeit any right to refunds, reversals, or recovery of digital assets associated with such use.</li>
          </ul>
          <p>
            It is Your sole responsibility to ensure that Your access to and use of the Services comply with all applicable local laws and regulations. Bitexly bears no liability for any breach of such laws by You.
          </p>
        </section>

        {/* 14. Complaints and Support */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">14. Complaints and Support</h2>
          <p>
            <strong>14.1. How to Submit a Complaint</strong><br />
            If You wish to make a complaint about the Services, please contact us at info@bitexly.com with the subject line "Complaint – [Your Name / Entity]". Include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) Your name and contact details;</li>
            <li>(b) a clear description of the issue and when it occurred;</li>
            <li>(c) relevant Transaction details (e.g., transaction ID, currency pair, amounts, timestamps);</li>
            <li>(d) the Third-Party Provider involved (if any); and</li>
            <li>(e) any supporting evidence (screenshots, communications, wallet hashes).</li>
          </ul>
          <p>
            <strong>14.2. Acknowledgement and Timeframes</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) We will acknowledge receipt of Your complaint within 3 business days.</li>
            <li>(b) We aim to provide a substantive response within 15 business days. Where an issue is complex or depends on Third-Party Provider input, we will keep You informed and provide updates until resolved.</li>
          </ul>
          <p>
            <strong>14.3. Issues Involving Third-Party Providers</strong><br />
            Because Transactions are executed by independent Third-Party Providers, You may be required to open a ticket directly with the relevant provider. We will assist on a best-efforts basis by:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>(a) sharing technical context or logs that we control; and</li>
            <li>(b) facilitating communication between You and the provider.</li>
          </ul>
          <p>
            Bitexly does not control Third-Party Provider processes, timelines, or outcomes and is not responsible for their decisions.
          </p>
          <p>
            <strong>14.4. Escalation Path</strong><br />
            If You are dissatisfied with the initial outcome, You may request an escalation review by replying to our email and noting "Escalation Requested". Escalated reviews may involve Bitexly Compliance and/or senior management.
          </p>
          <p>
            <strong>14.5. Records and Evidence</strong><br />
            Bitexly may request additional information necessary to investigate (e.g., wallet proofs, device logs). Failure to provide requested information may limit our ability to assist.
          </p>
        </section>

        {/* 15. General Provisions */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">15. General Provisions</h2>
          <p>
            <strong>15.1. Entire Agreement</strong><br />
            These Terms of Use constitute the entire agreement between You and Bitexly concerning the use of the Services and supersede all prior or contemporaneous communications, understandings, and agreements (whether oral or written) relating to the same subject matter. No oral representations or statements shall modify these Terms.
          </p>
          <p>
            <strong>15.2. Amendments and Updates</strong><br />
            Bitexly reserves the right to modify, amend, or update these Terms of Use at any time. Updates will take effect immediately upon publication on Bitexly.com, unless otherwise stated. Continued use of the Services after such updates constitutes Your acceptance of the revised Terms. It is Your responsibility to review the Terms periodically for changes.
          </p>
          <p>
            <strong>15.3. Assignment</strong><br />
            You may not assign, delegate, or transfer any of Your rights or obligations under these Terms without prior written consent from Bitexly. Bitexly may assign or transfer its rights and obligations under these Terms, in whole or in part, without restriction or notice, including in the event of a merger, acquisition, or corporate restructuring.
          </p>
          <p>
            <strong>15.4. No Waiver</strong><br />
            Failure by Bitexly to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision. Any waiver must be in writing and signed by an authorized representative of Bitexly to be legally effective.
          </p>
          <p>
            <strong>15.5. Severability</strong><br />
            If any provision of these Terms is found to be invalid, illegal, or unenforceable under applicable law, the remaining provisions shall continue in full force and effect. The invalid provision shall be interpreted or replaced in a manner that most closely reflects the original intent and purpose of the Terms.
          </p>
          <p>
            <strong>15.6. Headings and Interpretation</strong><br />
            Headings and section titles are included for convenience only and shall not affect the interpretation or construction of these Terms. References to "You" include both individuals and entities, as applicable. Words in the singular include the plural and vice versa.
          </p>
          <p>
            <strong>15.7. Notices and Communication</strong><br />
            All notices, disclosures, or communications required under these Terms shall be deemed properly given when sent electronically to the contact email provided by You or when posted publicly on Bitexly.com. Official correspondence to Bitexly may be sent to: info@bitexly.com
          </p>
          <p>
            <strong>15.8. Relationship of the Parties</strong><br />
            Nothing in these Terms shall be construed as creating a partnership, joint venture, employment, or agency relationship between You and Bitexly. Both parties act independently, and neither has the authority to bind or obligate the other.
          </p>
          <p>
            <strong>15.9. Language</strong><br />
            These Terms are drafted in English, which shall prevail over any translation. Any translation is provided solely for convenience and shall not alter the meaning or interpretation of the English version.
          </p>
          <p>
            <strong>15.10. Survival of Terms</strong><br />
            Any provision of these Terms which, by its nature, is intended to survive termination—including but not limited to Sections 7 (User Responsibilities), 8 (Privacy and Data Protection), 9 (Risk Disclosure), 10 (Limitation of Liability), 12 (Dispute Resolution), and this Section 13—shall remain in effect following termination or expiration of the Agreement.
          </p>
          <p>
            <strong>15.11. Contact Information</strong><br />
            If You have questions, complaints, or feedback regarding these Terms of Use or the Services, You may contact Bitexly at:
          </p>
          <p>
            📩 info@bitexly.com<br />
            🌐 www.bitexly.com
          </p>
        </section>

        {/* 16. Regulatory Classification and Legal Status */}
        <section>
          <h2 className="text-2xl font-semibold text-inherit">16. Regulatory Classification and Legal Status</h2>
          <p>
            <strong>16.1. Nature of Services</strong><br />
            Bitexly operates as a non-custodial technology platform that aggregates cryptocurrency swap, on-ramp, and off-ramp offers from independent Third-Party Providers. Bitexly is not a bank, exchange, broker, financial advisor, or money services business (MSB) and does not provide investment, trading, or custodial services of any kind.
          </p>
          <p>
            <strong>16.2. No Financial Advice</strong><br />
            All information, data, and analytics presented through the Services are for informational and technical purposes only and do not constitute financial, investment, tax, or legal advice. You are solely responsible for evaluating the suitability of any Transaction before proceeding.
          </p>
          <p>
            <strong>16.3. Regulatory Compliance</strong><br />
            Bitexly endeavors to comply with applicable laws and sanctions requirements in the jurisdictions in which it operates. However, You acknowledge that Bitexly's non-custodial model means that regulatory responsibility for KYC, AML, and transaction monitoring rests primarily with the Third-Party Providers executing each Transaction.
          </p>
          <p>
            <strong>16.4. Independent Responsibility</strong><br />
            You remain solely responsible for ensuring that Your use of the Services complies with all laws and regulations applicable to You, including those concerning digital assets, taxation, and cross-border transfers.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;