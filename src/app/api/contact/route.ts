import { contactTable } from "@/db/schema";
import { sendFormNotificationEmails } from "@/lib/email/ses";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, location = "contact" } = await req.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, phone, and message are required." },
        { status: 400 }
      );
    }

    const [inserted] = await db
      .insert(contactTable)
      .values({ name, email, phone, location, message })
      .returning();

    await sendFormNotificationEmails({
      type: "contact",
      title: "Contact request received",
      userEmail: email,
      fields: { Name: name, Email: email, Phone: phone, Message: message },
    });

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully.",
      data: inserted,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
