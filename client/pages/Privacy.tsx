export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-container section-gap">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <p className="editorial-label mb-4">Legal Document</p>
          <h1 className="mb-4">Privacy Policy</h1>
          <div className="space-y-2 text-muted-foreground">
            <p className="text-sm">
              <strong>Version 1.0</strong> | April 2026
            </p>
            <p className="text-sm">
              <strong>Effective Date:</strong> 10th April 2026
            </p>
            <p className="text-sm">
              <strong>Company Number:</strong> 16690724
            </p>
          </div>
        </div>

        {/* Company Info Box */}
        <div className="surface-card p-6 mb-12">
          <h2 className="text-2xl mb-4">Who We Are</h2>
          <div className="space-y-3 text-sm">
            <p><strong>Legal name:</strong> The PaintBook Company Ltd</p>
            <p><strong>Trading name:</strong> PaintBookCo</p>
            <p><strong>Company number:</strong> 16690724</p>
            <p><strong>Registered address:</strong> 1, 1 Fenman Mews, Walkden, Manchester, UK. M28 3YU</p>
            <p><strong>Website:</strong> paintbookco.co.uk</p>
            <p><strong>Contact email:</strong> privacy@paintbookco.co.uk</p>
            <p><strong>ICO Registration number:</strong> ZC118117</p>
          </div>
        </div>

        {/* Main Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          
          {/* Section 1 */}
          <section>
            <h2>What This Policy Covers</h2>
            <p>
              This Privacy Policy explains:
            </p>
            <ul className="space-y-2">
              <li>What personal data we collect about you and why we collect it</li>
              <li>The legal basis we rely on for processing your personal data</li>
              <li>How we use your personal data</li>
              <li>Who we share your personal data with</li>
              <li>How long we keep your personal data</li>
              <li>Your rights under UK GDPR and how to exercise them</li>
              <li>How to contact us with questions or complaints</li>
            </ul>
            <p>
              This policy applies to all personal data we process in connection with the PaintBookCo platform, including data collected when you register an account, post or accept a job, make or receive a payment through our escrow system, use the Paint Vestimator tool, or communicate with us or other users through the platform.
            </p>
            <p>
              This policy does not cover third-party websites, services, or platforms that you may access via links on our Platform. Those third parties have their own privacy policies which we encourage you to read.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2>Data Controller</h2>
            <p>
              The PaintBook Company Ltd is the data controller for all personal data processed through the PaintBookCo platform. This means we determine the purposes and means of processing your personal data.
            </p>
            <p>
              We are registered with the Information Commissioner's Office (ICO) as a data controller. Our ICO registration number is <strong>ZC118117</strong>.
            </p>
            <p>
              If you have any questions about this Privacy Policy or how we handle your personal data, please contact us at <strong>privacy@paintbookco.co.uk</strong>
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2>Personal Data We Collect</h2>
            <p>We collect and process the following categories of personal data, depending on how you use our Platform:</p>
            
            <h3 className="text-xl mt-6 mb-4">Data You Provide Directly</h3>
            
            <h4 className="text-lg font-semibold mt-4 mb-2">Account Registration Data (All Users)</h4>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (stored in encrypted form — we never see your plain-text password)</li>
              <li>User type (customer or painter/decorator)</li>
              <li>Profile photo (optional)</li>
            </ul>

            <h4 className="text-lg font-semibold mt-4 mb-2">Painter/Decorator-Specific Data</h4>
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

            <h4 className="text-lg font-semibold mt-4 mb-2">Customer-Specific Data</h4>
            <ul>
              <li>Property details for job postings (address, type of work required, room dimensions)</li>
              <li>Photographs of spaces to be painted (uploaded via Paint Vestimator or job posting)</li>
              <li>Paint preferences and colour choices</li>
              <li>Budget and timeline requirements</li>
              <li>Payment details (processed securely by Transpact — PaintBookCo does not store card or bank details)</li>
            </ul>

            <h4 className="text-lg font-semibold mt-4 mb-2">Communications Data</h4>
            <ul>
              <li>Messages sent through the PaintBookCo in-platform chat system (job-scoped, monitored for prohibited content)</li>
              <li>Support queries and correspondence with PaintBookCo</li>
              <li>Reviews and ratings submitted after job completion</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Data We Collect Automatically</h3>
            <p>When you use our Platform, we automatically collect certain technical data:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on the Platform</li>
              <li>Referring website or search terms used to find us</li>
              <li>Session duration and activity logs</li>
              <li>Approximate geographic location (derived from IP address, not GPS)</li>
            </ul>
            <p>This data is collected using cookies and similar tracking technologies. For more information, please see our Cookie Policy.</p>

            <h3 className="text-xl mt-6 mb-4">Data from Third Parties</h3>
            <ul>
              <li><strong>Transpact (our escrow provider):</strong> Transaction reference numbers and payment status information to enable us to manage job payments and releases.</li>
              <li><strong>Identity verification providers:</strong> Confirmation of KYC verification outcomes (we receive the result, not the underlying verification process data).</li>
              <li><strong>Google Analytics and similar analytics tools:</strong> Aggregated, anonymised data about how users interact with our Platform.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2>Why We Process Your Data and Our Lawful Basis</h2>
            <p>
              Under UK GDPR, we must have a lawful basis for every purpose for which we process your personal data. Below are the main purposes:
            </p>
            
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                    <th className="border border-border p-3 text-left font-semibold">Lawful Basis</th>
                    <th className="border border-border p-3 text-left font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Creating and managing your account</td>
                    <td className="border border-border p-3">Contract</td>
                    <td className="border border-border p-3">Processing is necessary to perform the contract between you and PaintBookCo (our Terms of Service).</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">KYC identity verification for painters</td>
                    <td className="border border-border p-3">Contract + Legal obligation</td>
                    <td className="border border-border p-3">We must verify painter identities to perform our service safely and to meet our obligations under UK Anti-Money Laundering Regulations.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Matching customers with painters</td>
                    <td className="border border-border p-3">Contract</td>
                    <td className="border border-border p-3">Core to the service we provide — necessary to fulfil your use of the Platform.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Processing payments via Transpact escrow</td>
                    <td className="border border-border p-3">Contract</td>
                    <td className="border border-border p-3">Escrow payment processing is integral to every transaction on the Platform and necessary to perform the service.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Deducting and processing PaintBookCo commission</td>
                    <td className="border border-border p-3">Contract</td>
                    <td className="border border-border p-3">Commission is agreed in our Terms of Service and forms the commercial basis of the Platform.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Sending transactional emails</td>
                    <td className="border border-border p-3">Contract</td>
                    <td className="border border-border p-3">Necessary to provide the service you have signed up for.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">In-platform messaging (moderated chat)</td>
                    <td className="border border-border p-3">Contract + Legitimate interests</td>
                    <td className="border border-border p-3">Necessary to facilitate job communication; monitored to enforce Platform rules and protect commercial interests.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Fraud detection and security monitoring</td>
                    <td className="border border-border p-3">Legitimate interests</td>
                    <td className="border border-border p-3">We have a legitimate interest in protecting our Platform, users, and commercial model from fraud and abuse.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Paint Vestimator usage</td>
                    <td className="border border-border p-3">Contract + Consent</td>
                    <td className="border border-border p-3">Necessary to provide the estimation tool; images processed only for the purpose for which they are uploaded.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Platform analytics and performance monitoring</td>
                    <td className="border border-border p-3">Legitimate interests</td>
                    <td className="border border-border p-3">We have a legitimate interest in understanding how our Platform is used to improve it.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Marketing communications (with your consent)</td>
                    <td className="border border-border p-3">Consent</td>
                    <td className="border border-border p-3">We will only send marketing emails where you have explicitly opted in. You can withdraw consent at any time.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Legal compliance</td>
                    <td className="border border-border p-3">Legal obligation</td>
                    <td className="border border-border p-3">We are required by law to maintain certain records and respond to regulatory requests.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Dispute resolution</td>
                    <td className="border border-border p-3">Legitimate interests + Contract</td>
                    <td className="border border-border p-3">We have a legitimate interest in resolving disputes fairly and maintaining accurate records of transactions.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2>How We Use Your Personal Data</h2>

            <h3 className="text-xl mt-6 mb-4">Providing the Platform Service</h3>
            <ul>
              <li>Creating and maintaining your account</li>
              <li>Verifying painter and decorator identities and credentials (KYC)</li>
              <li>Matching customers with eligible, verified painters based on location, specialism, and availability</li>
              <li>Facilitating job postings, quotes, and bookings</li>
              <li>Processing payments and commission through our FCA-regulated escrow partner Transpact</li>
              <li>Releasing funds to painters upon confirmed job completion</li>
              <li>Sending you notifications about your jobs, payments, and account status</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Safety, Security, and Fraud Prevention</h3>
            <ul>
              <li>Monitoring in-platform communications to detect and prevent sharing of personal contact information (which is prohibited under our Terms of Service to protect the commercial integrity of the Platform)</li>
              <li>Detecting and preventing fraudulent accounts, fake portfolios, and identity misrepresentation</li>
              <li>Maintaining security logs and audit trails of sensitive actions (KYC decisions, payment operations, dispute resolutions)</li>
              <li>Conducting security monitoring via Sentry error tracking and related tools</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Communications</h3>
            <ul>
              <li>Sending transactional emails related to your account activity (job alerts, payment confirmations, KYC outcomes, review requests)</li>
              <li>Responding to support queries and complaints</li>
              <li>Sending marketing communications only where you have explicitly opted in. You can unsubscribe at any time by clicking the unsubscribe link in any marketing email or by contacting us at m&c@paintbookco.co.uk.</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Platform Improvement</h3>
            <ul>
              <li>Analysing platform usage patterns (using anonymised or aggregated data) to improve our features and user experience</li>
              <li>Building and improving the Paint Vestimator — we may use anonymised and aggregated data from completed jobs (dimensions, paint quantities, pricing) to improve estimation accuracy. We will never share identifiable personal data for this purpose.</li>
              <li>Conducting A/B testing of platform features</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Legal and Regulatory Compliance</h3>
            <ul>
              <li>Maintaining records required by HMRC (7-year retention for financial records)</li>
              <li>Maintaining KYC records as required by UK Money Laundering Regulations (5-year retention post-transaction)</li>
              <li>Responding to lawful requests from regulatory authorities (including the ICO, HMRC, or law enforcement)</li>
              <li>Defending legal claims or enforcing our Terms of Service</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2>Who We Share Your Personal Data With</h2>
            <p>
              We do not sell your personal data. We do not share your personal data with third parties for their own marketing purposes. We share your data only in the circumstances described below.
            </p>
            
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Recipient</th>
                    <th className="border border-border p-3 text-left font-semibold">Why We Share Data</th>
                    <th className="border border-border p-3 text-left font-semibold">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Transpact (escrow provider)</td>
                    <td className="border border-border p-3">To process payments, hold funds in escrow, release payments to painters, and handle any reversals or cancellations. Transpact is FCA-authorised (Ref: 546279).</td>
                    <td className="border border-border p-3">Transaction amounts, party email addresses, transaction reference numbers, payment status.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Supabase (database infrastructure)</td>
                    <td className="border border-border p-3">Hosting and managing our platform database, which stores all account, job, and transaction records. Supabase operates on AWS infrastructure with data stored in the EU (Ireland region).</td>
                    <td className="border border-border p-3">All personal data held on the platform: name, email, account details, job records, KYC status, payment references, and activity logs.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Didit (KYC/AML verification)</td>
                    <td className="border border-border p-3">Verifying the identity of painters during onboarding in accordance with our AML obligations. Didit processes identity documents and performs automated checks on our behalf.</td>
                    <td className="border border-border p-3">Full name, date of birth, government-issued identity documents, selfie/liveness data, and verification outcome.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">AWS S3 (Amazon Web Services)</td>
                    <td className="border border-border p-3">Secure storage of KYC documents and platform assets uploaded by painters. Documents are stored in the UK (London region) with encryption at rest.</td>
                    <td className="border border-border p-3">KYC identity documents, proof of address, insurance certificates.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">SendGrid (email delivery)</td>
                    <td className="border border-border p-3">Sending transactional and notification emails on our behalf.</td>
                    <td className="border border-border p-3">Email address, name, and relevant job or account information needed to personalise emails.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Stream Chat (in-platform messaging)</td>
                    <td className="border border-border p-3">Providing the in-platform messaging system between matched painters and customers. EU data region selected.</td>
                    <td className="border border-border p-3">User IDs, display names, and message content within job-specific channels.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Make.com (workflow automation)</td>
                    <td className="border border-border p-3">Automating platform workflows including KYC approvals, job notifications, payment triggers, and CRM updates. Personal data passes through Make.com in transit as part of these automated processes.</td>
                    <td className="border border-border p-3">Name, email, job status, KYC outcome, and transaction references, depending on the workflow triggered.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Stacksync (data synchronisation)</td>
                    <td className="border border-border p-3">Synchronising platform data between our database (Supabase) and our CRM (HubSpot) in real time.</td>
                    <td className="border border-border p-3">Name, email, job status, and account activity data.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">HubSpot (CRM)</td>
                    <td className="border border-border p-3">Managing our business operations, pipeline tracking, and customer support. Data is synced from Supabase via Stacksync.</td>
                    <td className="border border-border p-3">Name, email, job status, account activity. Used for operational management only, not marketing without consent.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Sentry (error monitoring)</td>
                    <td className="border border-border p-3">Monitoring our platform for technical errors to maintain uptime and performance.</td>
                    <td className="border border-border p-3">Error logs, which may include anonymised technical data. No personal content is intentionally captured.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">SightEngine (content moderation)</td>
                    <td className="border border-border p-3">AI-powered detection of personal contact information in chat messages to enforce our prohibited content policy.</td>
                    <td className="border border-border p-3">Message text submitted for moderation. SightEngine does not retain message content after analysis.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Analytics providers (Google Analytics)</td>
                    <td className="border border-border p-3">Understanding how users interact with our Platform to improve it.</td>
                    <td className="border border-border p-3">Anonymised usage data, page views, session data, and device/browser information. No directly identifying personal data is intentionally collected.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Legal and regulatory authorities</td>
                    <td className="border border-border p-3">Where required by law, court order, or regulatory request (e.g. ICO, HMRC, law enforcement).</td>
                    <td className="border border-border p-3">Relevant data as required by the applicable legal obligation.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Professional advisors (solicitors, accountants)</td>
                    <td className="border border-border p-3">To receive professional advice in relation to our business operations.</td>
                    <td className="border border-border p-3">Relevant data as required, shared on a strictly confidential basis.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl mt-6 mb-4">Sharing Between Painters and Customers</h3>
            <p>
              When a job is confirmed and escrow is funded, PaintBookCo will share necessary contact information between the matched painter and customer via a system-generated email. This is the only mechanism by which contact details are exchanged. Contact details are never shared directly in the in-platform chat system.
            </p>
            <p>
              Painter profiles (name, portfolio, ratings, service area, and specialism) are visible to customers searching for painters on the Platform.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2>International Data Transfers</h2>
            <p>
              PaintBookCo is a UK-based company and we store the majority of your personal data within the UK and the European Economic Area (EEA). Some of our third-party service providers may process data outside the UK/EEA. Where this occurs, we ensure appropriate safeguards are in place:
            </p>
            <ul>
              <li><strong>AWS (KYC document storage)</strong> — EU-West-2 (London) region. Data does not leave the UK.</li>
              <li><strong>SendGrid (email delivery)</strong> — US-based. We rely on Standard Contractual Clauses (SCCs) as the transfer mechanism. SendGrid maintains GDPR compliance documentation available at their Trust Portal.</li>
              <li><strong>Stream Chat</strong> — EU data region selected. Data processed within the EEA.</li>
              <li><strong>HubSpot</strong> — US-based. We rely on Standard Contractual Clauses (SCCs) and HubSpot's Data Processing Agreement.</li>
              <li><strong>Transpact</strong> — UK-based, FCA-authorised. All funds held under UK law.</li>
            </ul>
            <p>
              You have the right to request information about the specific safeguards we have in place for any international transfers. Please contact us at privacy@paintbookco.co.uk.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2>How Long We Keep Your Personal Data</h2>
            <p>We keep your personal data only for as long as is necessary for the purposes described in this policy or as required by law. Below are our standard retention periods:</p>
            
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Data Category</th>
                    <th className="border border-border p-3 text-left font-semibold">Retention Period</th>
                    <th className="border border-border p-3 text-left font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Account data (name, email, profile)</td>
                    <td className="border border-border p-3">Duration of account + 3 years after last activity</td>
                    <td className="border border-border p-3">To resolve any queries or disputes that may arise after account closure.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">KYC documents (identity, address, insurance)</td>
                    <td className="border border-border p-3">5 years from the date of the last transaction</td>
                    <td className="border border-border p-3">UK Money Laundering Regulations 2017 — legal obligation.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Payment and transaction records</td>
                    <td className="border border-border p-3">7 years from the date of transaction</td>
                    <td className="border border-border p-3">HMRC requirements for financial records.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">In-platform chat messages</td>
                    <td className="border border-border p-3">180 days (6 months) from the date of the message</td>
                    <td className="border border-border p-3">To support dispute resolution during and after a job. Extended retention available on request where a dispute is ongoing.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Job details (job postings, milestone records)</td>
                    <td className="border border-border p-3">Duration of job + 3 years</td>
                    <td className="border border-border p-3">To support disputes, reviews, and platform improvement.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Paint Vestimator data (room photos, dimensions)</td>
                    <td className="border border-border p-3">Duration of job + 12 months, then anonymised</td>
                    <td className="border border-border p-3">Photos used only for estimation purposes. Anonymised aggregate data retained for product improvement.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Message block log (PII filter incidents)</td>
                    <td className="border border-border p-3">2 years</td>
                    <td className="border border-border p-3">For security monitoring and enforcement of our prohibited content policy.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Marketing consent records</td>
                    <td className="border border-border p-3">Until consent is withdrawn + 3 years</td>
                    <td className="border border-border p-3">To demonstrate compliance with PECR.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Support correspondence</td>
                    <td className="border border-border p-3">3 years from resolution</td>
                    <td className="border border-border p-3">To handle any follow-up queries.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Audit logs (admin actions, KYC decisions, payment operations)</td>
                    <td className="border border-border p-3">7 years</td>
                    <td className="border border-border p-3">Legal compliance and ability to demonstrate accountability.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              When personal data is no longer required, we will securely delete or anonymise it. Where anonymisation is not possible (for example, data embedded in backup systems), we will isolate the data from further processing until deletion is possible.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2>Your Rights Under UK GDPR</h2>
            <p>
              You have the following rights in relation to your personal data. These rights apply to the extent permitted by applicable law and may be subject to certain limitations where we have overriding legal obligations to retain data.
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Right</th>
                    <th className="border border-border p-3 text-left font-semibold">What It Means</th>
                    <th className="border border-border p-3 text-left font-semibold">How to Exercise It</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right of access</td>
                    <td className="border border-border p-3">You can request a copy of the personal data we hold about you (a Subject Access Request or SAR).</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk. We will respond within 30 days. We do not charge a fee for standard requests.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right to rectification</td>
                    <td className="border border-border p-3">You can ask us to correct inaccurate or incomplete personal data we hold about you.</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk or update your details directly in your account settings.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right to erasure ('right to be forgotten')</td>
                    <td className="border border-border p-3">You can ask us to delete your personal data in certain circumstances.</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk. Note: we may be required to retain some data for legal reasons (e.g. KYC records, financial records). We will explain any limitations that apply.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right to restrict processing</td>
                    <td className="border border-border p-3">You can ask us to pause processing of your personal data in certain circumstances, such as while you contest the accuracy of data we hold.</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right to data portability</td>
                    <td className="border border-border p-3">You can request a copy of the personal data you have provided to us in a structured, machine-readable format.</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk. Available where processing is based on consent or contract.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right to object</td>
                    <td className="border border-border p-3">You can object to processing based on legitimate interests, including profiling. You can also object to direct marketing at any time.</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk, or use the unsubscribe link in any marketing email.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Right to withdraw consent</td>
                    <td className="border border-border p-3">Where processing is based on your consent, you can withdraw that consent at any time without affecting the lawfulness of processing before withdrawal.</td>
                    <td className="border border-border p-3">Contact us at privacy@paintbookco.co.uk or use the unsubscribe link in any marketing email.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">Rights related to automated decision-making</td>
                    <td className="border border-border p-3">You have the right not to be subject to decisions made solely by automated processing that significantly affect you.</td>
                    <td className="border border-border p-3">Our matching and moderation systems involve human oversight for significant decisions. Contact us at privacy@paintbookco.co.uk if you have concerns.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl mt-6 mb-4">How to Submit a Data Request</h3>
            <p>
              To exercise any of the above rights, please contact us at <strong>privacy@paintbookco.co.uk</strong> with the subject line '<strong>Data Rights Request</strong>'. Please include:
            </p>
            <ul>
              <li>Your full name and the email address associated with your PaintBookCo account</li>
              <li>The specific right you wish to exercise</li>
              <li>Any additional details that will help us locate the relevant data</li>
            </ul>
            <p>
              We will respond within 30 calendar days. If your request is complex or you have submitted multiple requests, we may extend this by a further two months, in which case we will notify you.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2>Right to Complain</h2>
            <p>
              If you are unhappy with how we handle your personal data, you have the right to lodge a complaint with the UK's Information Commissioner's Office (ICO):
            </p>
            <div className="surface-card p-6 mt-4">
              <h3 className="text-lg font-semibold mb-3">ICO Contact Details</h3>
              <p><strong>Website:</strong> ico.org.uk</p>
              <p><strong>Telephone:</strong> 0303 123 1113</p>
              <p><strong>Address:</strong> Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
            </div>
            <p className="mt-4">
              We would appreciate the opportunity to resolve any complaint directly before you contact the ICO. Please contact us first at <strong>privacy@paintbookco.co.uk</strong>.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2>Cookies</h2>
            <p>
              We use cookies and similar tracking technologies on our Platform. Cookies are small text files placed on your device that help us provide and improve our service.
            </p>

            <h3 className="text-xl mt-6 mb-4">Types of Cookies We Use</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Cookie Type</th>
                    <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                    <th className="border border-border p-3 text-left font-semibold">Can You Opt Out?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Strictly necessary</td>
                    <td className="border border-border p-3">Required for the Platform to function — session management, authentication, security tokens.</td>
                    <td className="border border-border p-3">No — these are essential to the service.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Performance/analytics</td>
                    <td className="border border-border p-3">Help us understand how users interact with our Platform (e.g. Google Analytics). Data is anonymised.</td>
                    <td className="border border-border p-3">Yes — via our cookie consent banner.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Functional</td>
                    <td className="border border-border p-3">Remember your preferences (e.g. language settings, saved searches).</td>
                    <td className="border border-border p-3">Yes — via our cookie consent banner.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Marketing</td>
                    <td className="border border-border p-3">We do not currently use marketing/advertising cookies. If this changes, we will update this policy.</td>
                    <td className="border border-border p-3">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              You can manage your cookie preferences at any time via the cookie settings link in the footer of our website. You can also control cookies through your browser settings, although this may affect your ability to use certain features of our Platform.
            </p>
            <p>
              For full details of the cookies we use, please see our Cookie Policy at paintbookco.co.uk/cookies.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2>How We Protect Your Data</h2>
            <p>
              We take the security of your personal data seriously and have implemented technical and organisational measures appropriate to the nature of the data we process. These include:
            </p>
            <ul>
              <li>Encryption of data in transit (TLS/HTTPS on all Platform communications)</li>
              <li>Encryption of data at rest (AWS S3 server-side encryption for KYC documents)</li>
              <li>Access controls: only authorised personnel can access personal data, using role-based access and multi-factor authentication</li>
              <li>Row-level security on our database: users can only access their own data</li>
              <li>KYC documents accessible only via short-lived signed URLs (maximum 5 minutes) — documents are never publicly accessible</li>
              <li>Regular security monitoring via Sentry and periodic penetration testing</li>
              <li>PII filtering in chat communications to prevent inadvertent sharing of contact details</li>
              <li>Immutable audit logging of all sensitive administrative actions</li>
            </ul>

            <p className="mt-4">
              Despite these measures, no system is completely secure. If you believe your account has been compromised, please contact us immediately at <strong>privacy@paintbookco.co.uk</strong>.
            </p>

            <h3 className="text-xl mt-6 mb-4">Data Breach Notification</h3>
            <p>
              In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the ICO within 72 hours of becoming aware of the breach. Where the breach is likely to result in a high risk to your rights and freedoms, we will also notify you directly without undue delay.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2>Children's Privacy</h2>
            <p>
              The PaintBookCo Platform is not directed at children under the age of 18. We do not knowingly collect personal data from anyone under 18 years of age. If you are under 18, please do not register for an account or submit any personal data through the Platform.
            </p>
            <p>
              If we become aware that we have inadvertently collected personal data from a person under the age of 18, we will take prompt steps to delete that data. If you believe we may have collected data from a child, please contact us at <strong>privacy@paintbookco.co.uk</strong>.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2>Third-Party Links and Services</h2>
            <p>
              Our Platform may contain links to third-party websites, services, or resources (for example, links to paint manufacturer websites or to our escrow partner Transpact). These third parties have their own privacy policies. PaintBookCo is not responsible for the privacy practices of third-party websites, and we encourage you to read their privacy policies before providing any personal data to them.
            </p>
            <p>
              Where we integrate third-party tools or services within our Platform (such as the Floori colour visualisation tool in the Paint Vestimator), we ensure appropriate data processing agreements are in place. However, your use of these integrated tools may be subject to the third party's own terms.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes to our data practices, the services we offer, or applicable law. When we make material changes, we will:
            </p>
            <ul>
              <li>Update the 'Version' and 'Effective Date' at the top of this policy</li>
              <li>Post a notice on the PaintBookCo Platform informing users of the update</li>
              <li>Where required by law or where changes significantly affect your rights, notify you directly by email</li>
            </ul>
            <p>
              We encourage you to review this Privacy Policy periodically. Continued use of the Platform after a change to this policy constitutes your acceptance of the updated terms, subject to your rights to object or withdraw consent where applicable.
            </p>
            <p>
              Previous versions of this policy are available on request by contacting us at <strong>privacy@paintbookco.co.uk</strong>.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2>How to Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests in relation to this Privacy Policy or the way we handle your personal data, please contact us:
            </p>
            
            <div className="surface-card p-6 mt-4">
              <h3 className="text-lg font-semibold mb-3">Contact Details</h3>
              <p><strong>The PaintBook Company Ltd</strong></p>
              <p>Company Number: 16690724</p>
              <p>Email: privacy@paintbookco.co.uk</p>
              <p>Website: paintbookco.co.uk</p>
              <p>Registered address: 1, 1 Fenman Mews, Walkden, Manchester, UK. M28 3YU</p>
            </div>

            <div className="mt-4 p-4 bg-accent/30 rounded-sm border border-border/50">
              <p><strong>For data rights requests:</strong> please email us with the subject line: '<strong>Data Rights Request</strong>'</p>
              <p className="mt-2"><strong>For general privacy queries:</strong> please email us with the subject line: '<strong>Privacy Query</strong>'</p>
              <p className="mt-2">We aim to respond to all enquiries within 5 working days.</p>
            </div>

            <p className="mt-4">
              If you are not satisfied with our response, you have the right to complain to the Information Commissioner's Office at <strong>ico.org.uk</strong> or by calling <strong>0303 123 1113</strong>.
            </p>
          </section>

        </article>
      </div>
    </div>
  );
}
