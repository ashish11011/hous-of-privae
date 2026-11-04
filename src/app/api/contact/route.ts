import { contactTable } from "@/db/schema";
import { sendFormNotificationEmails } from "@/lib/email/ses";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).default(""),
  subject: z.string().trim().max(160).default(""),
  message: z.string().trim().min(1).max(5000),
  location: z.string().trim().max(120).default("contact"),
});

export async function POST(req: Request) {
  const input = contactSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { success: false, message: "Enter your name, a valid email, and a message within the field limits." },
      { status: 400 },
    );
  }

  const { name, email, phone, subject, message, location } = input.data;

  try {
    const [inserted] = await db
      .insert(contactTable)
      .values({ name, email, phone, location, message: subject ? `Subject: ${subject}\n\n${message}` : message })
      .returning();

    try {
      await sendFormNotificationEmails({
        requireDelivery: true,
        type: "contact",
        title: "Contact request received",
        userEmail: email,
        fields: { Name: name, Email: email, Phone: phone, Subject: subject, Message: message },
      });
    } catch (error) {
      // The request is already saved for the atelier. A retry from the form would duplicate it.
      console.error("Contact notification failed for saved request", inserted.id, error);
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully.",
      data: inserted,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send your message. Please try again." },
      { status: 500 },
    );
  }
}
