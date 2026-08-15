import { sendFormNotificationEmails } from "@/lib/email/ses";
import { NextResponse } from "next/server";
import { z } from "zod";

const bespokeSchema = z.object({
  garmentType: z.string().trim().min(1, "Choose a garment type"),
  occasion: z.string().trim().max(80).optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  budgetRange: z.string().trim().max(60).optional().or(z.literal("")),
  fabricPreference: z.string().trim().max(120).optional().or(z.literal("")),
  colorPreference: z.string().trim().max(120).optional().or(z.literal("")),
  inspirationNotes: z
    .string()
    .trim()
    .min(20, "Tell us a little more - at least 20 characters")
    .max(2000, "Please keep under 2000 characters"),
  fullName: z.string().trim().min(2, "Your name is required").max(100),
  email: z.string().trim().email("A valid email is required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const parsed = bespokeSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message ?? "Please review your request.",
        },
        { status: 400 }
      );
    }

    const referenceId = crypto.randomUUID();
    const data = parsed.data;

    await sendFormNotificationEmails({
      type: "bespoke",
      title: "Bespoke request received",
      adminSubject: `New bespoke request - ${data.fullName}`,
      fields: {
        Reference: referenceId,
        Name: data.fullName,
        Email: data.email,
        "Phone / WhatsApp": data.phone,
        Country: data.country,
        Garment: data.garmentType,
        Occasion: data.occasion,
        "Event Date": data.eventDate,
        "Investment Range": data.budgetRange,
        "Fabric Preference": data.fabricPreference,
        "Colour Palette": data.colorPreference,
        "Inspiration Notes": data.inspirationNotes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bespoke request submitted successfully.",
      referenceId,
    });
  } catch (error) {
    console.error("Bespoke submission error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
