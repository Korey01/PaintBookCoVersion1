import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalPageLayout from "@/components/site/LegalPageLayout";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | PaintBookco";
  }, []);

  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="10 April 2025">
      <div className="notice-box">
        <p>
          <strong>Summary:</strong> PaintBookco collects the personal data you provide when using
          our platform. We use it to connect customers with painters, process payments securely
          via Stripe, and improve our service. We do not sell your data. You have rights under
          UK GDPR to access, correct, and delete your information.
        </p>
      </div>

      {/* 1 */}
      <h2>1. Who We Are</h2>
      <p>
        PaintBookco Ltd ("<strong>PaintBookco</strong>", "<strong>we</strong>",
        "<strong>us</strong>", or "<strong>our</strong>") operates the PaintBookco online
        marketplace at paintbookco.com (the "<strong>Platform</strong>"). We are the data
        controller for personal information processed through the Platform.
      </p>
      <p>
        We are registered with the Information Commissioner's Office (ICO) under Registration
        No. [ICO Registration No.]. Our registered office is [Registered Address], England.
      </p>
      <p>
        For all data protection queries, contact us at:{" "}
        <a href="mailto:privacy@paintbookco.com">privacy@paintbookco.com</a>
      </p>

      {/* 2 */}
      <h2>2. Personal Data We Collect</h2>
      <p>We collect personal data in the following categories:</p>

      <h3>2.1 Account &amp; Identity Data</h3>
      <ul>
        <li>Full name, email address, and password (hashed)</li>
        <li>Profile photograph and biography (painter profiles)</li>
        <li>UK postcode (used to match painters with local jobs)</li>
        <li>Account role (customer or painter/decorator)</li>
      </ul>

      <h3>2.2 Verification Data (Painters)</h3>
      <ul>
        <li>Government-issued photo ID (passport, driving licence)</li>
        <li>Public liability insurance certificate</li>
        <li>Portfolio photographs of completed work</li>
        <li>Subscription tier and verification status</li>
      </ul>

      <h3>2.3 Job &amp; Transaction Data</h3>
      <ul>
        <li>Job posts: description, location, budget, and schedule</li>
        <li>Quotes, bids, and agreements between customers and painters</li>
        <li>Payment amounts, escrow status, and release confirmations</li>
        <li>Reviews and ratings submitted after job completion</li>
      </ul>

      <h3>2.4 Payment Data</h3>
      <p>
        Payment card details are processed exclusively by <strong>Stripe</strong> (FCA-regulated
        e-money institution). PaintBookco never stores full card numbers or CVV codes. We
        receive only a Stripe token, masked card details, and transaction status from Stripe.
        For details on how Stripe handles your data, see{" "}
        <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer">
          stripe.com/gb/privacy
        </a>
        .
      </p>

      <h3>2.5 Communications Data</h3>
      <ul>
        <li>In-platform messages between customers and painters</li>
        <li>Dispute submissions and supporting evidence</li>
        <li>Support ticket correspondence</li>
        <li>Email notifications and marketing emails (where consented)</li>
      </ul>

      <h3>2.6 Technical &amp; Usage Data</h3>
      <ul>
        <li>IP address, browser type, and operating system</li>
        <li>Pages visited, search queries, and feature usage on the Platform</li>
        <li>Device identifiers and session tokens</li>
        <li>Error logs and crash reports</li>
      </ul>

      {/* 3 */}
      <h2>3. How We Collect Personal Data</h2>
      <ul>
        <li>
          <strong>Directly from you</strong> — when you create an account, post a job, make a
          booking, submit a review, contact support, or complete KYC verification.
        </li>
        <li>
          <strong>Automatically</strong> — when you browse the Platform, via cookies and similar
          technologies (see our <Link to="/cookies">Cookie Policy</Link>).
        </li>
        <li>
          <strong>From third parties</strong> — Stripe (payment status), identity verification
          providers (KYC), and analytics providers (aggregated usage data).
        </li>
      </ul>

      {/* 4 */}
      <h2>4. How We Use Your Personal Data</h2>
      <p>
        We use your personal data only where we have a lawful basis to do so under UK GDPR.
        The table below explains our main processing activities:
      </p>

      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Data used</th>
            <th>Lawful basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Creating and managing your account</td>
            <td>Identity, contact</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Matching customers with painters by location</td>
            <td>Postcode, skills, availability</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Processing payments and managing escrow</td>
            <td>Transaction, payment token</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Verifying painter identity and insurance</td>
            <td>Verification documents</td>
            <td>Contract; Legal obligation</td>
          </tr>
          <tr>
            <td>Facilitating messages between users</td>
            <td>Communications</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Resolving disputes</td>
            <td>Job data, communications, evidence</td>
            <td>Contract; Legitimate interests</td>
          </tr>
          <tr>
            <td>Sending transactional notifications</td>
            <td>Contact, account</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Sending marketing emails</td>
            <td>Contact, preferences</td>
            <td>Consent</td>
          </tr>
          <tr>
            <td>Improving platform performance and security</td>
            <td>Technical, usage</td>
            <td>Legitimate interests</td>
          </tr>
          <tr>
            <td>Complying with legal obligations (HMRC, FCA etc.)</td>
            <td>Identity, transaction</td>
            <td>Legal obligation</td>
          </tr>
          <tr>
            <td>Fraud prevention and platform safety</td>
            <td>All categories</td>
            <td>Legitimate interests; Legal obligation</td>
          </tr>
        </tbody>
      </table>

      {/* 5 */}
      <h2>5. Sharing Your Personal Data</h2>
      <p>We share your data only as described below. We do not sell personal data.</p>

      <h3>5.1 Other Platform Users</h3>
      <p>
        Painter profile information (name, photo, skills, location, ratings, and portfolio) is
        visible to customers on the Platform. Customer name and job details are visible to
        painters who submit quotes.
      </p>

      <h3>5.2 Service Providers (Processors)</h3>
      <p>
        We engage trusted third-party processors to help deliver our service, all bound by
        data processing agreements:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — payment processing and escrow management (FCA-authorised)
        </li>
        <li>
          <strong>Cloud hosting provider</strong> — platform infrastructure and data storage
        </li>
        <li>
          <strong>Email service provider</strong> — transactional and marketing emails
        </li>
        <li>
          <strong>Identity verification provider</strong> — KYC checks for painter onboarding
        </li>
        <li>
          <strong>Analytics provider</strong> — aggregated usage analytics (where consented)
        </li>
      </ul>

      <h3>5.3 Legal and Regulatory Disclosure</h3>
      <p>
        We may disclose your personal data to law enforcement, regulatory bodies (including the
        ICO and FCA), or courts where required by applicable law or to protect the rights,
        property, or safety of PaintBookco, our users, or the public.
      </p>

      <h3>5.4 Business Transfers</h3>
      <p>
        In the event of a merger, acquisition, or sale of all or part of PaintBookco, personal
        data may be transferred as part of that transaction. We will notify users if this occurs.
      </p>

      {/* 6 */}
      <h2>6. International Data Transfers</h2>
      <p>
        PaintBookco is based in the United Kingdom. Some of our service providers may process
        data outside the UK or EEA. Where this occurs, we ensure appropriate safeguards are in
        place — such as the UK International Data Transfer Agreement (IDTA), Standard Contractual
        Clauses (SCCs), or an adequacy decision — to protect your data to UK GDPR standards.
      </p>

      {/* 7 */}
      <h2>7. Data Retention</h2>
      <p>
        We keep your personal data for as long as necessary to fulfil the purposes for which it
        was collected and to comply with our legal obligations. Key retention periods are:
      </p>
      <ul>
        <li>
          <strong>Active account data</strong> — retained while your account is active and for
          6 years after closure (in line with statutory limitation periods).
        </li>
        <li>
          <strong>Transaction and payment records</strong> — 7 years (UK tax and accounting law).
        </li>
        <li>
          <strong>KYC / verification documents</strong> — 5 years after the end of the business
          relationship (Anti-Money Laundering Regulations 2017).
        </li>
        <li>
          <strong>In-platform messages</strong> — 2 years after the related job is closed.
        </li>
        <li>
          <strong>Technical logs</strong> — up to 90 days for security monitoring.
        </li>
        <li>
          <strong>Marketing consent records</strong> — retained until you withdraw consent, plus
          an additional 1 year.
        </li>
      </ul>

      {/* 8 */}
      <h2>8. Your Rights Under UK GDPR</h2>
      <p>
        You have the following rights regarding your personal data. To exercise any of these
        rights, contact us at{" "}
        <a href="mailto:privacy@paintbookco.com">privacy@paintbookco.com</a>. We will respond
        within <strong>one calendar month</strong>.
      </p>
      <ul>
        <li>
          <strong>Right of access</strong> — request a copy of the personal data we hold about
          you (Subject Access Request).
        </li>
        <li>
          <strong>Right to rectification</strong> — ask us to correct inaccurate or incomplete
          data.
        </li>
        <li>
          <strong>Right to erasure ("right to be forgotten")</strong> — request deletion of your
          data where we no longer have a lawful basis to process it.
        </li>
        <li>
          <strong>Right to restriction</strong> — ask us to limit how we use your data while a
          dispute is resolved.
        </li>
        <li>
          <strong>Right to data portability</strong> — receive your data in a structured,
          machine-readable format.
        </li>
        <li>
          <strong>Right to object</strong> — object to processing based on legitimate interests
          or for direct marketing (which we must always honour).
        </li>
        <li>
          <strong>Rights related to automated decision-making</strong> — we do not make solely
          automated decisions with significant legal effects. Painter tier badges and rankings
          are informational only.
        </li>
      </ul>
      <p>
        You also have the right to <strong>withdraw consent</strong> at any time where our
        processing is based on consent (e.g. marketing emails or analytics cookies). Withdrawal
        does not affect the lawfulness of prior processing.
      </p>
      <p>
        If you are unhappy with how we handle your data, you have the right to lodge a complaint
        with the{" "}
        <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">
          Information Commissioner's Office (ICO)
        </a>{" "}
        at ico.org.uk or by calling 0303 123 1113.
      </p>

      {/* 9 */}
      <h2>9. Cookies and Similar Technologies</h2>
      <p>
        We use cookies and similar tracking technologies on the Platform. Essential cookies are
        always active. Analytics and marketing cookies are placed only with your consent. You can
        manage your preferences at any time via the cookie settings link in the footer.
      </p>
      <p>
        For full details, see our <Link to="/cookies">Cookie Policy</Link>.
      </p>

      {/* 10 */}
      <h2>10. Security</h2>
      <p>
        We implement appropriate technical and organisational measures to protect your personal
        data against unauthorised access, alteration, disclosure, or destruction, including:
      </p>
      <ul>
        <li>HTTPS encryption for all data in transit</li>
        <li>Encrypted storage for sensitive data at rest</li>
        <li>Password hashing using industry-standard algorithms (bcrypt)</li>
        <li>Role-based access controls for staff</li>
        <li>Regular security reviews and penetration testing</li>
      </ul>
      <p>
        No method of transmission over the internet is 100% secure. In the event of a data
        breach that poses a risk to your rights and freedoms, we will notify the ICO within 72
        hours and affected users without undue delay.
      </p>

      {/* 11 */}
      <h2>11. Children's Privacy</h2>
      <p>
        The Platform is intended for users aged <strong>18 and over</strong>. We do not
        knowingly collect personal data from children under 18. If you believe a child has
        provided us with personal data, please contact us immediately at{" "}
        <a href="mailto:privacy@paintbookco.com">privacy@paintbookco.com</a> and we will delete
        it promptly.
      </p>

      {/* 12 */}
      <h2>12. Third-Party Links</h2>
      <p>
        The Platform may contain links to third-party websites (such as Stripe's payment pages).
        This Privacy Policy does not apply to those sites. We encourage you to read the privacy
        policies of any third-party sites you visit.
      </p>

      {/* 13 */}
      <h2>13. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes to our practices
        or applicable law. When we make material changes, we will notify you by email and/or by
        posting a prominent notice on the Platform at least <strong>14 days</strong> before the
        changes take effect. The "Last updated" date at the top of this page will always reflect
        the most recent version.
      </p>
      <p>
        Continued use of the Platform after changes take effect constitutes your acknowledgement
        of the updated policy.
      </p>

      {/* 14 */}
      <h2>14. Contact Us</h2>
      <p>If you have any questions or concerns about this Privacy Policy or how we handle your data:</p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:privacy@paintbookco.com">privacy@paintbookco.com</a>
        </li>
        <li>
          <strong>Post:</strong> Data Protection, PaintBookco Ltd, [Registered Address], England
        </li>
        <li>
          <strong>Help Centre:</strong> <Link to="/help">paintbookco.com/help</Link>
        </li>
      </ul>
    </LegalPageLayout>
  );
}
