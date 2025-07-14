export default function ReturnAndRefundPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Return & Refund Policy
        </h1>

        <p className="text-lg leading-relaxed">
          We want you to love what you purchase from us. If for any reason
          you're not satisfied, we're here to help. Please review our return and
          refund policy below.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Returns</h2>
          <p>
            You may return most new, unused items within{" "}
            <strong>7 days of delivery</strong> for a full refund or exchange,
            provided the item is in original condition with tags and packaging
            intact.
          </p>
          <p>
            Items that are damaged, worn, or altered may not be accepted and may
            be returned to the customer at their expense.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Non-returnable Items</h2>
          <p>The following items are not eligible for return:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Items marked as final sale</li>
            <li>Gift cards or vouchers</li>
            <li>Personalized or custom-made products</li>
            <li>Opened hygiene-related items</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Refunds</h2>
          <p>
            Once your return is received and inspected, we will notify you of
            the approval or rejection of your refund. If approved, the refund
            will be processed within
            <strong> 5–7 business days</strong> to your original payment method.
          </p>
          <p>
            In case of COD (Cash on Delivery) orders, refunds will be issued via
            UPI or bank transfer after confirmation.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Exchanges</h2>
          <p>
            We allow exchanges for size or defective items. To initiate an
            exchange, please contact us with your order ID and reason for
            exchange within 7 days of delivery.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Return Shipping</h2>
          <p>
            Customers are responsible for the return shipping cost unless the
            item received was damaged or incorrect. We recommend using a
            trackable shipping service.
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Contact Us</h2>
          <p>
            For any return or refund inquiries, please email us at{" "}
            <span className="font-medium">support@yourdomain.com</span> with
            your order number and concern. Our support team will assist you
            promptly.
          </p>
        </div>

        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 14, 2025
        </p>
      </section>
    </main>
  );
}
