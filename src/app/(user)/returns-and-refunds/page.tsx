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
          Return, Exchange & Refund Policy
        </h1>

        {/* Ready-to-Ship Returns & Exchanges */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Ready-to-Ship Products</h2>
          <p>
            Returns and exchanges are applicable only for ready-made garments,
            not custom pieces.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Request must be raised within <strong>7 days</strong> of receiving
              the item.
            </li>
            <li>
              Item must be <strong>unused, unwashed, unaltered</strong>, and
              returned in original packaging with all tags intact.
            </li>
            <li>
              <strong>Options:</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Exchange:</strong> For a different size, color, or
                  style (subject to availability).
                </li>
                <li>
                  <strong>Store Credit:</strong> Valid for 6 months from issue
                  date.
                </li>
                <li>
                  <strong>Refund:</strong> To original payment source within
                  7–10 business days after inspection.
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* COD Orders */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. Cash on Delivery (COD) Orders — Within India
          </h2>
          <p>
            COD is <strong>not available</strong> for online orders placed via
            our website. For customers in Jaipur, direct coordination is
            possible for COD orders.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Refunds for Jaipur COD orders will be processed to your bank
              account after the return is received and approved.
            </li>
            <li>
              Bank details must be securely shared with our team via WhatsApp
              for processing.
            </li>
          </ul>
        </div>

        {/* International Orders */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. International Orders</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>COD is not available for international shipments.</li>
            <li>
              Refunds will be processed in INR as per the prevailing exchange
              rate at the time of transaction.
            </li>
            <li>
              Any conversion charges or international bank fees are borne by the
              customer.
            </li>
            <li>
              Returns/exchanges are <strong>not accepted</strong> unless the
              item is damaged or defective — subject to prior approval.
            </li>
          </ul>
        </div>

        {/* Customized & Made-to-Order Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            4. Customized, Altered & Made-to-Order Products
          </h2>
          <p>
            These include bespoke garments, made-to-measure pieces, or items
            with any customization or alteration.
          </p>
          <p className="font-medium text-red-600">
            No returns, exchanges, or refunds are available for these items due
            to their personalized nature.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Fit Adjustments:</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Jaipur clients:</strong> Free in-person alterations at
                  our studio.
                </li>
                <li>
                  <strong>Outside Jaipur (India only):</strong> Ship the product
                  to us at your own cost for alterations.
                </li>
                <li>
                  Return and re-delivery shipping costs are to be borne by the
                  customer.
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Return Process */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            5. How to Initiate a Return or Exchange
          </h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <strong>Contact Us:</strong> Within 7 days of delivery via
              WhatsApp or email at{" "}
              <a
                href="mailto:orders@hausofprivae.com"
                className="text-blue-600 underline"
              >
                orders@hausofprivae.com
              </a>{" "}
              with your order number and concern.
            </li>
            <li>
              <strong>Receive Instructions:</strong> Our team will approve the
              request and share the return address and steps.
            </li>
            <li>
              <strong>Product Check:</strong> Once received, the product
              undergoes a quality inspection.
            </li>
            <li>
              <strong>Refund/Exchange:</strong> Based on your selected option,
              we'll process your request after the item passes inspection.
            </li>
          </ol>
        </div>

        {/* Conditions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Important Conditions</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Items showing signs of wear, damage, or alterations will not be
              accepted.
            </li>
            <li>
              Sale, discounted, and sample products are not eligible for return,
              exchange, or refund.
            </li>
            <li>
              We reserve the right to deny returns that don’t meet our policy
              requirements.
            </li>
            <li>Refunds are processed only after inspection and approval.</li>
          </ul>
        </div>

        {/* Damaged Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            7. Damaged or Defective Items
          </h2>
          <p>If you receive a damaged or defective product, please:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Notify us within <strong>48 hours</strong> via WhatsApp or email.
            </li>
            <li>Share clear images of the item and packaging.</li>
            <li>
              After verification, we will offer a{" "}
              <strong>replacement, repair, or refund</strong> based on
              availability and our discretion.
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">8. Contact & Support</h2>
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
              <strong>WhatsApp:</strong> For urgent support, message us with
              your order number.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 pt-6 text-center">
          Last updated: October 23, 2025
        </p>
      </section>
    </main>
  );
}
