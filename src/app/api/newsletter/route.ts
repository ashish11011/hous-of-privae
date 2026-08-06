import { subscriptionTable } from "@/db/schema";
import { sendFormNotificationEmails } from "@/lib/email/ses";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const [inserted] = await db.insert(subscriptionTable).values({ email }).returning();

    await sendFormNotificationEmails({
      type: "newsletter",
      title: "Newsletter signup received",
      userEmail: email,
      fields: { Email: email },
    });

    return NextResponse.json({
      success: true,
      message: "You're on the list. Check your inbox.",
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
