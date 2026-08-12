import { subscriptionTable } from "@/db/schema";
import {
  sendFormNotificationEmails,
  sendNewsletterWelcomeEmail,
} from "@/lib/email/ses";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !/.+@.+\..+/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const existing = await db.query.subscriptionTable.findFirst({
      where: eq(subscriptionTable.email, normalizedEmail),
    });

    const [inserted] = existing
      ? [existing]
      : await db
          .insert(subscriptionTable)
          .values({ email: normalizedEmail })
          .returning();

    try {
      await sendFormNotificationEmails({
        type: "newsletter",
        title: "Newsletter signup received",
        fields: { Email: normalizedEmail },
        adminSubject: "New newsletter subscriber - Haus of Privae",
      });

      if (!existing) {
        await sendNewsletterWelcomeEmail(normalizedEmail);
      }
    } catch (emailError) {
      console.error("Newsletter email delivery error:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: existing
        ? "You're already on the list."
        : "You're on the list. Check your inbox.",
      data: inserted,
    });
  } catch (error) {
    console.error("Newsletter submission error:", error);
    return NextResponse.json(
      { success: false, message: "Could not subscribe. Please try again." },
      { status: 500 }
    );
  }
}
