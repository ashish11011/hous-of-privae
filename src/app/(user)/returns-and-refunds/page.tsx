import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Returns & Refunds | Haus of Privae" },
  description:
    "Learn about Haus of Privae's returns and refunds policy. We ensure a smooth, transparent process to provide you with confidence in your luxury purchases.",
  alternates: { canonical: "https://www.hausofprivae.com/returns-and-refunds" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Returns & Refunds | Haus of Privae",
    description:
      "Read Haus of Privae’s returns and refunds policy. Luxury shopping with clarity, convenience, and customer satisfaction guaranteed.",
    url: "https://www.hausofprivae.com/returns-and-refunds",
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
    title: "Returns & Refunds | Haus of Privae",
    description:
      "Understand Haus of Privae’s returns and refunds process for a smooth and transparent shopping experience.",
    images: ["https://ik.imagekit.io/hop/white-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function ReturnAndRefundPage() {
  return (
    <main className="bg-white px-6 py-20 md:px-12 lg:px-32 text-neutral-800">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Return & Refund Policy
        </h1>

        <p className="text-lg leading-relaxed">
          At Haus of Privae, your satisfaction is at the heart of everything we
          do. If something isn't quite right, we're here to make it right.
          Please read our return and refund policy carefully before initiating a
          return or exchange.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Return Eligibility</h2>
          <p>
            You may request a return within <strong>7 days of delivery</strong>
            for most unused items in their original condition, including all
            tags and packaging.
          </p>
          <p>
            Items that show signs of wear, damage, stains, or alterations may be
            rejected and sent back at your expense.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Non-returnable Items</h2>
          <p>
            For hygiene and customization reasons, we cannot accept returns on:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Items marked as "Final Sale"</li>
            <li>Gift cards or vouchers</li>
            <li>Customized or made-to-order products</li>
            <li>Hygiene-related items that have been opened</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Refund Process</h2>
          <p>
            Once we receive and inspect your return, we’ll notify you of the
            approval or rejection. Approved refunds will be processed within{" "}
            <strong>5–7 business days</strong> to your original payment method.
          </p>
          <p>
            For COD orders, refunds are issued via UPI or bank transfer after
            confirmation of account details.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Exchanges</h2>
          <p>
            We’re happy to exchange items for size or defect issues. To request
            an exchange, contact us with your order ID and reason within{" "}
            <strong>7 days of delivery</strong>. We’ll do our best to get you
            the perfect fit!
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Return Shipping</h2>
          <p>
            Return shipping is the responsibility of the customer unless the
            item received was incorrect or damaged. We recommend using a
            reliable, trackable courier service to avoid issues.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Need Help?</h2>
          <p>
            Our support team is here to assist you. For return or refund
            queries, please email us at{" "}
            <span className="font-medium">support@hausofprivae.com</span> with
            your order number and concern.
          </p>
        </div>

        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: July 26, 2025
        </p>
      </section>
    </main>
  );
}
