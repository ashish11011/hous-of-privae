"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "What is Haus of Privae?",
    answer: "Haus of Privae is a luxury clothing label from Jaipur. Our ready-to-wear and custom pieces pair artisanal detailing with contemporary design.",
  },
  {
    question: "How do I find my correct size?",
    answer: "Compare your measurements with the size guide on the product page. If you’re between sizes or would like help, contact the atelier before ordering.",
  },
  {
    question: "Can I commission a fully bespoke piece?",
    answer: "Yes. Our atelier can work with you on a custom design, from measurements and fabric to embroidery and finishing. Send us a message to discuss your commission.",
  },
  {
    question: "What is Privae Fit?",
    answer: "Privae Fit is our made-to-measure service. The atelier uses your measurements to tailor the piece to your fit.",
  },
  {
    question: "Are your pieces sustainably made?",
    answer: "We use ethically sourced materials, promote mindful production practices, and work with skilled artisans to create pieces designed for lasting wear.",
  },
  {
    question: "How long will my order take to arrive?",
    answer: "Stitched pieces dispatch within 10–12 business days in India and 12–15 business days internationally after payment confirmation. Custom pieces typically take 3–4 weeks to craft. We share an estimated delivery date by email after dispatch.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. International orders are insured and tracked. Shipping is calculated at checkout, and the recipient is responsible for customs duties and import fees.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Online orders are paid securely through Razorpay. The payment window shows the methods available for your order.",
  },
  {
    question: "Can I return or exchange my order?",
    answer: "Ready-to-ship pieces delivered in India are eligible for returns and size exchanges within 5 days of delivery. Pieces must be unworn and unwashed, with all tags attached, original packaging and invoice intact. Size exchanges are subject to availability. Custom pieces and international orders are non-returnable and non-exchangeable.",
  },
  {
    question: "How should I care for my Privae piece?",
    answer: "Follow the care instructions on the product page. Dry cleaning or gentle handwashing may be recommended depending on the garment.",
  },
  {
    question: "Do you offer gift cards?",
    answer: "Yes. The Privae Experience Card is available from the gifting page and can be redeemed at checkout.",
  },
  {
    question: "What is Privae Circle?",
    answer: "Privae Circle is our loyalty programme. Members can earn points on eligible purchases and redeem available points at checkout.",
  },
  {
    question: "Can I visit your atelier in person?",
    answer: "Yes. Our Jaipur atelier welcomes visitors by appointment for personal styling and consultations. Contact us to arrange a visit.",
  },
];

export default function FaqSection() {
  return (
    <section aria-labelledby="contact-faq-heading" className="bg-[#e8e1d7] px-5 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-9 text-center">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#855b1d]">We’re here to help</p>
          <h2 id="contact-faq-heading" className="heading-rule font-heading text-3xl md:text-5xl">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map(({ question, answer }) => (
            <AccordionItem key={question} value={question} className="border-0 bg-[#f7f4ef]">
              <AccordionTrigger className="rounded-none px-5 py-4 font-heading text-lg font-normal leading-tight sm:px-6">
                {question}
              </AccordionTrigger>
              <AccordionContent className="px-5 leading-relaxed text-muted-foreground sm:px-6">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
