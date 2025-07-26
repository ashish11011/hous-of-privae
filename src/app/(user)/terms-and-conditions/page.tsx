export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Terms & Conditions
        </h1>

        <p className="text-lg leading-relaxed">
          Welcome to hausofprivae.com. These Terms & Conditions ("Terms") govern
          your use of our website and services. By browsing, purchasing, or
          interacting with our platform, you agree to abide by these Terms in
          full.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Overview</h2>
          <p>
            These Terms apply to all users, visitors, and customers of Haus of
            Privae. We reserve the right to update or modify these Terms at any
            time without prior notice. Continued use of the site constitutes
            acceptance of any changes.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Eligibility</h2>
          <p>
            You must be 18 years or older to use our services, or have consent
            from a parent or legal guardian. By accessing our website, you
            confirm that you meet this requirement.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Orders & Payments</h2>
          <p>
            All product orders are subject to availability and confirmation. We
            reserve the right to refuse or cancel any order at our sole
            discretion. Payments must be made using the methods provided on our
            website.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Shipping & Returns</h2>
          <p>
            We strive to deliver your orders within the estimated timeframe.
            However, shipping delays may occur due to unforeseen circumstances.
            Please refer to our <strong>Shipping & Returns</strong> policy for
            full details.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p>
            All content, images, logos, and design elements on hausofprivae.com
            are the intellectual property of Haus of Privae. Reproduction,
            duplication, or commercial use is strictly prohibited without
            written consent.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
          <p>
            Haus of Privae shall not be held liable for any indirect,
            incidental, or consequential damages arising out of your use of the
            website, products, or services offered.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">7. Governing Law</h2>
          <p>
            These Terms are governed in accordance with the laws of India. All
            disputes shall be subject to the exclusive jurisdiction of the
            courts in Jaipur, Rajasthan.
          </p>
        </div>

        {/* Section 8 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>
            For any questions or concerns related to these Terms & Conditions,
            feel free to reach out to us at{" "}
            <span className="font-medium">support@hausofprivae.com</span>.
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
