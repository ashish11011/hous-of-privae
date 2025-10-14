"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    category: "About Us",
    question: "What is Haus of Privae?",
    answer: `Haus of Privae is a modern luxury label offering a curated range of ready-to-wear 
    and custom-made garments. Each creation embodies quiet sophistication - merging artisanal 
    detailing with contemporary design to celebrate individuality and refined femininity.`,
  },
  {
    category: "Sustainability",
    question: "Are your pieces sustainably made?",
    answer: `Yes. Sustainability is an integral part of our design philosophy. We use ethically 
    sourced materials, promote mindful production practices, and collaborate with skilled artisans 
    to ensure every piece is made responsibly and with lasting quality.`,
  },
  {
    category: "Orders & Customization",
    question: "Can I customize a design?",
    answer: `Absolutely. We offer customization and bespoke tailoring to help you create a piece 
    that reflects your personal style. Once your order is placed, our design team will connect with 
    you to discuss measurements, fabrics, and design preferences.`,
  },
  {
    category: "Delivery Timelines",
    question: "How long will my order take to arrive?",
    answer: `• Ready-to-wear: Dispatched within 10 business days across India. 
    • Customized orders: Timelines vary depending on the design and craftsmanship. 
    • International Orders: Shipping times depend on your destination and customs clearance.`,
  },
  {
    category: "Shipping",
    question: "Do you ship internationally?",
    answer: `Yes, Haus of Privae ships globally. International shipping charges and delivery 
    times are displayed at checkout. Tracking details will be shared once your order is dispatched.`,
  },
  {
    category: "Returns & Alterations",
    question: "Can I return or exchange my order?",
    answer: `• Ready-to-wear: Eligible for return or exchange within 7 days of delivery, if unworn and 
    in original packaging. 
    • Customized products: Not eligible for returns, but complimentary alterations are available.`,
  },
  {
    category: "Garment Care",
    question: "How should I care for my Haus of Privae garment?",
    answer: `Each piece includes specific care instructions on its product page. We recommend 
    dry cleaning or gentle handwashing to preserve craftsmanship and longevity.`,
  },
  {
    category: "Payments & Pricing",
    question: "What payment options are available?",
    answer: `We accept all major credit/debit cards, UPI, and net banking. For international 
    customers, payments can be made through secure international gateways available at checkout.`,
  },
  {
    category: "Customer Experience",
    question: "Can I visit Haus of Privae in person?",
    answer: `Yes, you can visit our Jaipur studio for personalized styling sessions and 
    one-on-one consultations. Schedule an appointment via our Contact Us page.`,
  },
  {
    category: "Stay Connected",
    question: "How can I stay updated about new launches and collections?",
    answer: `Follow us on Instagram for updates, or subscribe to our newsletter to receive 
    exclusive previews, style stories, and collection updates directly in your inbox.`,
  },
  {
    category: "Packaging & Gifting",
    question: "Do you offer gift packaging or notes?",
    answer: `Yes. Every order is beautifully wrapped in our signature Haus of Privae packaging. 
    You can also include a personalized note for gifting during checkout.`,
  },
  {
    category: "Product Availability",
    question: "Do you restock sold-out pieces?",
    answer: `Our collections are produced in limited quantities to maintain exclusivity. 
    Restocks are rare, but you can contact our team to inquire about custom recreations 
    of select designs.`,
  },
  {
    category: "Contact & Support",
    question: "How can I reach Haus of Privae?",
    answer: `You can reach us via the Contact Us page or email us at 
    info@hausofprivae.com. Our client relations team will assist with customization, sizing, 
    or order queries.`,
  },
];

export default function FaqSection() {
  return (
    <section className="max-w-4xl mx-auto mt-20 mb-10 px-4">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Frequently Asked Questions — Haus of Privae
      </h2>

      <p className="text-center text-gray-600 mb-10">
        Welcome to Haus of Privae, a luxury clothing label where timeless
        craftsmanship meets contemporary elegance. We’ve answered a few common
        questions to help guide your shopping experience.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              {faq.answer.includes("•") ? (
                <ul className="list-disc ml-5 space-y-1 text-gray-700">
                  {faq.answer
                    .split("•")
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-700">{faq.answer}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
