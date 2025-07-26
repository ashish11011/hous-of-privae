export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Privacy Policy
        </h1>

        <p className="text-lg leading-relaxed">
          At Haus of Privae, your privacy is important to us. This policy
          outlines how we collect, use, and protect your personal data when you
          browse our website or interact with our services. By using
          hausofprivae.com, you agree to the terms outlined below.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. What We Collect</h2>
          <p>
            We may collect personal information such as your name, email
            address, phone number, shipping address, and payment details when
            you make a purchase or contact us.
          </p>
          <p>
            We also collect non-personal data including browser type, device
            information, and browsing behavior using cookies and analytics tools
            to improve your shopping experience.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Fulfill your orders and deliver products</li>
            <li>Provide order updates and exclusive offers</li>
            <li>Enhance our website and customer support</li>
            <li>Maintain security and comply with legal obligations</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Data Sharing</h2>
          <p>
            Your personal data is never sold. We may share it with trusted
            third-party services for secure payments, order fulfillment, and
            site hosting—under strict confidentiality and security measures.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Keeping Your Data Safe</h2>
          <p>
            We prioritize your security through encrypted transactions, secure
            servers, and access controls. Our site uses SSL to ensure safe data
            transmission.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>
            You can request to access, modify, or delete your personal
            information anytime. To make a request, please reach out to us at{" "}
            <span className="font-medium">support@hausofprivae.com</span>.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Use of Cookies</h2>
          <p>
            We use cookies to offer you a smoother experience, personalize
            content, and analyze website traffic. You can control or disable
            cookies via your browser settings.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">7. Policy Updates</h2>
          <p>
            We may revise this Privacy Policy from time to time. Any updates
            will be reflected on this page with a new "Last Updated" date.
          </p>
        </div>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 26, 2025
        </p>
      </section>
    </main>
  );
}
