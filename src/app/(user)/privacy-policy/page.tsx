export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Privacy Policy
        </h1>

        <p className="text-lg leading-relaxed">
          This Privacy Policy outlines how we collect, use, and safeguard your
          personal information when you visit our website or engage with our
          services. By using our site, you agree to the terms of this policy.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We may collect personal data such as your name, email address, phone
            number, shipping address, and payment details when you place an
            order or contact us.
          </p>
          <p>
            We also gather non-personal data such as browser type, device
            information, and interaction data through cookies and analytics
            tools.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p>Your information is used to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Communicate order status and offers</li>
            <li>Improve our website and customer experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Sharing of Data</h2>
          <p>
            We do not sell or rent your personal data. We may share it with
            trusted third-party service providers to fulfill orders, manage
            payments, or host our website — all under strict confidentiality
            agreements.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your data,
            including SSL encryption, secure payment gateways, and limited
            access controls.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal
            information. To do so, please contact us at{" "}
            <span className="font-medium">support@yourdomain.com</span>.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Cookies</h2>
          <p>
            We use cookies to enhance your experience, analyze site traffic, and
            offer personalized content. You can control cookie preferences
            through your browser settings.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">7. Updates to this Policy</h2>
          <p>
            We may update this Privacy Policy occasionally. Changes will be
            posted on this page with a revised effective date.
          </p>
        </div>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 14, 2025
        </p>
      </section>
    </main>
  );
}
