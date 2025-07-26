export default function ShippingAndDeliveryPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Shipping & Delivery Policy
        </h1>

        {/* Shipping Partners */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Our Shipping Partners</h2>
          <p>
            At Haus of Privae, we work with trusted logistics partners like{" "}
            <strong>Blue Dart</strong> and <strong>Delhivery</strong> to ensure
            your order reaches you safely and on time. All shipments are fully
            insured until delivered.
          </p>
        </div>

        {/* Delivery Attempts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. Delivery Attempts & Communication
          </h2>
          <p>
            For <strong>Cash on Delivery (COD)</strong> orders, our delivery
            partner may reach out to confirm your availability. If you're
            unavailable during the first attempt, you can:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Request a new delivery time</li>
            <li>
              Arrange to collect your package from the nearest courier facility
            </li>
          </ul>
        </div>

        {/* Shipping Timelines */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. Estimated Delivery Timelines
          </h2>
          <p>
            Orders are typically shipped within{" "}
            <strong>3 to 7 business days</strong> from the date of confirmation.
            Delivery timelines may vary based on location, pincode, and external
            factors.
          </p>
        </div>

        {/* Delays & Responsibility */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Delays & Limitations</h2>
          <p>
            While we strive to meet expected timelines, delays may occur due to
            weather, high volumes, or courier-related issues. Haus of Privae is
            not liable for such delays once the order has been dispatched.
          </p>
          <p>
            If the delivery attempt fails due to incorrect address or
            unavailability, the courier may reschedule or hold the package at a
            nearby hub for pickup.
          </p>
        </div>

        {/* Order Tracking */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Tracking Your Order</h2>
          <p>
            Once your order is shipped, you’ll receive an email or SMS with the
            tracking details. You can track your shipment via the link shared or
            by visiting the courier partner’s official website.
          </p>
        </div>

        {/* Customer Support */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Need Help?</h2>
          <p>
            If you have any concerns or need assistance regarding your shipment,
            feel free to reach out to our team at{" "}
            <span className="font-medium">support@hausofprivae.com</span>. We're
            here to help!
          </p>
        </div>

        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 26, 2025
        </p>
      </section>
    </main>
  );
}
