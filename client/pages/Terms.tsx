import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalPageLayout from "@/components/site/LegalPageLayout";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | PaintBookco";
  }, []);

  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="10 April 2025">
      <div className="notice-box">
        <p>
          <strong>Please read these Terms carefully.</strong> By creating an account or using the
          PaintBookco Platform, you agree to be bound by these Terms. If you do not agree, do not
          use the Platform. For details on how we handle your data, see our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>

      {/* 1 */}
      <h2>1. Introduction</h2>
      <p>
        These Terms of Service ("<strong>Terms</strong>") govern your use of the PaintBookco
        online marketplace operated by PaintBookco Ltd ("<strong>PaintBookco</strong>",
        "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>"), a company
        registered in England and Wales (Company No. [Registration No.]), with its registered
        office at [Registered Address].
      </p>
      <p>
        The Platform connects customers seeking painting and decorating services
        ("<strong>Customers</strong>") with professional painters and decorators
        ("<strong>Painters</strong>") (together, "<strong>users</strong>" or
        "<strong>you</strong>").
      </p>
      <p>
        These Terms constitute a legally binding agreement between you and PaintBookco. They
        apply to all users of the Platform, including visitors who browse without an account.
      </p>

      {/* 2 */}
      <h2>2. Eligibility</h2>
      <p>To use the Platform you must:</p>
      <ul>
        <li>Be at least <strong>18 years of age</strong>.</li>
        <li>Be legally capable of entering into binding contracts under English law.</li>
        <li>
          If registering as a Painter, be legally authorised to work in the United Kingdom and
          hold valid public liability insurance of at least £1,000,000.
        </li>
        <li>
          If registering on behalf of a business, have authority to bind that business to these
          Terms.
        </li>
      </ul>
      <p>
        By using the Platform you represent and warrant that you meet all eligibility requirements.
      </p>

      {/* 3 */}
      <h2>3. Account Registration</h2>
      <h3>3.1 Creating an Account</h3>
      <p>
        To access most features of the Platform, you must register for an account. You agree to
        provide accurate, current, and complete information during registration and to keep your
        account details up to date.
      </p>

      <h3>3.2 Account Security</h3>
      <p>
        You are responsible for maintaining the confidentiality of your password and for all
        activity that occurs under your account. You must notify us immediately at{" "}
        <a href="mailto:hello@paintbookco.com">hello@paintbookco.com</a> if you suspect any
        unauthorised access to your account.
      </p>

      <h3>3.3 One Account Per Person</h3>
      <p>
        Each individual or business entity may maintain only one active account of each type
        (customer or painter) unless expressly agreed in writing with PaintBookco.
      </p>

      <h3>3.4 Account Suspension and Termination</h3>
      <p>
        We reserve the right to suspend or terminate your account at any time, with or without
        notice, if we reasonably believe you have breached these Terms, engaged in fraudulent
        activity, or posed a risk to other users or the Platform.
      </p>

      {/* 4 */}
      <h2>4. Platform Roles</h2>
      <h3>4.1 Customers</h3>
      <p>
        Customers create accounts automatically upon completing a job posting or contacting a
        Painter. Customers can post jobs, receive quotes, communicate with Painters, make
        payments via the Platform, and leave reviews after job completion.
      </p>

      <h3>4.2 Painters / Decorators</h3>
      <p>
        Painters must register through the dedicated join workflow, complete identity and
        insurance verification (KYC), and be approved by PaintBookco before accessing job
        listings. Approved Painters receive a tiered badge reflecting their subscription level
        and verified status.
      </p>

      <h3>4.3 PaintBookco's Role</h3>
      <p>
        PaintBookco acts solely as an <strong>intermediary marketplace</strong>. We are not a
        party to the contract for painting services formed between a Customer and a Painter.
        We do not employ Painters, and Painters are independent contractors. PaintBookco is not
        responsible for the quality, safety, or legality of the services provided.
      </p>

      {/* 5 */}
      <h2>5. Painter Onboarding and Verification</h2>
      <p>
        Painters must complete our Know Your Customer (KYC) process, which includes:
      </p>
      <ul>
        <li>Uploading valid government-issued photo ID.</li>
        <li>Providing a current public liability insurance certificate.</li>
        <li>Submitting original portfolio photographs of completed work.</li>
        <li>Providing a UK business postcode for job matching.</li>
      </ul>
      <p>
        Painters must not submit fraudulent documents, stock images, or misrepresent their
        qualifications. PaintBookco uses automated and manual checks to detect such submissions.
        Verified Painters receive a <strong>Verified Painter badge</strong>. PaintBookco reserves
        the right to revoke verification status at any time if documents expire or are found to
        be invalid.
      </p>

      {/* 6 */}
      <h2>6. Posting Jobs</h2>
      <h3>6.1 Job Listings</h3>
      <p>
        Customers may post painting and decorating jobs on the Platform. Job posts must:
      </p>
      <ul>
        <li>Accurately describe the work required.</li>
        <li>Provide a genuine location (UK only unless otherwise agreed).</li>
        <li>Not request services that are illegal, dangerous, or outside the scope of
          painting and decorating work.</li>
      </ul>

      <h3>6.2 Quotes and Acceptance</h3>
      <p>
        Painters may submit quotes in response to job posts. A binding agreement is formed
        between Customer and Painter when a Customer formally accepts a quote and initiates
        payment through the Platform. PaintBookco is not a party to that agreement.
      </p>

      {/* 7 */}
      <h2>7. Payments</h2>
      <h3>7.1 Payment Processing</h3>
      <p>
        All payments on the Platform are processed by <strong>Stripe</strong> (an FCA-regulated
        e-money institution). By making a payment, you agree to Stripe's Terms of Service and
        Privacy Policy. PaintBookco does not store full payment card details.
      </p>

      <h3>7.2 Platform Fees</h3>
      <p>
        PaintBookco charges service fees for use of the Platform. Current fee schedules are
        available on the Platform and may be updated from time to time. Fees are displayed
        clearly before any payment is confirmed.
      </p>

      <h3>7.3 Taxes</h3>
      <p>
        Painters are responsible for declaring and paying all applicable taxes on income earned
        through the Platform, including VAT where applicable. PaintBookco does not withhold
        taxes on behalf of Painters.
      </p>

      {/* 8 */}
      <h2>8. Escrow Service</h2>
      <h3>8.1 How Escrow Works</h3>
      <p>
        PaintBookco offers an optional escrow service for Customer payments. When escrow is
        enabled for a job:
      </p>
      <ol>
        <li>The Customer pays the agreed amount to the Platform at booking.</li>
        <li>Funds are held securely in escrow via Stripe pending job completion.</li>
        <li>
          Funds are released to the Painter only after the Customer confirms the job has been
          completed to their satisfaction.
        </li>
      </ol>

      <h3>8.2 Escrow Fees</h3>
      <p>
        Escrow is <strong>optional</strong>. Where selected, the Customer is responsible for any
        applicable escrow service fees, which will be displayed before payment is confirmed.
      </p>

      <h3>8.3 Release of Funds</h3>
      <p>
        If a Customer fails to confirm or dispute a job within <strong>7 days</strong> of the
        agreed completion date, funds will be automatically released to the Painter unless a
        dispute has been raised. Customers should not delay confirmation unreasonably.
      </p>

      <h3>8.4 Escrow Disputes</h3>
      <p>
        If a Customer is dissatisfied with the completed work, they must raise a dispute through
        the Platform within the 7-day window. Escrow funds will be frozen pending resolution.
        See Section 11 (Disputes) for the full process.
      </p>

      {/* 9 */}
      <h2>9. Subscription Tiers (Painters)</h2>
      <p>
        PaintBookco offers tiered subscription plans for Painters:
      </p>
      <ul>
        <li>
          <strong>Starter</strong> — free tier with basic platform access and limited job bids
          per month.
        </li>
        <li>
          <strong>Professional</strong> — paid monthly subscription with expanded bid allowances,
          enhanced profile visibility, and access to premium features.
        </li>
        <li>
          <strong>Elite</strong> — highest tier with unlimited bids, priority placement, featured
          listings, and dedicated account support.
        </li>
      </ul>
      <p>
        Current subscription pricing and benefits are displayed on the Platform. Subscriptions
        renew automatically unless cancelled before the renewal date. Cancellation takes effect
        at the end of the current billing period.
      </p>

      {/* 10 */}
      <h2>10. Cancellations and Refunds</h2>
      <h3>10.1 Job Cancellation by Customer</h3>
      <p>
        Customers may cancel a booked job before work commences. Cancellation fees may apply
        depending on notice given:
      </p>
      <ul>
        <li>
          <strong>More than 48 hours before start:</strong> Full refund minus any escrow service
          fees already incurred.
        </li>
        <li>
          <strong>Less than 48 hours before start:</strong> A cancellation fee of up to 20% of
          the job value may apply to compensate the Painter for lost time.
        </li>
        <li>
          <strong>After work has commenced:</strong> Payment is due for any work already completed.
          Disputes regarding scope should be raised through the Platform.
        </li>
      </ul>

      <h3>10.2 Job Cancellation by Painter</h3>
      <p>
        Painters must give Customers at least <strong>24 hours' notice</strong> if they need to
        cancel a confirmed job. Repeated cancellations may result in account suspension and
        reduced Platform visibility.
      </p>

      <h3>10.3 Subscription Refunds</h3>
      <p>
        Subscription fees are non-refundable once a billing period has commenced, except where
        required by applicable consumer law.
      </p>

      <h3>10.4 Consumer Rights</h3>
      <p>
        Nothing in these Terms limits your statutory rights as a consumer under UK consumer law,
        including the Consumer Rights Act 2015 and Consumer Contracts Regulations 2013.
      </p>

      {/* 11 */}
      <h2>11. Dispute Resolution</h2>
      <h3>11.1 Platform Disputes</h3>
      <p>
        If a dispute arises between a Customer and a Painter regarding a job, either party may
        raise a formal dispute via their Platform dashboard within <strong>7 days</strong> of the
        job completion date (or the agreed completion date if the job was not completed).
      </p>

      <h3>11.2 PaintBookco Mediation</h3>
      <p>
        PaintBookco's Dispute Resolution team will review submitted evidence from both parties
        and aim to reach a fair determination within <strong>5 business days</strong>. Both
        parties agree to cooperate with the process and provide requested documentation promptly.
      </p>
      <p>
        PaintBookco's determination is final and binding on how escrow funds (if applicable)
        are disbursed. PaintBookco is not a court and does not provide legal advice. Either
        party remains free to pursue legal remedies through the courts independently.
      </p>

      <h3>11.3 Limitation of PaintBookco's Liability in Disputes</h3>
      <p>
        PaintBookco acts as a facilitator only. Our maximum liability arising from any dispute
        mediation is limited to the value of funds held in escrow for the relevant job.
      </p>

      {/* 12 */}
      <h2>12. Reviews and Ratings</h2>
      <ul>
        <li>
          Reviews may only be submitted by Customers who have completed a verified job through
          the Platform with the reviewed Painter.
        </li>
        <li>Reviews must be truthful, fair, and based on actual experience.</li>
        <li>Reviews must not be defamatory, contain personal attacks, or include false information.</li>
        <li>
          Painters may not offer incentives to Customers in exchange for positive reviews, and
          Customers must not threaten negative reviews to extract discounts or refunds.
        </li>
        <li>
          PaintBookco reserves the right to remove reviews that violate these standards, following
          investigation.
        </li>
      </ul>

      {/* 13 */}
      <h2>13. Prohibited Conduct</h2>
      <p>You must not use the Platform to:</p>
      <ul>
        <li>
          Misrepresent your identity, qualifications, insurance status, or experience.
        </li>
        <li>
          Upload fraudulent, stock, or AI-generated images as portfolio photographs.
        </li>
        <li>
          Circumvent the Platform by arranging payment or contact directly to avoid Platform fees
          after an initial introduction through PaintBookco.
        </li>
        <li>
          Harass, threaten, or abuse other users.
        </li>
        <li>
          Transmit spam, malware, or any harmful code.
        </li>
        <li>
          Scrape, crawl, or use automated tools to extract Platform data without our express
          written consent.
        </li>
        <li>
          Attempt to reverse-engineer, copy, or create derivative works of the Platform.
        </li>
        <li>
          Post content that is illegal, discriminatory, obscene, or infringes third-party
          intellectual property rights.
        </li>
      </ul>
      <p>
        Breach of this section may result in immediate account suspension and, where applicable,
        legal action.
      </p>

      {/* 14 */}
      <h2>14. Intellectual Property</h2>
      <p>
        All content on the Platform — including the PaintBookco name and logo, design, software,
        text, and graphics — is owned by or licensed to PaintBookco and protected by UK and
        international intellectual property law.
      </p>
      <p>
        By uploading content to the Platform (such as portfolio photos or job descriptions), you
        grant PaintBookco a non-exclusive, royalty-free, worldwide licence to use, display, and
        reproduce that content for the purpose of operating and promoting the Platform. You
        retain ownership of your content and may request its deletion by closing your account.
      </p>

      {/* 15 */}
      <h2>15. Disclaimer of Warranties</h2>
      <p>
        The Platform is provided "<strong>as is</strong>" and "<strong>as available</strong>"
        without warranties of any kind, express or implied, including but not limited to
        warranties of merchantability, fitness for a particular purpose, or non-infringement.
      </p>
      <p>
        PaintBookco does not warrant that: (a) the Platform will be uninterrupted or error-free;
        (b) any particular Painter or job will meet your requirements; or (c) any results
        obtained from use of the Platform will be accurate or reliable.
      </p>

      {/* 16 */}
      <h2>16. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, PaintBookco's total aggregate
        liability to you arising out of or in connection with these Terms or the Platform
        (whether in contract, tort, statute, or otherwise) shall not exceed the greater of:
      </p>
      <ul>
        <li>
          The total fees paid by you to PaintBookco in the <strong>12 months</strong> preceding
          the claim; or
        </li>
        <li><strong>£500</strong>.</li>
      </ul>
      <p>
        PaintBookco shall not be liable for any indirect, incidental, special, consequential, or
        punitive damages, including loss of profits, data, goodwill, or business opportunity,
        even if advised of the possibility of such damages.
      </p>
      <p>
        Nothing in these Terms excludes or limits liability for death or personal injury caused
        by our negligence, fraud or fraudulent misrepresentation, or any other liability that
        cannot be excluded by law.
      </p>

      {/* 17 */}
      <h2>17. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless PaintBookco and its officers,
        directors, employees, and agents from and against any claims, liabilities, damages,
        losses, and expenses (including reasonable legal fees) arising out of or in any way
        connected with: (a) your use of the Platform; (b) your breach of these Terms; (c) your
        violation of any applicable law or regulation; or (d) any dispute between you and
        another user.
      </p>

      {/* 18 */}
      <h2>18. Privacy</h2>
      <p>
        Your use of the Platform is also governed by our{" "}
        <Link to="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by
        reference. By using the Platform, you consent to the collection and use of your personal
        data as described in the Privacy Policy.
      </p>
      <p>
        Our <Link to="/cookies">Cookie Policy</Link> explains how we use cookies and similar
        technologies on the Platform.
      </p>

      {/* 19 */}
      <h2>19. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. When we make material changes, we will
        notify you by email and/or by posting a notice on the Platform at least{" "}
        <strong>14 days</strong> before the changes take effect (or 30 days for changes that
        materially affect Painter earnings or subscription fees).
      </p>
      <p>
        Your continued use of the Platform after the effective date of updated Terms constitutes
        your acceptance of those changes. If you do not accept the changes, you must stop using
        the Platform.
      </p>

      {/* 20 */}
      <h2>20. Termination</h2>
      <p>
        You may close your account at any time through the Account settings page. Upon closure:
      </p>
      <ul>
        <li>Active job bookings and pending escrow funds will be resolved before closure.</li>
        <li>Your public profile and reviews will be removed within 30 days.</li>
        <li>We will retain certain data as required by law (see our Privacy Policy).</li>
      </ul>
      <p>
        PaintBookco may terminate or suspend your account in accordance with Section 3.4. Upon
        termination by either party, these Terms (including all limitations and disclaimers) will
        survive to the extent necessary to give effect to those provisions.
      </p>

      {/* 21 */}
      <h2>21. Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by the laws of <strong>England and Wales</strong>. Any disputes
        arising from or in connection with these Terms shall be subject to the exclusive
        jurisdiction of the courts of England and Wales, except where mandatory consumer
        protection laws in your jurisdiction provide otherwise.
      </p>

      {/* 22 */}
      <h2>22. General</h2>
      <ul>
        <li>
          <strong>Entire agreement:</strong> These Terms, together with our Privacy Policy and
          Cookie Policy, constitute the entire agreement between you and PaintBookco in relation
          to the Platform.
        </li>
        <li>
          <strong>Severability:</strong> If any provision of these Terms is found to be invalid
          or unenforceable, the remaining provisions will continue in full force and effect.
        </li>
        <li>
          <strong>Waiver:</strong> Failure by PaintBookco to enforce any provision of these Terms
          does not constitute a waiver of our right to do so in the future.
        </li>
        <li>
          <strong>Assignment:</strong> You may not assign your rights or obligations under these
          Terms without our prior written consent. We may assign our rights and obligations at
          any time.
        </li>
        <li>
          <strong>Force majeure:</strong> PaintBookco is not liable for any failure or delay
          caused by circumstances beyond our reasonable control.
        </li>
      </ul>

      {/* 23 */}
      <h2>23. Contact Us</h2>
      <p>If you have any questions about these Terms of Service, please contact us:</p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:hello@paintbookco.com">hello@paintbookco.com</a>
        </li>
        <li>
          <strong>Post:</strong> Legal, PaintBookco Ltd, [Registered Address], England
        </li>
        <li>
          <strong>Help Centre:</strong> <Link to="/help">paintbookco.com/help</Link>
        </li>
      </ul>
      <p>
        For privacy-specific queries, please refer to our{" "}
        <Link to="/privacy">Privacy Policy</Link> or email{" "}
        <a href="mailto:privacy@paintbookco.com">privacy@paintbookco.com</a>.
      </p>
    </LegalPageLayout>
  );
}
