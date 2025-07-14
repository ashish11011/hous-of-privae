export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Terms & Conditions
        </h1>

        <p className="text-lg leading-relaxed">
          These Terms and Conditions ("Terms") govern your use of our website
          and services. By accessing or purchasing from our platform, you agree
          to be bound by these Terms.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. General</h2>
          <p>
            These Terms apply to all visitors, users, and others who access or
            use our website. We reserve the right to modify these Terms at any
            time without prior notice.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Eligibility</h2>
          <p>
            You must be at least 18 years old or have the consent of a legal
            guardian to use our services. By using the website, you confirm that
            you meet these requirements.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Orders & Payments</h2>
          <p>
            All orders are subject to availability and acceptance. We reserve
            the right to refuse or cancel any order for any reason. Payments
            must be made via the available methods.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Shipping & Returns</h2>
          <p>
            We aim to ship products within the estimated timeframe. Delays may
            occur due to external factors. Please refer to our Return & Exchange
            Policy for more information.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p>
            All content, trademarks, logos, and designs on this site are the
            property of the company and may not be used without express written
            permission.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
          <p>
            We are not liable for any indirect, incidental, or consequential
            damages arising from your use of the website or products.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">7. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be
            subject to the jurisdiction of the courts of Jaipur.
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p>
            If you have any questions regarding these Terms, please contact us
            {/* at <span className="font-medium">support@yourdomain.com</span>. */}
          </p>
        </div>

        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 14, 2025
        </p>
      </section>
    </main>
  );
}
