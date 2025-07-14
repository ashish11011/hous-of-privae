export default function ShippingAndDeliveryPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Shipping & Delivery Policy
        </h1>

        {/* Shipping Process */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Shipping Partners</h2>
          <p>
            We use trusted and reliable courier services such as{" "}
            <strong>Blue Dart</strong> and <strong>Delhivery</strong> to ship
            all orders. Each shipment is fully insured to ensure safe and secure
            delivery.
          </p>
        </div>

        {/* Delivery Experience */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Delivery Attempts</h2>
          <p>
            For <strong>Cash on Delivery (COD)</strong> orders, the delivery
            agent may contact you before attempting delivery. If you are
            unavailable at the time, you can call them back using the provided
            contact to:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Reschedule a new delivery date</li>
            <li>Arrange a pickup from the courier's local hub</li>
          </ul>
        </div>

        {/* Delivery Time */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Shipping TAT</h2>
          <p>
            Orders are generally shipped within{" "}
            <strong>3 to 7 business days</strong> from the date of order
            confirmation. Delivery times may vary based on your location.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Delays & Liability</h2>
          <p>
            We are not responsible for any delays caused by unforeseen
            circumstances such as weather conditions, operational delays by
            courier partners, or incorrect delivery information provided by the
            customer.
          </p>
          <p>
            In case the customer is not available at the delivery address, the
            courier company may attempt redelivery or hold the package at their
            facility for self-pickup.
          </p>
        </div>

        {/* Tracking */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Tracking Your Order</h2>
          <p>
            Once your order is shipped, you will receive an email or SMS with
            the tracking information. You can track your shipment using the link
            provided or on the courier company’s official website.
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Questions or Issues?</h2>
          <p>
            For any shipping-related questions or assistance, feel free to
            contact our support team at{" "}
            <span className="font-medium">support@yourdomain.com</span>.
          </p>
        </div>

        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 14, 2025
        </p>
      </section>
    </main>
  );
}
