export type LegalPageSlug = "shipping" | "returns" | "privacy" | "terms";

export type LegalPageContent = {
  slug: LegalPageSlug;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  bodyHtml: string;
};

export const legalPages: Record<LegalPageSlug, LegalPageContent> = {
  shipping: {
    slug: "shipping",
    title: "Shipping & Delivery",
    subtitle: "Crafted with care · Delivered with intention",
    eyebrow: "Our promise",
    description:
      "Complimentary shipping across India. Worldwide insured delivery. Crafted with care, delivered with intention.",
    bodyHtml: `<h2>Order Processing</h2>
<p>Each Haus of Privae piece is finished by hand at our atelier. Standard ready-to-ship pieces are dispatched within <strong>5–7 business days</strong> for domestic orders and <strong>7–10 business days</strong> for international orders. Custom, bespoke and Privae Fit pieces are crafted over <strong>3–4 weeks</strong>, with the exact timeline confirmed after consultation.</p>

<h2>Domestic Shipping (India)</h2>
<ul>
<li>Complimentary shipping on every order — no minimum spend.</li>
<li>Standard fits dispatched within <strong>5–7 business days</strong>.</li>
<li>Custom orders dispatched within <strong>3–4 weeks</strong>.</li>
<li>Estimated delivery date shared via email once your order is shipped.</li>
<li>Insured, signature-on-delivery courier with live tracking from dispatch.</li>
</ul>

<h2>International Shipping</h2>
<ul>
<li>Worldwide delivery, insured and fully tracked.</li>
<li>Standard fits dispatched within <strong>7–10 business days</strong>.</li>
<li>Custom orders dispatched within <strong>3–4 weeks</strong>.</li>
<li>Estimated delivery date shared via email once your order is shipped.</li>
<li>International shipping is calculated at checkout based on your delivery address and prevailing courier rates.</li>
<li>Customs duties, taxes and import fees are borne by the recipient.</li>
<li><strong>International orders are non-returnable and non-exchangeable.</strong></li>
</ul>

<h2>Order Tracking & Support</h2>
<p>For any shipping or delivery query, write to us at <a href="mailto:queries.hausofprivae@gmail.com">queries.hausofprivae@gmail.com</a> or reach our atelier on WhatsApp at <a href="https://wa.me/917023117408" target="_blank" rel="noopener">+91 7023117408</a>.</p>`,
  },
  returns: {
    slug: "returns",
    title: "Returns & Exchange",
    subtitle: "Considered craftsmanship · Considered policy",
    eyebrow: "Our promise",
    description:
      "7-day return window for ready-to-ship pieces in India. Considered craftsmanship, considered policy.",
    bodyHtml: `<h2>What is Eligible</h2>
<ul>
<li>Returns are accepted within <strong>7 days of delivery</strong> for ready-to-ship pieces.</li>
<li>Items must be unworn, unwashed and returned with original tags, packaging and invoice intact.</li>
<li>Size exchanges are honoured within 7 days, subject to availability of the requested size.</li>
<li>In the rare event of a manufacturing defect or damage in transit, we will replace the piece or issue a full refund.</li>
</ul>

<h2>What is Not Eligible</h2>
<ul>
<li>Custom, bespoke and made-to-measure pieces are non-returnable and non-exchangeable.</li>
<li>Privae Fit (custom-measured) orders, alterations and bespoke colourways.</li>
<li>Sale, archive and final-edit pieces, unless damaged on arrival.</li>
<li>Items returned without original tags, packaging or beyond the 7-day window.</li>
<li><strong>All international orders</strong> — these are non-returnable and non-exchangeable. Please review size and details carefully before placing your order.</li>
</ul>

<h2>How to Initiate a Return or Exchange</h2>
<ol>
<li>Write to us at <a href="mailto:queries.hausofprivae@gmail.com">queries.hausofprivae@gmail.com</a> within 7 days of delivery, with your order number and reason.</li>
<li>Our team will arrange a reverse pickup from your address, wherever serviceable.</li>
<li>Once received and inspected, refunds are processed to the original payment method within 7–10 business days.</li>
<li>For exchanges, the new piece is dispatched once the original is received and inspected.</li>
</ol>

<h2>A Note from Our Atelier</h2>
<p>Slight variations in colour, hand-embroidery and weave are characteristic of artisanal craftsmanship and are not considered defects. Each piece is a celebration of the maker's hand.</p>

<h2>Need Help?</h2>
<p>Reach out on WhatsApp at <a href="https://wa.me/917023117408" target="_blank" rel="noopener">+91 7023117408</a> or email <a href="mailto:queries.hausofprivae@gmail.com">queries.hausofprivae@gmail.com</a> — we typically respond within a few hours.</p>`,
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "How we hold your details with care",
    eyebrow: "Confidence assured",
    description:
      "How Haus of Privae collects, uses and protects your personal information.",
    bodyHtml: `<p><em>Last updated: April 2026</em></p>

<h2>Who We Are</h2>
<p>Haus of Privae ("we", "our", "us") respects your privacy and is committed to protecting the personal information you share with us. This policy explains what we collect, why, and the choices you have.</p>

<h2>Information We Collect</h2>
<ul>
<li><strong>Account & order details:</strong> name, email, phone, shipping address, body measurements (if you opt to save them).</li>
<li><strong>Payment data:</strong> processed securely by our payment partners — we do not store your card details.</li>
<li><strong>Browsing data:</strong> pages viewed, items wishlisted, device and cookie information used to improve your experience.</li>
<li><strong>Communications:</strong> messages, appointment notes and bespoke briefs you share with our atelier.</li>
</ul>

<h2>How We Use It</h2>
<ul>
<li>To fulfil and ship your orders, schedule appointments, and craft bespoke pieces.</li>
<li>To send transactional updates (order confirmations, shipping, appointment reminders).</li>
<li>To send editorial newsletters, only if you have opted in — you may unsubscribe at any time.</li>
<li>To improve our website, service and product range.</li>
<li>To meet our legal and accounting obligations.</li>
</ul>

<h2>Sharing</h2>
<p>We share data only with trusted partners required to deliver your order — couriers, payment processors, email providers and our atelier team. We never sell your personal information.</p>

<h2>Your Rights</h2>
<p>You may request access to, correction or deletion of your personal data at any time by writing to <a href="mailto:queries.hausofprivae@gmail.com">queries.hausofprivae@gmail.com</a>. We will respond within 30 days.</p>

<h2>Cookies</h2>
<p>We use essential cookies to keep your cart, wishlist and session active. Optional analytics cookies help us understand how the site is used. You may disable non-essential cookies through your browser settings.</p>

<h2>Contact</h2>
<p>For any privacy query, reach us at <a href="mailto:queries.hausofprivae@gmail.com">queries.hausofprivae@gmail.com</a> or on WhatsApp at <a href="https://wa.me/917023117408" target="_blank" rel="noopener">+91 7023117408</a>.</p>`,
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    subtitle: "The understanding between us",
    eyebrow: "Considered conduct",
    description:
      "The terms governing your use of hausofprivae.com and our products.",
    bodyHtml: `<p><em>Last updated: April 2026</em></p>

<h2>Acceptance</h2>
<p>By browsing, registering on, or purchasing from hausofprivae.com you agree to these Terms & Conditions. If you do not accept them, please do not use the website.</p>

<h2>Products & Pricing</h2>
<ul>
<li>All pieces are crafted by hand; slight variations in colour, embroidery and finish are characteristic and celebrated.</li>
<li>Prices are listed in INR and are inclusive of applicable taxes for Indian deliveries unless stated otherwise.</li>
<li>International prices exclude duties, customs and import fees, which are borne by the recipient.</li>
<li>We reserve the right to amend pricing, availability and product details without notice.</li>
</ul>

<h2>Orders & Payment</h2>
<ul>
<li>An order is confirmed only upon successful payment and our written acknowledgement.</li>
<li>We reserve the right to refuse or cancel any order, with full refund, in case of suspected fraud, pricing errors or stock unavailability.</li>
<li>Bespoke and Privae Fit orders require a brief consultation; production begins after design approval.</li>
</ul>

<h2>Shipping, Returns & Exchange</h2>
<p>Please refer to our <a href="/shipping">Shipping & Delivery</a> and <a href="/returns">Returns & Exchange</a> pages for complete timelines, eligibility and process.</p>

<h2>Intellectual Property</h2>
<p>All content on this website — including imagery, designs, illustrations, logos and copy — is the property of Haus of Privae and may not be reproduced, distributed or used commercially without prior written consent.</p>

<h2>User Conduct</h2>
<p>You agree not to misuse the website, attempt to gain unauthorised access, upload malicious code, or use it for any unlawful purpose.</p>

<h2>Limitation of Liability</h2>
<p>To the fullest extent permitted by law, Haus of Privae shall not be liable for any indirect, incidental or consequential losses arising from the use of the website or our products.</p>

<h2>Governing Law</h2>
<p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts at Jaipur, Rajasthan.</p>

<h2>Contact</h2>
<p>For any query, write to <a href="mailto:queries.hausofprivae@gmail.com">queries.hausofprivae@gmail.com</a> or WhatsApp <a href="https://wa.me/917023117408" target="_blank" rel="noopener">+91 7023117408</a>.</p>`,
  },
};
