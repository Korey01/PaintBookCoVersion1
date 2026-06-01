export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: '#FBF7F0', color: '#1A1A14' }}>
      <div className="page-container section-gap">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <p className="editorial-label mb-4">Legal Document</p>
          <h1 className="mb-4">Terms of Service</h1>
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

        {/* Plain English Summary */}
        <div className="surface-card p-6 mb-12 bg-accent/50 border-2 border-primary/20">
          <h2 className="text-2xl mb-4">Plain English Summary</h2>
          <p className="mb-4 text-sm leading-relaxed">
            These Terms of Service govern your use of the PaintBookCo platform. We have drafted them to be as clear as possible. Here is a brief summary of the key points — but please read the full terms below, as they contain important detail.
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-primary mb-1">Key Points at a Glance</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>PaintBookCo is a marketplace connecting customers with verified painters and decorators.</li>
                <li>We are not a painting company and we do not employ painters.</li>
                <li>Painters must complete full registration and KYC verification before they can receive any jobs through the Platform.</li>
                <li>There are no subscription fees. Painters pay commission only when a job is completed — 12% on the first 5 jobs, 10% on the next 5, and 8% thereafter.</li>
                <li>All payments go through Transpact, our FCA-authorised escrow partner. This protects both parties. PaintBookCo bears the Transpact escrow cost — this is not charged to painters or customers.</li>
                <li>Commission is earned by PaintBookCo at the point of customer payment. It is deducted automatically before the job starts. Commission is only refunded where the reason for cancellation or refund is PaintBookCo's fault or the fault of our painter.</li>
                <li>No automatic payments. Funds are only released when the customer logs into Transpact directly and confirms completion. PaintBookCo does not release funds on anyone's behalf.</li>
                <li>Once payment is live in Transpact escrow, any cancellation — for any reason — must be resolved through the Transpact dispute process. This is the only way escrowed funds can be moved.</li>
                <li>If a dispute is formally raised through Transpact, both parties pay a £20.00 dispute fee to Transpact. This fee is fully refunded to the winning party. If one party fails to pay within 14 days, the other party wins automatically.</li>
                <li>PaintBookCo acts as the nominated referee for all Transpact disputes. Our decisions are binding under the Arbitration Act 1996.</li>
                <li>Sharing contact details (phone numbers, email addresses, physical addresses) in the Platform chat is strictly prohibited. Doing so to transact off-platform is a serious breach of these Terms.</li>
                <li>PaintBookCo is not liable for the quality of work performed by painters. Disputes are handled through our dispute resolution process.</li>
                <li>These Terms are governed by the laws of England and Wales.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">

          {/* Section 1 */}
          <section>
            <h2>About PaintBookCo and These Terms</h2>

            <h3 className="text-xl mt-6 mb-4">Who We Are</h3>
            <p>
              The PaintBook Company Ltd (trading as PaintBookCo) is a company incorporated in England and Wales, Company Number 16690724. We operate the PaintBookCo platform at <strong>paintbookco.co.uk</strong>, which is a two-sided digital marketplace exclusively for painters, decorators, and the customers who hire them.
            </p>
            <p>
              <strong>PaintBookCo is not a painting or decorating company.</strong> We do not employ painters or decorators. We provide technology infrastructure that connects independent professional painters with customers, and we facilitate secure payment through our FCA-authorised escrow partner. The contract for the provision of painting services is directly between the customer and the painter, not between either party and PaintBookCo.
            </p>

            <h3 className="text-xl mt-6 mb-4">Acceptance of Terms</h3>
            <p>
              By registering for an account on the Platform, you confirm that you have read, understood, and agree to be bound by these Terms of Service ('Terms'), our Privacy Policy, and our Cookie Policy. If you do not agree to these Terms, you must not use the Platform.
            </p>
            <p>
              These Terms apply to all users of the Platform, including customers posting jobs, painters registering to offer services, and any visitor browsing the Platform.
            </p>

            <h3 className="text-xl mt-6 mb-4">Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time. When we make material changes, we will notify you by email and/or by posting a notice on the Platform. Your continued use of the Platform after the effective date of updated Terms constitutes your acceptance of those changes. If you do not accept the updated Terms, you must stop using the Platform.
            </p>
            <p>
              The current version of these Terms is always available at <strong>paintbookco.co.uk/terms</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2>Definitions</h2>
            <p>In these Terms, the following words have the meanings set out below:</p>
            
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Term</th>
                    <th className="border border-border p-3 text-left font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Platform'</td>
                    <td className="border border-border p-3">The PaintBookCo website at paintbookco.co.uk and any associated services, tools, and features.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'We', 'us', 'our'</td>
                    <td className="border border-border p-3">The PaintBook Company Ltd (Company Number: 16690724).</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'You', 'your'</td>
                    <td className="border border-border p-3">Any registered user of the Platform, whether a customer, painter/decorator, or visitor.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Customer'</td>
                    <td className="border border-border p-3">A person or organisation that registers on the Platform to post a job and hire a painter or decorator.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Painter' or 'Painter/Decorator'</td>
                    <td className="border border-border p-3">A professional painter or decorator who registers on the Platform to offer their services and receive jobs.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Job'</td>
                    <td className="border border-border p-3">A specific painting or decorating project posted by a customer on the Platform.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'KYC'</td>
                    <td className="border border-border p-3">Know Your Customer — the identity and credential verification process that all painters must complete before becoming active on the Platform.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Escrow'</td>
                    <td className="border border-border p-3">The secure holding of customer funds by Transpact (our FCA-authorised escrow partner) pending job completion and release approval.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Transpact'</td>
                    <td className="border border-border p-3">Anpa Forward Ltd, trading as Transpact, FCA-authorised payment service provider (FCA Ref: 546279), our escrow partner.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Commission'</td>
                    <td className="border border-border p-3">The fee payable by the painter to PaintBookCo upon agreement of job terms and payment by customer, calculated as a percentage of the agreed job value.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Paint Vestimator'</td>
                    <td className="border border-border p-3">PaintBookCo's proprietary AI-powered tool for estimating paint quantities, projecting costs, and visualising colour schemes.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'In-Platform Chat'</td>
                    <td className="border border-border p-3">The job-scoped messaging system provided on the Platform for communication between matched painters and customers.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Prohibited Content'</td>
                    <td className="border border-border p-3">Content that violates these Terms, including personal contact information shared in the Platform chat.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">'Services Agreement'</td>
                    <td className="border border-border p-3">The contract for painting or decorating services formed directly between the customer and the painter upon job acceptance and escrow funding.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2>Accounts and Registration</h2>

            <h3 className="text-xl mt-6 mb-4">Eligibility</h3>
            <p>To register for an account on the Platform, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Be a resident of the United Kingdom or, in the case of a business customer or painter, registered or operating in the United Kingdom</li>
              <li>Provide accurate, complete, and current information during registration</li>
              <li>Not be barred from using our services under applicable law</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Account Security</h3>
            <p>
              You are responsible for maintaining the security of your account, including your password. You must not share your login credentials with any other person. You agree to notify us immediately at <strong>hello@paintbookco.co.uk</strong> if you become aware of any unauthorised use of your account.
            </p>
            <p>
              PaintBookCo will not be liable for any loss or damage resulting from your failure to comply with these security obligations.
            </p>

            <h3 className="text-xl mt-6 mb-4">Accurate Information</h3>
            <p>
              You agree to provide accurate and truthful information at all times, including during registration, KYC, job posting, and any communications with PaintBookCo or other users. You must update your account information promptly if it changes. We reserve the right to suspend or terminate accounts where we have reason to believe that information provided is inaccurate, misleading, or fraudulent.
            </p>

            <h3 className="text-xl mt-6 mb-4">One Account Per User</h3>
            <p>
              Each individual or business may hold only one account on the Platform in each capacity (one customer account and/or one painter account). Creating multiple accounts to circumvent suspensions, commission obligations, or any other Platform policy is a serious breach of these Terms.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2>Painter Registration and KYC Verification</h2>

            <h3 className="text-xl mt-6 mb-4">KYC Requirement</h3>
            <p>
              <strong>All painters and decorators must successfully complete our KYC verification process before they are eligible to receive any jobs through the Platform. There are no exceptions to this requirement.</strong>
            </p>
            <p>
              The KYC process is a core part of PaintBookCo's commitment to trust and safety. It protects customers and the integrity of the Platform. Commencement of KYC does not guarantee activation — approval is at PaintBookCo's discretion.
            </p>

            <h3 className="text-xl mt-6 mb-4">KYC Documents Required</h3>
            <p>To complete KYC, painters must upload the following documents through the Platform:</p>
            <ul>
              <li><strong>Proof of identity</strong> — a valid passport or UK driving licence</li>
              <li><strong>Proof of address</strong> — a utility bill or bank statement dated within the last 3 months</li>
              <li><strong>Public liability insurance certificate</strong> — current and valid</li>
              <li><strong>Trade qualifications or certifications</strong> (optional but encouraged)</li>
            </ul>
            <p>
              Documents are reviewed by PaintBookCo. We will notify you by email of the outcome (approved or rejected with reasons) within a reasonable period. Approved painters are added to the active matching pool. Rejected painters may resubmit with corrected documentation.
            </p>

            <h3 className="text-xl mt-6 mb-4">KYC Obligations of Painters</h3>
            <p>By submitting KYC documents, you confirm that:</p>
            <ul>
              <li>All documents are genuine, current, and belong to you</li>
              <li>You are legally entitled to offer painting and decorating services in the United Kingdom</li>
              <li>Your public liability insurance is valid for the type of work you accept through the Platform</li>
              <li>You will notify PaintBookCo promptly if your insurance expires or your eligibility changes</li>
            </ul>
            <p>
              <strong>Submitting fraudulent, altered, or falsified documents is a criminal offence and will result in immediate and permanent account termination, reporting to relevant authorities, and potential legal action.</strong>
            </p>

            <h3 className="text-xl mt-6 mb-4">Ongoing Compliance</h3>
            <p>
              Painter activation is not a one-time event. PaintBookCo reserves the right to request updated documents at any time, including upon insurance renewal. Painters who fail to maintain current, valid documentation may be suspended from the matching pool without notice.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2>How the Platform Works</h2>

            <h3 className="text-xl mt-6 mb-4">Job Posting (Customers)</h3>
            <p>
              Customers post jobs on the Platform by providing details of the work required, including location, job type, approximate dimensions or scope, requested dates, and budget. Customers may optionally use the Paint Vestimator to generate an AI-assisted cost estimate and visualise colour options before posting.
            </p>
            <p>
              A job posting does not create a contractual commitment. It is an invitation for eligible painters to express interest.
            </p>

            <h3 className="text-xl mt-6 mb-4">Automated Matching</h3>
            <p>
              Upon a customer posting a job, PaintBookCo's automated matching system identifies eligible painters based on:
            </p>
            <ul>
              <li><strong>Geographic proximity</strong> — the job location falls within the painter's stated service radius</li>
              <li><strong>Specialism</strong> — the painter's specialisms match the job type</li>
              <li><strong>Availability</strong> — the painter's available dates overlap with the requested dates</li>
              <li><strong>KYC status</strong> — only fully KYC-approved, active painters are eligible</li>
              <li><strong>Account standing</strong> — painters with open unresolved disputes may be excluded</li>
            </ul>
            <p>
              Up to five eligible painters are notified of a new job. Painters are ranked by average rating, completed job count, and response time. PaintBookCo does not guarantee that any specific painter will be notified of or accept any specific job.
            </p>

            <h3 className="text-xl mt-6 mb-4">Job Acceptance (Painters)</h3>
            <p>
              Notified painters may accept or decline a job through their dashboard. The first painter to accept a job is assigned to it. Once a job is accepted, remaining matched painters are notified that the job is no longer available.
            </p>
            <p>
              A painter who accepts a job represents that they:
            </p>
            <ul>
              <li>Have the skills, experience, and qualifications to complete the work</li>
              <li>Are available on the requested dates</li>
              <li>Hold current public liability insurance covering the work</li>
              <li>Will communicate and engage with the customer professionally and through the Platform</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Customer Payment and Escrow Funding</h3>
            <p>
              Upon a painter accepting a job, the customer is directed to make payment of the full agreed job value through Transpact (Anpa Forward Ltd, FCA Ref: 546279), our regulated escrow partner. The customer will receive an email from Transpact with a secure link. The customer logs into Transpact directly and follows their secure process to fund the escrow. Payment must be made before the job commences.
            </p>
            <p>
              At the point payment is received and cleared by Transpact, the escrow becomes live:
            </p>
            <ul>
              <li>PaintBookCo's commission is deducted automatically by Transpact in accordance with these Terms</li>
              <li>The remaining balance (net of commission) is held securely in Transpact's client bank account for the painter</li>
              <li>The job is confirmed and the Platform chat channel opens between the painter and customer</li>
              <li>PaintBookCo sends both parties official contact details via a system-generated email — this is the only mechanism by which contact details are exchanged</li>
            </ul>
            <p>
              <strong>PaintBookCo does not hold, touch, or have custody of any customer funds at any point.</strong> All funds are held by Transpact under their own FCA regulatory obligations.
            </p>
            <p>
              A Services Agreement between the customer and the painter is formed at the point of escrow funding. From this point, both parties have contractual obligations to each other in respect of the job.
            </p>

            <h3 className="text-xl mt-6 mb-4">Job Completion and Payment Release</h3>
            <p>
              When the painter has completed the work, they mark the job as complete in their dashboard. The customer is notified and must log into Transpact directly to instruct the release of funds to the painter.
            </p>
            <p>
              <strong>PaintBookCo does not release funds on anyone's behalf.</strong> Release is always instructed by the customer through Transpact's secure website. Once a Transpact is live, funds can only move in the following ways:
            </p>
            <ul>
              <li>The customer logs into Transpact and instructs payment to the painter</li>
              <li>Both parties agree and the customer instructs Transpact to return funds</li>
              <li>A formal dispute is raised and the appointed referee instructs Transpact on how to distribute the funds</li>
            </ul>

            <div className="surface-card p-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50">
              <h4 className="text-lg font-bold mb-3 text-red-900 dark:text-red-100">Important — How Payment Release Works</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                <li>Funds are released only when the customer logs into Transpact and instructs payment to the painter.</li>
                <li>If the customer does not respond within 48 hours of the painter marking the job complete, PaintBookCo will notify the painter to initiate the Transpact dispute process.</li>
                <li>Once a dispute is initiated, if the customer fails to pay the Transpact dispute fee within 14 days of being notified, the painter automatically receives the full payment and their dispute fee is refunded.</li>
                <li>Painters must not pressure customers to confirm completion prematurely. Doing so is a breach of these Terms.</li>
              </ul>
            </div>

            <h3 className="text-xl mt-6 mb-4">Milestone Payments</h3>
            <p>
              For larger jobs, customers and painters may agree to split payment into milestones, each representing a defined phase of the work. Milestone amounts must be agreed in the job setup and must sum to the total agreed job value. The full gross amount (including PaintBookCo commission) is paid into Transpact escrow at the start of the job. Each milestone is released separately upon customer approval of that milestone's completion.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2>Commission and Fees</h2>

            <h3 className="text-xl mt-6 mb-4">Commission Structure</h3>
            <p>
              PaintBookCo operates a tiered pay-per-job commission model. There are no subscription fees, listing fees, or upfront charges. Painters pay only upon successful job agreement and payment by customer. Commission rates are as follows:
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Jobs Completed on Platform</th>
                    <th className="border border-border p-3 text-left font-semibold">Commission Rate</th>
                    <th className="border border-border p-3 text-left font-semibold">Example (£500 job)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Jobs 1–5 (first 5 completed)</td>
                    <td className="border border-border p-3">12%</td>
                    <td className="border border-border p-3">PaintBookCo: £60 | Painter receives: £440</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Jobs 6–10 (next 5 completed)</td>
                    <td className="border border-border p-3">10%</td>
                    <td className="border border-border p-3">PaintBookCo: £50 | Painter receives: £450</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Job 11 onwards</td>
                    <td className="border border-border p-3">8%</td>
                    <td className="border border-border p-3">PaintBookCo: £40 | Painter receives: £460</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              Commission rates are calculated on the total agreed job value (excluding any separately agreed cost of materials where materials are not included in the Platform job value). Commission tiers are tracked per painter account and reset only upon account termination.
            </p>

            <h3 className="text-xl mt-6 mb-4">When Commission Is Taken</h3>
            <p>
              Commission is deducted at the point of customer payment, before the job commences. This is handled automatically by Transpact using the OriginatorFixedCommissionOnSendToAll parameter at the time the escrow transaction is created. PaintBookCo does not invoice painters separately for commission — the deduction is built into the payment flow. Commission is earned at the point of payment and is non-refundable except where the reason for cancellation or non-delivery is PaintBookCo's fault or the fault of a painter supplied by PaintBookCo (for example, PaintBookCo's inability to provide an eligible painter, or a painter who abandons the job without good cause). Commission is not refunded on customer-initiated cancellations, customer disputes, or any situation where the fault does not lie with PaintBookCo or its painter.
            </p>
            <p>
              The commission deduction is irreversible once made, except in the specific circumstances set out in Section 9 (Cancellations and Reversals).
            </p>

            <h3 className="text-xl mt-6 mb-4">Transpact Transaction Fee</h3>
            <p>
              Transpact charges a flat fee per escrow transaction. PaintBookCo bears this escrow cost as part of providing the Platform service. This cost is not passed to customers or painters. Customers pay only the agreed job value. Painters receive the net job value after commission.
            </p>

            <h3 className="text-xl mt-6 mb-4">No Subscription, Listing, or Lead Fees</h3>
            <p>
              PaintBookCo does not charge painters subscription fees, listing fees, or fees for receiving job notifications. Painters who receive a job notification but decline it, or who are not selected, incur no charge of any kind.
            </p>

            <h3 className="text-xl mt-6 mb-4">Commission on Disputed or Cancelled Jobs</h3>
            <p>
              See Section 9 for the treatment of commission in the event of a cancellation, dispute, or reversal.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2>The Paint Vestimator Tool</h2>

            <h3 className="text-xl mt-6 mb-4">Purpose and Use</h3>
            <p>
              The Paint Vestimator is PaintBookCo's AI-powered estimation tool designed to help customers calculate paint quantities, project costs, and visualise colour options. It is provided as an aid to decision-making and is not a guarantee of the actual cost, quantity of materials required, or final appearance of any painting job.
            </p>

            <h3 className="text-xl mt-6 mb-4">Accuracy and Limitations</h3>
            <p>
              The Paint Vestimator provides estimates based on the information you input and industry-standard coverage ratios. Actual results may vary depending on:
            </p>
            <ul>
              <li><strong>Surface condition</strong> — walls with significant damage, texture, or previous dark colours may require additional coats and materials</li>
              <li><strong>Paint brand and specific product</strong> — coverage ratios vary between products</li>
              <li><strong>Application method</strong> — roller, brush, or spray application affects coverage</li>
              <li><strong>Painter technique and skill level</strong></li>
              <li><strong>Accuracy of dimensions provided</strong> — the tool is only as accurate as the inputs given</li>
            </ul>
            <p>
              PaintBookCo targets 95% accuracy for standard applications. However, estimates generated by the Paint Vestimator are not binding quotes. Painters are responsible for conducting their own assessment and providing their own professional quote before accepting a job.
            </p>

            <h3 className="text-xl mt-6 mb-4">Colour Visualisation</h3>
            <p>
              Colour visualisation features (currently provided through Floori API integration) allow customers to preview paint colours on uploaded images. Visualised results are representations only. Actual paint colours may appear differently depending on lighting, surface finish, screen calibration, and the specific paint product used. PaintBookCo does not guarantee that the visual preview accurately represents the final appearance.
            </p>

            <h3 className="text-xl mt-6 mb-4">Data from Vestimator Use</h3>
            <p>
              Anonymised and aggregated data from Vestimator usage (dimensions, paint quantities, regional pricing) is used to improve the accuracy of the tool over time. Personal data associated with Vestimator use is handled in accordance with our Privacy Policy.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2>Escrow, Payments, and PaintBookCo Commission</h2>

            <h3 className="text-xl mt-6 mb-4">Mandatory Escrow</h3>
            <p>
              Use of Transpact escrow is mandatory for all jobs booked through the Platform. It is not optional. Customers may not pay painters directly outside the Platform's escrow system for any job sourced through PaintBookCo. Painters may not accept direct payment from customers for any job sourced through PaintBookCo. Circumventing the escrow requirement is a serious breach of these Terms (see also Section 11 — Platform Circumvention).
            </p>

            <h3 className="text-xl mt-6 mb-4">How Escrow Works</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Customer posts a job. Painter is matched and accepts.</li>
              <li>Customer pays the full agreed job value through the Platform. Payment is processed by Transpact.</li>
              <li>PaintBookCo's commission is deducted automatically at the point of payment. The net amount is held by Transpact in escrow.</li>
              <li>Painter is notified that the job is funded and work may begin.</li>
              <li>Painter completes the work. Painter marks job complete on the Platform.</li>
              <li>Customer reviews and confirms job completion on the Platform.</li>
              <li>The customer logs into Transpact directly and instructs release of escrowed funds to the painter's nominated bank account.</li>
            </ol>

            <h3 className="text-xl mt-6 mb-4">Payment Responsibility</h3>
            <p>
              Customers are responsible for ensuring that the agreed job value submitted at the point of payment accurately reflects the scope of work agreed with the painter. PaintBookCo is not responsible for any discrepancy between the payment amount and the scope of work actually performed.
            </p>
            <p>
              If the scope of work changes materially after escrow is funded, the customer and painter must agree any price adjustment and notify PaintBookCo. Additional payments for agreed scope changes may require a separate escrow transaction.
            </p>

            <h3 className="text-xl mt-6 mb-4">Transpact as Independent FCA-Authorised Provider</h3>
            <p>
              Transpact (Anpa Forward Ltd, FCA Ref: 546279) holds all escrowed funds as an independent, FCA-authorised payment service provider. PaintBookCo does not hold or have custody of customer funds. All fund-holding, safeguarding, and disbursement is managed by Transpact under their own regulatory obligations. By using the Platform, you agree to Transpact's own terms and conditions, which are available at transpact.com.
            </p>

            <h3 className="text-xl mt-6 mb-4">Payment Failure</h3>
            <p>
              If a customer's payment fails during the escrow funding process, the job will revert to 'awaiting payment' status. The painter will be notified. The job booking is not confirmed until escrow is successfully funded. PaintBookCo is not liable for any loss caused by a failed payment.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2>Cancellations, Reversals, and Dispute Resolution</h2>

            <div className="surface-card p-6 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-900/50 mb-6">
              <h3 className="text-xl font-bold mb-3 text-yellow-900 dark:text-yellow-100">The Golden Rule — Transpact Controls All Fund Movement</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <li><strong>Once payment is live in Transpact escrow, funds can only move by instruction from a transacting party or the appointed referee.</strong></li>
                <li>PaintBookCo cannot move, release, or refund funds directly. Every financial resolution — including cancellations — requires the Transpact process.</li>
                <li>This protects both parties. Your money is held by an FCA-regulated independent third party, not by PaintBookCo.</li>
              </ul>
            </div>

            <h3 className="text-xl mt-6 mb-4">9.1 — Cancellation Before Payment is Live</h3>
            <p>
              If a job is cancelled before the customer's payment has been received and cleared by Transpact, no funds have been committed and no Transpact dispute is needed. The job is simply closed on PaintBookCo. No charges apply to either party.
            </p>

            <h3 className="text-xl mt-6 mb-4">9.2 — Cancellation After Payment is Live</h3>
            <p>
              Once payment is live in Transpact escrow, any cancellation — regardless of the reason — must be resolved through the Transpact dispute process. This is because Transpact can only move funds on instruction from a transacting party or a referee.
            </p>
            <p>The process is:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Either the customer or the painter raises a dispute through their PaintBookCo dashboard.</li>
              <li>Both parties are required to pay a <strong>£20.00 dispute fee</strong> to Transpact to commence formal arbitration. This fee is fully refunded to the party in whose favour the decision is made.</li>
              <li>PaintBookCo provides guidance to both parties on what each is entitled to based on the cancellation circumstances set out below.</li>
              <li>The Transpact-nominated referee makes the final binding decision on how funds are distributed.</li>
            </ol>

            <h4 className="text-lg font-semibold mt-4 mb-2">Cancellation — Painter Fault or PaintBookCo Fault</h4>
            <p>The customer is entitled to a full refund of the escrowed net amount. PaintBookCo's commission is also refunded in full. The painter receives nothing.</p>

            <h4 className="text-lg font-semibold mt-4 mb-2">Cancellation at Customer's Request — Before Work Has Commenced</h4>
            <p>PaintBookCo's commission is retained. The painter is entitled to compensation from the net escrowed amount based on notice given before the agreed start date:</p>
            <ul>
              <li><strong>More than 7 days notice:</strong> 10% of net job value to painter</li>
              <li><strong>3 to 7 days notice:</strong> 20% of net job value to painter</li>
              <li><strong>Less than 72 hours notice:</strong> 30% of net job value to painter</li>
            </ul>
            <p>The remainder is returned to the customer. PaintBookCo will provide evidence of the agreed compensation amounts to the Transpact referee to support the decision.</p>

            <h4 className="text-lg font-semibold mt-4 mb-2">Cancellation After Work Has Commenced</h4>
            <p>
              Once work has commenced, the customer is not entitled to a refund unless the painter has demonstrably failed to perform the work to a reasonable professional standard. See Section 9.5 — Quality Disputes.
            </p>

            <h3 className="text-xl mt-6 mb-4">9.3 — Job Commencement — Definition</h3>
            <p>For the purposes of these Terms, job commencement is defined as follows depending on the materials arrangement:</p>
            <ul>
              <li><strong>Materials purchased by customer:</strong> when the painter attends the property and begins any preparatory work.</li>
              <li><strong>Materials purchased by painter on customer's behalf:</strong> the earlier of when the painter places the order for materials, or when the painter attends the property.</li>
              <li><strong>Materials purchased through PaintBookCo platform:</strong> the earlier of when the platform order is confirmed, or when the painter attends the property.</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">9.4 — 48-Hour Non-Response</h3>
            <p>
              If a customer does not log into Transpact to release funds or raise a dispute within <strong>48 hours</strong> of the painter marking the job as complete on PaintBookCo, PaintBookCo will notify the painter and advise them to initiate arbitration directly through Transpact.
            </p>
            <p>
              The painter pays the <strong>£20.00 Transpact dispute fee</strong>. Transpact then notifies the customer, who has <strong>14 days</strong> to pay their own dispute fee.
            </p>
            <ul>
              <li>If the customer <strong>does not pay within 14 days</strong> — Transpact automatically awards the full payment to the painter and refunds the painter's dispute fee in full. The painter incurs no net cost.</li>
              <li>If the customer <strong>does pay within 14 days</strong> — formal arbitration begins with the Transpact-nominated referee making a binding decision.</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">9.5 — Quality Disputes</h3>
            <p>If a customer raises a dispute on the grounds that the work has not been completed to a satisfactory standard:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>The disputing party raises a dispute on PaintBookCo with supporting evidence — photographs, descriptions, chat transcripts.</li>
              <li>Both parties pay the <strong>£20.00 Transpact dispute fee</strong> to commence formal arbitration.</li>
              <li>PaintBookCo submits all available evidence — including the agreed job conditions, Platform chat history, and milestone records — to support the Transpact referee's decision.</li>
              <li>The Transpact-nominated referee reviews the evidence and makes a <strong>binding decision</strong> under the Arbitration Act 1996.</li>
              <li>Transpact distributes funds in accordance with the referee's decision.</li>
              <li>The dispute fee is refunded to the party in whose favour the decision is made.</li>
            </ol>
            <p>The referee's decision is final. There is no appeal within the Transpact process, though parties retain the right to pursue legal remedies through the courts independently.</p>

            <h3 className="text-xl mt-6 mb-4">9.6 — Dispute Fees</h3>
            <p>
              Transpact charges each party a dispute fee of <strong>£20.00 (GBP)</strong> per dispute when formal arbitration is invoked. This fee is charged by Transpact, not by PaintBookCo. PaintBookCo has no control over this fee and does not receive any part of it.
            </p>
            <p>
              The fee is <strong>fully refunded to the party in whose favour the referee decides</strong>. If one party fails to pay their dispute fee within 14 days, Transpact automatically awards the full transaction amount to the other party and refunds that party's dispute fee.
            </p>

            <h3 className="text-xl mt-6 mb-4">9.7 — Property Damage by the Painter</h3>
            <p>
              Where a painter causes physical damage to the customer's property during a job, this is a matter between the customer and the painter's public liability insurer. Customers may request the painter's insurance details through PaintBookCo at <strong>hello@paintbookco.co.uk</strong>. PaintBookCo is not a party to any insurance claim and accepts no liability for property damage caused by painters.
            </p>

            <h3 className="text-xl mt-6 mb-4">9.8 — Commission in Dispute and Cancellation Situations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left font-semibold">Scenario</th>
                    <th className="border border-border p-3 text-left font-semibold">Commission Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Job completed and confirmed by customer</td>
                    <td className="border border-border p-3">Retained by PaintBookCo — not refundable.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Cancellation — painter fault or PaintBookCo fault</td>
                    <td className="border border-border p-3">Refunded in full to the customer.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Cancellation — customer fault, pre-commencement</td>
                    <td className="border border-border p-3">Retained by PaintBookCo. Painter receives sliding scale compensation (10% / 20% / 30% of net job value). See Section 9.2.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Dispute — referee awards full payment to painter</td>
                    <td className="border border-border p-3">Retained by PaintBookCo.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Dispute — referee awards full refund to customer</td>
                    <td className="border border-border p-3">Retained by PaintBookCo unless PaintBookCo or its painter is at fault.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Dispute — partial split by referee</td>
                    <td className="border border-border p-3">Retained in full by PaintBookCo unless PaintBookCo or its painter is at fault.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">PaintBookCo unable to provide a painter / platform error</td>
                    <td className="border border-border p-3">Refunded in full to customer.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2>Painter Obligations and Standards</h2>

            <h3 className="text-xl mt-6 mb-4">Professional Standards</h3>
            <p>By registering as a painter on the Platform, you agree to:</p>
            <ul>
              <li>Carry out all work to a professional standard appropriate to your stated experience and qualifications</li>
              <li>Arrive on time and communicate promptly with customers through the Platform</li>
              <li>Provide an honest and accurate assessment of the work required before accepting a job</li>
              <li>Use materials appropriate to the job and in line with any specifications agreed with the customer</li>
              <li>Leave the customer's property clean and in good order upon completion</li>
              <li>Comply with all applicable health and safety regulations, including PPE requirements and safe working at height</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Insurance</h3>
            <p>
              Painters must hold valid public liability insurance for the duration of their activity on the Platform, with a minimum level of cover of <strong>£2,000,000 (two million pounds)</strong>. This is the recognised industry standard for UK painting and decorating professionals and is a condition of your registration and continued use of PaintBookCo.
            </p>
            <p>
              You must ensure your policy remains in force at all times while you have an active profile, open jobs, or pending payments on the Platform. You must notify PaintBookCo immediately if your insurance lapses, expires, or is cancelled for any reason. PaintBookCo reserves the right to suspend your account pending receipt of evidence of valid renewed cover, and to withhold payment releases until compliance is confirmed.
            </p>
            <p>
              Painters working on higher-value residential properties or commercial premises are strongly encouraged to hold cover of <strong>£5,000,000 (five million pounds)</strong>, as some property managers, housing associations, and commercial clients require this as a contractual condition before granting site access.
            </p>
            <p>
              <strong>Employers' Liability Insurance</strong> — If you engage subcontractors, apprentices, or any workers (whether full-time, part-time, or temporary), you are legally required under the Employers' Liability (Compulsory Insurance) Act 1969 to hold employers' liability insurance with a minimum cover of <strong>£5,000,000 (five million pounds)</strong>. Failure to comply is a criminal offence and may result in fines of up to <strong>£2,500 per day</strong>. PaintBookCo will suspend accounts found to be operating without legally required employers' liability cover.
            </p>
            <p>
              PaintBookCo also strongly recommends that painters hold tools and equipment insurance to protect against the loss, theft, or damage of trade equipment. While not a platform requirement, uninsured tool losses can disrupt job delivery and affect your reputation on the Platform.
            </p>
            <p>
              PaintBookCo does not accept any liability for losses, claims, or damages arising from a painter's failure to maintain adequate insurance. Proof of insurance may be requested at any time, and PaintBookCo reserves the right to require painters to provide up-to-date certificates of insurance as a condition of continued platform access.
            </p>

            <h3 className="text-xl mt-6 mb-4">Accurate Portfolio and Profile</h3>
            <p>
              All photographs and project descriptions in your painter profile must:
            </p>
            <ul>
              <li>Be of work genuinely completed by you</li>
              <li>Accurately represent your current standard of work</li>
              <li>Not include images of work completed by others or sourced from the internet</li>
              <li>Not be AI-generated or digitally manipulated to misrepresent quality</li>
            </ul>
            <p>
              PaintBookCo uses AI-assisted fraud detection to screen portfolio images. Submission of fraudulent portfolio content will result in immediate account termination.
            </p>

            <h3 className="text-xl mt-6 mb-4">Tax and Self-Employment Obligations</h3>
            <p>
              Painters registered on the Platform are independent contractors, not employees of PaintBookCo. You are solely responsible for:
            </p>
            <ul>
              <li>Registering as self-employed with HMRC (if not already registered)</li>
              <li>Declaring income earned through PaintBookCo on your Self Assessment tax return</li>
              <li>Paying Income Tax and National Insurance contributions due on your earnings</li>
              <li>Compliance with Making Tax Digital requirements as they apply to your income level</li>
            </ul>
            <p>
              PaintBookCo does not provide tax advice. We recommend consulting a qualified accountant or visiting <strong>hmrc.gov.uk</strong> for guidance.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2>Platform Circumvention — Strictly Prohibited</h2>

            <div className="surface-card p-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 mb-6">
              <h3 className="text-lg font-bold mb-3 text-red-900 dark:text-red-100">This is one of the most important sections of these Terms.</h3>
              <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                PaintBookCo's commercial model depends on all transactions for jobs sourced through the Platform being processed through the Platform's escrow system.
              </p>
              <p className="font-semibold text-red-900 dark:text-red-100">
                Any attempt to transact directly, share contact details in chat, or encourage off-platform payment is a serious breach and will result in permanent account termination.
              </p>
            </div>

            <h3 className="text-xl mt-6 mb-4">Prohibition on Off-Platform Transactions</h3>
            <p>You must not, directly or indirectly:</p>
            <ul>
              <li>Contact or attempt to contact another Platform user outside of the Platform for the purpose of conducting or negotiating a transaction relating to a job sourced through PaintBookCo</li>
              <li>Pay or accept payment for a job sourced through PaintBookCo outside of the Platform's escrow system</li>
              <li>Encourage, request, or solicit another user to transact outside the Platform</li>
              <li>Share or solicit the sharing of personal contact information (phone numbers, email addresses, physical addresses, social media handles, messaging app identities) through the Platform chat or any other Platform feature</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">PII Filtering in Chat</h3>
            <p>
              To enforce the prohibition above, all messages sent through the Platform's in-platform chat are scanned in real time by automated filters before delivery. Messages that contain or appear to contain personal contact information are blocked and not delivered to the recipient.
            </p>
            <p>
              You acknowledge and consent to this monitoring as a condition of using the Platform. Repeated attempts to share contact information through the chat system will result in account suspension and may result in permanent termination.
            </p>

            <h3 className="text-xl mt-6 mb-4">How Official Contact Details Are Shared</h3>
            <p>
              When a job is confirmed and escrow is funded, PaintBookCo will send both the customer and the painter their respective contact details via a single system-generated email. This is the only authorised mechanism for contact detail exchange. No contact details will be shared before escrow is funded and no contact details will ever be sent through the Platform chat.
            </p>

            <h3 className="text-xl mt-6 mb-4">Consequences of Platform Circumvention</h3>
            <p>In the event of a breach of this Section 11, PaintBookCo may, at its absolute discretion:</p>
            <ul>
              <li>Immediately suspend or permanently terminate the accounts of all involved parties</li>
              <li>Pursue a civil claim for damages equivalent to the lost commission on the circumvented transaction(s), including any commission on future jobs that PaintBookCo can demonstrate would reasonably have been conducted through the Platform</li>
              <li>Report the breach to relevant authorities where fraudulent activity is suspected</li>
              <li>Retain any escrowed funds pending investigation</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2>Customer Obligations</h2>

            <h3 className="text-xl mt-6 mb-4">Accurate Job Postings</h3>
            <p>
              Customers must provide accurate and complete information when posting a job, including honest descriptions of the scope of work, property access arrangements, known surface conditions, and any health and safety considerations. Inaccurate job postings that cause a painter to incur additional costs or time may result in legitimate additional charges from the painter.
            </p>

            <h3 className="text-xl mt-6 mb-4">Access and Cooperation</h3>
            <p>
              Customers must provide the painter with reasonable access to the property and cooperation necessary to complete the work as agreed. Unreasonable delay or refusal of access that prevents job completion may be treated as customer fault for the purposes of any cancellation or dispute resolution.
            </p>

            <h3 className="text-xl mt-6 mb-4">Timely Review and Confirmation</h3>
            <p>
              When a painter marks a job or milestone as complete, customers must log into Transpact and confirm completion or raise a dispute within <strong>48 hours</strong>. If you do not respond within this period, the painter is entitled to initiate the Transpact dispute process. If you then fail to pay the Transpact dispute fee within 14 days of being notified, the full payment will be automatically released to the painter. Failure to engage promptly protects neither party — please respond within 48 hours.
            </p>

            <h3 className="text-xl mt-6 mb-4">Genuine Reviews</h3>
            <p>
              Customers may leave reviews and ratings for painters following job completion. Reviews must be honest, accurate, and relate only to the specific job completed. You must not post false, misleading, defamatory, or vengeful reviews. PaintBookCo reserves the right to remove any review that it considers to be in breach of this obligation.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2>Acceptable Use of the Platform</h2>
            <p>You agree that you will not use the Platform to:</p>
            <ul>
              <li>Violate any applicable law or regulation, including data protection law, anti-money laundering and anti-terrorist financing law, consumer protection law, or employment law</li>
              <li>Harass, threaten, abuse, or discriminate against any other user or PaintBookCo staff</li>
              <li>Post, upload, or transmit any content that is defamatory, obscene, fraudulent, or in violation of any third party's rights</li>
              <li>Attempt to access, interfere with, or disrupt any part of the Platform's technical infrastructure</li>
              <li>Introduce malware, viruses, or any other harmful code to the Platform</li>
              <li>Use automated tools, bots, or scrapers to extract data from the Platform without our written consent</li>
              <li>Impersonate any other person or entity</li>
              <li>Create fake reviews, ratings, or job records</li>
              <li>Use the Platform to market, advertise, or promote services or products other than your painting and decorating services (painters only)</li>
            </ul>
            <p>
              PaintBookCo reserves the right to remove any content, suspend any account, and take any other action we consider appropriate to enforce this Section.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2>Intellectual Property</h2>

            <h3 className="text-xl mt-6 mb-4">PaintBookCo's IP</h3>
            <p>
              All intellectual property rights in the Platform, including but not limited to the PaintBookCo brand, logo, software, algorithms, the Paint Vestimator, website design, and content created by PaintBookCo, are owned by or licensed to The PaintBook Company Ltd. Nothing in these Terms grants you any rights in PaintBookCo's intellectual property except the limited right to use the Platform in accordance with these Terms.
            </p>

            <h3 className="text-xl mt-6 mb-4">Your Content</h3>
            <p>
              You retain ownership of any content you upload to the Platform, including portfolio photographs, job descriptions, and reviews. By uploading content to the Platform, you grant PaintBookCo a non-exclusive, worldwide, royalty-free licence to use, display, reproduce, and distribute that content for the purposes of operating the Platform and marketing PaintBookCo's services (for example, featuring before-and-after photographs in promotional materials with your consent).
            </p>
            <p>
              You confirm that any content you upload does not infringe the intellectual property rights of any third party and that you have the right to grant the licence described above.
            </p>

            <h3 className="text-xl mt-6 mb-4">Proprietary Dataset</h3>
            <p>
              Anonymised and aggregated data generated through Platform use (including Paint Vestimator data, job outcome data, and pricing data) is the intellectual property of PaintBookCo and may be used to improve our services, train our AI tools, and generate market insights. No identifiable personal data is used for these purposes without your consent.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2>Limitation of Liability</h2>

            <div className="surface-card p-6 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-900/50 mb-6">
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">Important — Please Read Carefully</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This section limits PaintBookCo's liability to you. It does not affect your statutory rights as a consumer under UK law. <strong>Solicitor review recommended for this section before publication.</strong>
              </p>
            </div>

            <h3 className="text-xl mt-6 mb-4">PaintBookCo Is a Marketplace Intermediary</h3>
            <p>
              PaintBookCo provides a technology platform that connects customers and painters. We are not a party to the Services Agreement between customers and painters. We do not supervise, direct, or control the painting or decorating work performed by painters. We are not responsible for:
            </p>
            <ul>
              <li>The quality, safety, legality, timeliness, or any other aspect of the painting or decorating services performed by painters</li>
              <li>Any property damage caused by a painter during or after a job</li>
              <li>Any injury to persons arising from painting or decorating work</li>
              <li>A painter's failure to hold adequate insurance for the work performed</li>
              <li>Any dispute between a customer and a painter that cannot be resolved through our dispute resolution process</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Limitation of PaintBookCo's Liability</h3>
            <p>
              To the fullest extent permitted by applicable law, PaintBookCo's total liability to you for any claim arising out of or in connection with these Terms or your use of the Platform shall not exceed the greater of:
            </p>
            <ul>
              <li>The total commission paid to PaintBookCo in connection with the specific job to which the claim relates; or</li>
              <li>£500</li>
            </ul>
            <p>
              PaintBookCo is not liable to you for any indirect, consequential, special, or punitive losses, including loss of profits, loss of income, loss of business, or loss of data, whether or not PaintBookCo has been advised of the possibility of such losses.
            </p>

            <h3 className="text-xl mt-6 mb-4">Exceptions</h3>
            <p>Nothing in these Terms limits or excludes PaintBookCo's liability for:</p>
            <ul>
              <li>Death or personal injury caused by our negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Any liability that cannot be excluded or limited under applicable UK law, including the Consumer Rights Act 2015 and the Consumer Protection from Unfair Trading Regulations 2008</li>
            </ul>

            <h3 className="text-xl mt-6 mb-4">Paint Vestimator Estimates</h3>
            <p>
              PaintBookCo does not warrant the accuracy of any estimate, projection, or visualisation produced by the Paint Vestimator. All estimates are provided for guidance only. PaintBookCo is not liable for any loss arising from a painter or customer acting on Vestimator output.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2>Suspension and Termination</h2>

            <h3 className="text-xl mt-6 mb-4">Termination by You</h3>
            <p>
              You may close your account at any time by contacting us at <strong>hello@paintbookco.co.uk</strong>. Account closure does not affect any obligations or liabilities arising before the date of closure. In particular, any commission owing in respect of jobs accepted before closure remains payable. If you are a painter with active jobs at the time of closure, you must complete those jobs or reach an agreed resolution with the relevant customers.
            </p>

            <h3 className="text-xl mt-6 mb-4">Suspension or Termination by PaintBookCo</h3>
            <p>
              PaintBookCo reserves the right to suspend or terminate your account at any time and for any reason, including but not limited to:
            </p>
            <ul>
              <li>Breach of any provision of these Terms</li>
              <li>Submission of fraudulent KYC documents or other fraudulent activity</li>
              <li>Platform circumvention (see Section 11)</li>
              <li>Repeated or serious complaints from other users</li>
              <li>Failure to maintain valid insurance (painters)</li>
              <li>Where required by law or regulatory direction</li>
            </ul>
            <p>
              Where practical, PaintBookCo will give you notice of suspension and the reason for it, and an opportunity to respond, before taking action. In cases of serious breach, fraud, or where immediate action is necessary to protect other users or PaintBookCo's interests, we may act immediately without prior notice.
            </p>

            <h3 className="text-xl mt-6 mb-4">Effect of Termination</h3>
            <p>
              Upon account termination, your right to use the Platform ceases immediately. Any active job bookings must be resolved before termination is finalised — PaintBookCo will manage this process to protect the interests of the other party. Escrowed funds will be distributed in accordance with the circumstances of termination.
            </p>
          </section>

          {/* Section 17 */}
          <section>
            <h2>Reviews and Ratings</h2>
            <p>
              Reviews and ratings help maintain trust and quality on the Platform. Both customers and painters may be invited to submit a review following job completion.
            </p>
            <ul>
              <li>Reviews must be honest, specific to the job completed, and not defamatory or abusive.</li>
              <li>Painters may not solicit, incentivise, or pressure customers to leave positive reviews.</li>
              <li>Customers may not submit reviews as a form of leverage in a dispute.</li>
              <li>PaintBookCo may remove reviews that it reasonably believes are fake, misleading, or in breach of these Terms.</li>
              <li>Aggregate ratings displayed on painter profiles are calculated from verified, job-linked reviews only. PaintBookCo does not manipulate or artificially inflate ratings.</li>
            </ul>
          </section>

          {/* Section 18 */}
          <section>
            <h2>Data Protection</h2>
            <p>
              PaintBookCo processes your personal data in accordance with our Privacy Policy, which is available at <strong>paintbookco.co.uk/privacy</strong>. By using the Platform, you confirm that you have read and understood our Privacy Policy.
            </p>
            <p>
              Where you, as a painter, collect and process personal data about customers during the course of a job (for example, storing a customer's contact details or property address), you do so as an independent data controller in your own right. You are responsible for ensuring that your handling of such data complies with UK GDPR. PaintBookCo is not responsible for any data protection breaches by painters in respect of personal data collected outside the Platform.
            </p>
          </section>

          {/* Section 19 */}
          <section>
            <h2>Governing Law and Disputes</h2>

            <h3 className="text-xl mt-6 mb-4">Governing Law</h3>
            <p>
              These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes or claims) are governed by and construed in accordance with the laws of England and Wales.
            </p>

            <h3 className="text-xl mt-6 mb-4">Jurisdiction</h3>
            <p>
              You agree that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms or their subject matter, except where you are a consumer resident in Scotland, Northern Ireland, or Wales, in which case you may bring proceedings in your local courts.
            </p>

            <h3 className="text-xl mt-6 mb-4">Consumer ADR</h3>
            <p>
              If you are a consumer and have a complaint that has not been resolved to your satisfaction through our internal complaints process, you may have the right to use an Alternative Dispute Resolution (ADR) scheme. We will provide details of any applicable ADR scheme if relevant to your complaint.
            </p>
          </section>

          {/* Section 20 */}
          <section>
            <h2>General Provisions</h2>

            <h3 className="text-xl mt-6 mb-4">Entire Agreement</h3>
            <p>
              These Terms, together with the Privacy Policy and Cookie Policy, constitute the entire agreement between you and PaintBookCo in relation to your use of the Platform and supersede all prior agreements, representations, and understandings.
            </p>

            <h3 className="text-xl mt-6 mb-4">Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed if modification is not possible, without affecting the validity and enforceability of the remaining provisions.
            </p>

            <h3 className="text-xl mt-6 mb-4">No Waiver</h3>
            <p>
              PaintBookCo's failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-xl mt-6 mb-4">Assignment</h3>
            <p>
              You may not assign or transfer any of your rights or obligations under these Terms to any other person without our prior written consent. PaintBookCo may assign its rights and obligations under these Terms to any successor entity in the event of a merger, acquisition, or sale of substantially all of our assets.
            </p>

            <h3 className="text-xl mt-6 mb-4">Contact</h3>
            <p>For any questions about these Terms, please contact us at:</p>
            
            <div className="surface-card p-6 mt-4">
              <p><strong>The PaintBook Company Ltd</strong></p>
              <p>Company Number: 16690724</p>
              <p>Email: hello@paintbookco.co.uk</p>
              <p>Website: www.paintbookco.co.uk</p>
              <p>Registered address: 1, 1 Fenman Mews, Walkden, Manchester, UK. M28 3YU</p>
            </div>
          </section>

        </article>
      </div>
    </div>
  );
}
