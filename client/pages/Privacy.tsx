import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalPageLayout from "@/components/site/LegalPageLayout";

export default function Privacy() {
  useEffect(() => { document.title = "Privacy Policy | PaintBookCo"; }, []);

  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="10th April 2026"
      version="Version 1.0"
    >
      <div className="notice-box">
        <strong>Summary:</strong> PaintBookCo collects personal data you provide when using
        our platform — to connect customers with painters, process payments securely through
        Transpact (our FCA-authorised escrow partner), verify painter identities, and improve
        our service. We do not sell your data. You have rights under UK GDPR to access,
        correct, and delete your information. ICO Registration No. ZC118117.
      </div>

      {/* 1 */}
      <h2>1. Who We Are</h2>
      <p>
        The PaintBook Company Ltd (trading as <strong>PaintBookCo</strong>) is a company
        incorporated in England and Wales, Company Number 16690724. We operate the
        PaintBookCo platform at <strong>paintbookco.co.uk</strong> — the UK's first
        painter-only digital marketplace connecting professional painters and decorators with
        customers seeking painting services.
      </p>
      <table>
        <tbody>
          <tr><td><strong>Legal name</strong></td><td>The PaintBook Company Ltd</td></tr>
          <tr><td><strong>Trading name</strong></td><td>PaintBookCo</td></tr>
          <tr><td><strong>Company number</strong></td><td>16690724</td></tr>
          <tr><td><strong>Registered address</strong></td><td>1, 1 Fenman Mews, Walkden, Manchester, UK. M28 3YU</td></tr>
          <tr><td><strong>Website</strong></td><td>paintbookco.co.uk</td></tr>
          <tr><td><strong>Contact email</strong></td><td><a href="mailto:privacy@paintbookco.co.uk">privacy@paintbookco.co.uk</a></td></tr>
          <tr><td><strong>ICO Registration</strong></td><td>ZC118117</td></tr>
        </tbody>
      </table>
      <p>
        In this Privacy Policy, 'we', 'us', and 'our' refer to The PaintBook Company Ltd.
        'Platform' refers to the PaintBookCo website and any associated services. 'You' refers
        to any person who uses or accesses the Platform, whether as a customer, a painter or
        decorator, or a visitor.
      </p>

      {/* 2 */}
      <h2>2. What This Policy Covers</h2>
      <p>This Privacy Policy explains:</p>
      <ul>
        <li>What personal data we collect about you and why we collect it</li>
        <li>The legal basis we rely on for processing your personal data</li>
        <li>How we use your personal data</li>
        <li>Who we share your personal data with</li>
        <li>How long we keep your personal data</li>
        <li>Your rights under UK GDPR and how to exercise them</li>
        <li>How to contact us with questions or complaints</li>
      </ul>
      <p>
        This policy applies to all personal data processed in connection with the PaintBookCo
        platform, including data collected when you register an account, post or accept a job,
        make or receive a payment through our escrow system, use the Paint Vestimator tool, or
        communicate with us or other users through the platform.
      </p>

      {/* 3 */}
      <h2>3. Data Controller</h2>
      <p>
        The PaintBook Company Ltd is the data controller for all personal data processed through
        the PaintBookCo platform. We are registered with the Information Commissioner's Office
        (ICO) — registration number <strong>ZC118117</strong>.
      </p>
      <p>
        For data protection queries: <a href="mailto:privacy@paintbookco.co.uk">privacy@paintbookco.co.uk</a>
      </p>

      {/* 4 */}
      <h2>4. Personal Data We Collect</h2>

      <h3>4.1 Data You Provide Directly</h3>
      <p><strong>Account Registration (All Users)</strong></p>
      <ul>
        <li>Full name, email address, and password (stored encrypted — we never see your plain-text password)</li>
        <li>User type (customer or painter/decorator)</li>
        <li>Profile photo (optional)</li>
      </ul>
      <p><strong>Painter/Decorator-Specific Data</strong></p>
      <ul>
        <li>Proof of identity (passport or driving licence) — uploaded for KYC verification</li>
        <li>Proof of address (utility bill or bank statement) — uploaded for KYC verification</li>
        <li>Public liability insurance certificate</li>
        <li>Trade qualifications and certifications (optional)</li>
        <li>Portfolio photographs and project descriptions</li>
        <li>Service area (postcodes and geographic coverage)</li>
        <li>Specialisms (e.g. interior, exterior, commercial, decorative)</li>
        <li>Availability dates</li>
        <li>Bank account details for payment via Transpact (stored securely by Transpact, not by PaintBookCo directly)</li>
        <li>Business name (if applicable)</li>
      </ul>
      <p><strong>Customer-Specific Data</strong></p>
      <ul>
        <li>Property details for job postings (address, type of work required, room dimensions)</li>
        <li>Photographs of spaces to be painted (uploaded via Paint Vestimator or job posting)</li>
        <li>Paint preferences and colour choices</li>
        <li>Budget and timeline requirements</li>
        <li>Payment details (processed securely by Transpact — PaintBookCo does not store card or bank details)</li>
      </ul>
      <p><strong>Communications Data</strong></p>
      <ul>
        <li>Messages sent through the PaintBookCo in-platform chat system (job-scoped, monitored for prohibited content)</li>
        <li>Support queries and correspondence with PaintBookCo</li>
        <li>Reviews and ratings submitted after job completion</li>
      </ul>

      <h3>4.2 Data We Collect Automatically</h3>
      <ul>
        <li>IP address, browser type and version, device type and operating system</li>
        <li>Pages visited and time spent on the Platform</li>
        <li>Referring website or search terms used to find us</li>
        <li>Session duration and activity logs</li>
        <li>Approximate geographic location (derived from IP address, not GPS)</li>
      </ul>
      <p>
        This data is collected using cookies and similar tracking technologies. See our{" "}
        <Link to="/cookies">Cookie Policy</Link> for full details.
      </p>

      <h3>4.3 Data from Third Parties</h3>
      <ul>
        <li><strong>Transpact</strong> (our escrow provider): transaction reference numbers and payment status</li>
        <li><strong>Identity verification providers</strong>: confirmation of KYC verification outcomes</li>
        <li><strong>Google Analytics</strong> and similar tools: aggregated, anonymised usage data</li>
      </ul>

      {/* 5 */}
      <h2>5. Why We Process Your Data and Our Lawful Basis</h2>
      <p>
        Under UK GDPR, we must have a lawful basis for every purpose for which we process
        personal data. The table below sets out our main processing purposes and the lawful
        basis for each.
      </p>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Lawful Basis</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Creating and managing your account</td><td>Contract</td></tr>
          <tr><td>KYC identity verification for painters</td><td>Contract + Legal obligation (AML)</td></tr>
          <tr><td>Matching customers with painters</td><td>Contract</td></tr>
          <tr><td>Processing payments via Transpact escrow</td><td>Contract</td></tr>
          <tr><td>Deducting and processing PaintBookCo commission</td><td>Contract</td></tr>
          <tr><td>Sending transactional emails (job notifications, payment confirmations, KYC decisions)</td><td>Contract</td></tr>
          <tr><td>In-platform messaging (moderated chat)</td><td>Contract + Legitimate interests</td></tr>
          <tr><td>Fraud detection and security monitoring</td><td>Legitimate interests</td></tr>
          <tr><td>Paint Vestimator usage (room dimensions, photos, estimates)</td><td>Contract + Consent</td></tr>
          <tr><td>Platform analytics and performance monitoring</td><td>Legitimate interests</td></tr>
          <tr><td>Marketing communications</td><td>Consent (opt-in only)</td></tr>
          <tr><td>Legal compliance (GDPR, AML, HMRC records)</td><td>Legal obligation</td></tr>
          <tr><td>Dispute resolution</td><td>Legitimate interests + Contract</td></tr>
        </tbody>
      </table>

      {/* 6 */}
      <h2>6. How We Use Your Personal Data</h2>

      <h3>6.1 Providing the Platform Service</h3>
      <ul>
        <li>Creating and maintaining your account</li>
        <li>Verifying painter and decorator identities and credentials (KYC)</li>
        <li>Matching customers with eligible, verified painters based on location, specialism, and availability</li>
        <li>Facilitating job postings, quotes, and bookings</li>
        <li>Processing payments and commission through Transpact (FCA-regulated)</li>
        <li>Releasing funds to painters upon confirmed job completion</li>
        <li>Sending notifications about your jobs, payments, and account status</li>
      </ul>

      <h3>6.2 Safety, Security, and Fraud Prevention</h3>
      <ul>
        <li>Monitoring in-platform communications to detect and prevent sharing of personal contact information (prohibited under our Terms of Service)</li>
        <li>Detecting and preventing fraudulent accounts, fake portfolios, and identity misrepresentation</li>
        <li>Maintaining security logs and audit trails of sensitive actions (KYC decisions, payment operations, dispute resolutions)</li>
        <li>Security monitoring via Sentry error tracking</li>
      </ul>

      <h3>6.3 Communications</h3>
      <ul>
        <li>Sending transactional emails related to your account activity</li>
        <li>Responding to support queries and complaints</li>
        <li>Sending marketing communications only where you have explicitly opted in — unsubscribe at any time via the link in any marketing email or by contacting{" "}
          <a href="mailto:m&c@paintbookco.co.uk">m&amp;c@paintbookco.co.uk</a></li>
      </ul>

      <h3>6.4 Platform Improvement</h3>
      <ul>
        <li>Analysing platform usage patterns (using anonymised or aggregated data) to improve features and user experience</li>
        <li>Improving the Paint Vestimator using anonymised and aggregated job data — we will never share identifiable personal data for this purpose</li>
        <li>Conducting A/B testing of platform features</li>
      </ul>

      <h3>6.5 Legal and Regulatory Compliance</h3>
      <ul>
        <li>Maintaining records required by HMRC (7-year retention for financial records)</li>
        <li>Maintaining KYC records as required by UK Money Laundering Regulations (5 years post-transaction)</li>
        <li>Responding to lawful requests from regulatory authorities (ICO, HMRC, law enforcement)</li>
        <li>Defending legal claims or enforcing our Terms of Service</li>
      </ul>

      {/* 7 */}
      <h2>7. Who We Share Your Personal Data With</h2>
      <p>
        We do not sell your personal data. We do not share your personal data with third parties
        for their own marketing purposes.
      </p>
      <table>
        <thead>
          <tr><th>Recipient</th><th>Why We Share Data</th><th>Data Shared</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Transpact</strong> (FCA Ref: 546279)</td>
            <td>To process payments, hold funds in escrow, release payments to painters</td>
            <td>Transaction amounts, party email addresses, transaction reference numbers, payment status</td>
          </tr>
          <tr>
            <td><strong>Supabase</strong></td>
            <td>Hosting and managing our platform database (AWS infrastructure, EU – Ireland region)</td>
            <td>All platform data: name, email, account details, job records, KYC status, payment references, activity logs</td>
          </tr>
          <tr>
            <td><strong>Didit</strong> (KYC/AML)</td>
            <td>Verifying painter identities during onboarding</td>
            <td>Full name, date of birth, government-issued ID, selfie/liveness data, verification outcome</td>
          </tr>
          <tr>
            <td><strong>AWS S3</strong></td>
            <td>Secure storage of KYC documents and platform assets (UK – London region, encrypted at rest)</td>
            <td>KYC identity documents, proof of address, insurance certificates</td>
          </tr>
          <tr>
            <td><strong>SendGrid</strong></td>
            <td>Sending transactional and notification emails on our behalf</td>
            <td>Email address, name, and relevant job or account information</td>
          </tr>
          <tr>
            <td><strong>Stream Chat</strong></td>
            <td>Providing the in-platform messaging system between matched painters and customers (EU data region)</td>
            <td>User IDs, display names, and message content within job-specific channels</td>
          </tr>
          <tr>
            <td><strong>Make.com</strong></td>
            <td>Automating platform workflows including KYC approvals, job notifications, payment triggers, and CRM updates</td>
            <td>Name, email, job status, KYC outcome, and transaction references</td>
          </tr>
          <tr>
            <td><strong>Stacksync</strong></td>
            <td>Synchronising platform data between our database (Supabase) and CRM (HubSpot)</td>
            <td>Name, email, job status, and account activity data</td>
          </tr>
          <tr>
            <td><strong>HubSpot</strong> (CRM)</td>
            <td>Managing business operations and customer support (operational use only, not marketing without consent)</td>
            <td>Name, email, job status, account activity</td>
          </tr>
          <tr>
            <td><strong>Sentry</strong></td>
            <td>Monitoring platform for technical errors to maintain uptime and performance</td>
            <td>Error logs (may include anonymised technical data — no personal content intentionally captured)</td>
          </tr>
          <tr>
            <td><strong>SightEngine</strong></td>
            <td>AI-powered detection of personal contact information in chat messages to enforce our prohibited content policy</td>
            <td>Message text submitted for moderation — SightEngine does not retain message content after analysis</td>
          </tr>
          <tr>
            <td><strong>Google Analytics</strong></td>
            <td>Understanding how users interact with our Platform</td>
            <td>Anonymised usage data, page views, session data, device/browser information</td>
          </tr>
          <tr>
            <td><strong>Legal &amp; regulatory authorities</strong></td>
            <td>Where required by law, court order, or regulatory request (e.g. ICO, HMRC, law enforcement)</td>
            <td>Relevant data as required</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Sharing between painters and customers:</strong> When a job is confirmed and
        escrow is funded, PaintBookCo will share necessary contact information between the
        matched painter and customer via a single system-generated email. This is the only
        mechanism by which contact details are exchanged — never through the in-platform
        chat. Painter profiles (name, portfolio, ratings, service area, specialism) are visible to
        customers searching on the Platform.
      </p>

      {/* 8 */}
      <h2>8. International Data Transfers</h2>
      <p>
        PaintBookCo is UK-based and stores the majority of personal data within the UK and EEA.
        Some third-party service providers may process data outside the UK/EEA. Where this
        occurs, we ensure appropriate safeguards are in place:
      </p>
      <ul>
        <li><strong>AWS (KYC storage)</strong> — EU-West-2 (London) region. Data does not leave the UK.</li>
        <li><strong>SendGrid</strong> — US-based. We rely on Standard Contractual Clauses (SCCs).</li>
        <li><strong>Stream Chat</strong> — EU data region selected. Data processed within the EEA.</li>
        <li><strong>HubSpot</strong> — US-based. We rely on SCCs and HubSpot's Data Processing Agreement.</li>
        <li><strong>Transpact</strong> — UK-based, FCA-authorised. All funds held under UK law.</li>
      </ul>

      {/* 9 */}
      <h2>9. How Long We Keep Your Personal Data</h2>
      <table>
        <thead>
          <tr><th>Data Category</th><th>Retention Period</th><th>Reason</th></tr>
        </thead>
        <tbody>
          <tr><td>Account data (name, email, profile)</td><td>Duration of account + 3 years after last activity</td><td>To resolve queries or disputes after closure</td></tr>
          <tr><td>KYC documents (identity, address, insurance)</td><td>5 years from date of last transaction</td><td>UK Money Laundering Regulations 2017</td></tr>
          <tr><td>Payment and transaction records</td><td>7 years from date of transaction</td><td>HMRC requirements</td></tr>
          <tr><td>In-platform chat messages</td><td>180 days from date of message</td><td>To support dispute resolution during and after a job. Extended where a dispute is ongoing.</td></tr>
          <tr><td>Job details (postings, milestone records)</td><td>Duration of job + 3 years</td><td>Disputes, reviews, and platform improvement</td></tr>
          <tr><td>Paint Vestimator data (room photos, dimensions)</td><td>Duration of job + 12 months, then anonymised</td><td>Photos used only for estimation. Anonymised data retained for product improvement.</td></tr>
          <tr><td>Message block log (PII filter incidents)</td><td>2 years</td><td>Security monitoring and enforcement</td></tr>
          <tr><td>Marketing consent records</td><td>Until consent is withdrawn + 3 years</td><td>To demonstrate compliance with PECR</td></tr>
          <tr><td>Support correspondence</td><td>3 years from resolution</td><td>To handle follow-up queries</td></tr>
          <tr><td>Audit logs (admin actions, KYC decisions, payment operations)</td><td>7 years</td><td>Legal compliance and accountability</td></tr>
        </tbody>
      </table>

      {/* 10 */}
      <h2>10. Your Rights Under UK GDPR</h2>
      <p>
        You have the following rights in relation to your personal data. To exercise any right,
        contact us at <a href="mailto:privacy@paintbookco.co.uk">privacy@paintbookco.co.uk</a>{" "}
        with the subject line <strong>'Data Rights Request'</strong>, including your full name, email
        address, the right you wish to exercise, and any relevant details. We will respond within
        <strong> 30 calendar days</strong>.
      </p>
      <table>
        <thead>
          <tr><th>Right</th><th>What It Means</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Right of access</strong></td>
            <td>Request a copy of the personal data we hold about you (Subject Access Request).</td>
          </tr>
          <tr>
            <td><strong>Right to rectification</strong></td>
            <td>Ask us to correct inaccurate or incomplete personal data.</td>
          </tr>
          <tr>
            <td><strong>Right to erasure</strong></td>
            <td>Ask us to delete your personal data in certain circumstances. Note: we may be required to retain some data for legal reasons (KYC records, financial records).</td>
          </tr>
          <tr>
            <td><strong>Right to restrict processing</strong></td>
            <td>Ask us to pause processing while you contest data accuracy.</td>
          </tr>
          <tr>
            <td><strong>Right to data portability</strong></td>
            <td>Receive a copy of your data in a structured, machine-readable format (where processing is based on consent or contract).</td>
          </tr>
          <tr>
            <td><strong>Right to object</strong></td>
            <td>Object to processing based on legitimate interests, including direct marketing (which we must always honour).</td>
          </tr>
          <tr>
            <td><strong>Right to withdraw consent</strong></td>
            <td>Withdraw consent at any time for consent-based processing (e.g. marketing emails). Withdrawal does not affect prior lawful processing.</td>
          </tr>
          <tr>
            <td><strong>Rights re: automated decisions</strong></td>
            <td>Our matching and moderation systems involve human oversight for significant decisions.</td>
          </tr>
        </tbody>
      </table>
      <p>
        If you are unhappy with how we handle your data, you have the right to lodge a complaint
        with the <strong>Information Commissioner's Office (ICO)</strong>:
      </p>
      <ul>
        <li>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
        <li>Telephone: 0303 123 1113</li>
        <li>Address: Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</li>
      </ul>
      <p>
        We would appreciate the opportunity to resolve any complaint directly before you contact
        the ICO.
      </p>

      {/* 11 */}
      <h2>11. Cookies</h2>
      <p>
        We use cookies and similar tracking technologies on our Platform.
      </p>
      <table>
        <thead>
          <tr><th>Cookie Type</th><th>Purpose</th><th>Can You Opt Out?</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Strictly necessary</strong></td>
            <td>Required for the Platform to function — session management, authentication, security tokens.</td>
            <td>No — essential to the service.</td>
          </tr>
          <tr>
            <td><strong>Performance / analytics</strong></td>
            <td>Help us understand how users interact with our Platform (e.g. Google Analytics). Data is anonymised.</td>
            <td>Yes — via our cookie consent banner.</td>
          </tr>
          <tr>
            <td><strong>Functional</strong></td>
            <td>Remember your preferences (e.g. saved searches).</td>
            <td>Yes — via our cookie consent banner.</td>
          </tr>
          <tr>
            <td><strong>Marketing</strong></td>
            <td>We do not currently use marketing/advertising cookies. If this changes, we will update this policy.</td>
            <td>N/A</td>
          </tr>
        </tbody>
      </table>
      <p>
        Manage your cookie preferences at any time via the cookie settings link in the footer.
        For full details, see our <Link to="/cookies">Cookie Policy</Link>.
      </p>

      {/* 12 */}
      <h2>12. How We Protect Your Data</h2>
      <ul>
        <li>Encryption of data in transit (TLS/HTTPS on all Platform communications)</li>
        <li>Encryption of data at rest (AWS S3 server-side encryption for KYC documents)</li>
        <li>Role-based access controls and multi-factor authentication for authorised personnel</li>
        <li>Row-level security on our database — users can only access their own data</li>
        <li>KYC documents accessible only via short-lived signed URLs (maximum 5 minutes)</li>
        <li>Regular security monitoring via Sentry and periodic penetration testing</li>
        <li>PII filtering in chat communications to prevent inadvertent sharing of contact details</li>
        <li>Immutable audit logging of all sensitive administrative actions</li>
      </ul>
      <p>
        In the event of a personal data breach likely to result in a risk to your rights and
        freedoms, we will notify the ICO within 72 hours and notify affected users without
        undue delay.
      </p>

      {/* 13 */}
      <h2>13. Children's Privacy</h2>
      <p>
        The PaintBookCo Platform is not directed at children under the age of 18. We do not
        knowingly collect personal data from anyone under 18. If you believe we may have
        collected data from a child, please contact us at{" "}
        <a href="mailto:privacy@paintbookco.co.uk">privacy@paintbookco.co.uk</a> and we will
        delete it promptly.
      </p>

      {/* 14 */}
      <h2>14. Third-Party Links and Services</h2>
      <p>
        Our Platform may contain links to third-party websites or resources (for example,
        Transpact's payment pages, or the Floori colour visualisation tool in the Paint
        Vestimator). PaintBookCo is not responsible for the privacy practices of third-party
        websites. We encourage you to read their privacy policies before providing personal data.
        Where we integrate third-party tools, we ensure appropriate data processing agreements
        are in place.
      </p>

      {/* 15 */}
      <h2>15. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we make material changes, we
        will update the version and effective date at the top of this page and post a notice on the
        Platform. Where required, we will notify you directly by email. Continued use of the
        Platform after a change constitutes acceptance of the updated policy.
      </p>
      <p>
        Previous versions are available on request at{" "}
        <a href="mailto:privacy@paintbookco.co.uk">privacy@paintbookco.co.uk</a>.
      </p>

      {/* 16 */}
      <h2>16. How to Contact Us</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:privacy@paintbookco.co.uk">privacy@paintbookco.co.uk</a> — subject line: 'Data Rights Request' or 'Privacy Query'</li>
        <li><strong>Post:</strong> The PaintBook Company Ltd, 1, 1 Fenman Mews, Walkden, Manchester, M28 3YU</li>
        <li><strong>Website:</strong> <a href="https://paintbookco.co.uk">paintbookco.co.uk</a></li>
      </ul>
      <p>We aim to respond to all enquiries within 5 working days.</p>
    </LegalPageLayout>
  );
}
