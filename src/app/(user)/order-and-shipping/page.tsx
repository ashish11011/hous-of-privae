import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Order & Shipping | Haus of Privae" },
  description:
    "Get all details about ordering and shipping with Haus of Privae. Luxury fashion delivered safely and efficiently to your doorstep.",
  alternates: { canonical: "https://www.hausofprivae.com/order-and-shipping" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Order & Shipping | Haus of Privae",
    description:
      "Learn about Haus of Privae’s ordering and shipping process. Premium garments delivered with care and attention.",
    url: "https://www.hausofprivae.com/order-and-shipping",
    siteName: "Haus of Privae",
    images: [
      {
        url: "https://ik.imagekit.io/hop/white-logo.png",
        width: 1200,
        height: 630,
        alt: "Haus of Privae Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Order & Shipping | Haus of Privae",
    description:
      "Discover Haus of Privae’s order and shipping policies for a seamless luxury shopping experience.",
    images: ["https://ik.imagekit.io/hop/white-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function ShippingAndDeliveryPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Shipping & Delivery Policy
        </h1>

        {/* Ready-to-Ship Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Ready-to-Ship Products</h2>
          <p>
            Products available in standard sizes without alterations or
            customizations.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Processing & Dispatch:</strong> 3–7 business days from the
              date of purchase.
            </li>
            <li>
              <strong>Delivery (India):</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Metro Cities: 2–5 business days post-dispatch</li>
                <li>Other Cities & Towns: 5–7 business days post-dispatch</li>
              </ul>
            </li>
            <li>
              <strong>International Shipping:</strong> Dispatched within 7
              business days. Timelines vary based on location and customs.
            </li>
          </ul>
        </div>

        {/* Altered Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. Altered Products (Customized Fit)
          </h2>
          <p>
            Minor alterations such as sleeve length, hemline, or waist
            adjustments.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Dispatch (India):</strong> Within 10 business days
              depending on the adjustment.
            </li>
            <li>
              <strong>Delivery (India):</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Metro Cities: 2–5 business days post-dispatch</li>
                <li>Other Cities: 5–7 business days post-dispatch</li>
              </ul>
            </li>
            <li>
              <strong>Note:</strong> Alterations are not available for
              international orders.
            </li>
          </ul>
        </div>

        {/* Customized / Bespoke Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. Customized / Bespoke Products
          </h2>
          <p>
            Made-to-order designs based on your measurements, colors, and
            embellishment preferences.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Dispatch:</strong> Typically within 30–45 business days,
              depending on design complexity.
            </li>
            <li>
              <strong>Delivery (India):</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Metro Cities: 2–5 business days post-dispatch</li>
                <li>Other Cities: 5–7 business days post-dispatch</li>
              </ul>
            </li>
            <li>
              <strong>International Orders:</strong> Customization is available;
              timelines discussed post-order.
            </li>
          </ul>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Important Notes</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Timelines are estimated and may vary during festivals or courier
              delays.
            </li>
            <li>
              You’ll receive tracking information via email or WhatsApp once
              shipped.
            </li>
            <li>
              Items in the same order may ship together or separately based on
              availability.
            </li>
          </ul>
        </div>

        {/* Shipping Charges */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Shipping Charges</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>India:</strong> Free shipping on orders above ₹15,000.
              Nominal fee for orders below.
            </li>
            <li>
              <strong>International:</strong> Charges calculated at checkout
              based on weight and location.
            </li>
          </ul>
        </div>

        {/* Customs & Duties */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            6. Customs & Duties (International Orders)
          </h2>
          <p>
            Customers are responsible for import duties, taxes, and customs
            fees. Haus of Privaé is not liable for customs-related delays.
          </p>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            7. Delivery Support & Urgent Queries
          </h2>
          <p>For any shipping-related queries, reach us at:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:orders@hausofprivae.com"
                className="text-blue-600 underline"
              >
                orders@hausofprivae.com
              </a>
            </li>
            <li>
              <strong>Phone:</strong> +91-XXXXXXXXXX (Mon–Sat, 10 AM–6 PM IST)
            </li>
            <li>
              For urgent help, message us on WhatsApp with your order number.
            </li>
          </ul>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            8. Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Q1:</strong> Can I expedite the shipping for a ready
              product?
            </p>
            <p>
              <em>Yes.</em> Contact us before placing the order to check
              availability for expedited domestic shipping.
            </p>

            <p>
              <strong>Q2:</strong> Are alterations available for international
              orders?
            </p>
            <p>
              <em>No.</em> International orders are shipped in standard sizes
              only.
            </p>

            <p>
              <strong>Q3:</strong> Can I request customization for international
              orders?
            </p>
            <p>
              <em>Yes.</em> Bespoke customization is available. Timelines are
              confirmed post-order.
            </p>

            <p>
              <strong>Q4:</strong> How will I know when my order is shipped?
            </p>
            <p>
              You’ll get tracking details via email and WhatsApp after dispatch.
            </p>

            <p>
              <strong>Q5:</strong> What happens if my order is delayed?
            </p>
            <p>
              In rare cases of delays, our team will proactively inform you of
              revised timelines.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: October 23, 2025
        </p>
      </section>
    </main>
  );
}
