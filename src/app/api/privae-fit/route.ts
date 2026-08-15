import { sendFormNotificationEmails } from "@/lib/email/ses";
import { NextResponse } from "next/server";
import { z } from "zod";

const measureSchema = z.object({
  mode: z.literal("measure"),
  fullName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().optional().or(z.literal("")),
  bust: z.string().trim().optional().or(z.literal("")),
  waist: z.string().trim().optional().or(z.literal("")),
  hips: z.string().trim().optional().or(z.literal("")),
  shoulderWidth: z.string().trim().optional().or(z.literal("")),
  sleeveLength: z.string().trim().optional().or(z.literal("")),
  kurtaLength: z.string().trim().optional().or(z.literal("")),
  bottomLength: z.string().trim().optional().or(z.literal("")),
  bottomWaist: z.string().trim().optional().or(z.literal("")),
  dupattaLength: z.string().trim().optional().or(z.literal("")),
  selectedColor: z.string().trim().optional().or(z.literal("")),
  additionalNotes: z.string().trim().optional().or(z.literal("")),
});

const studioSchema = z.object({
  mode: z.literal("studio"),
  name: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().min(1, "Phone is required."),
  email: z.string().trim().email("A valid email is required."),
  date: z.string().trim().min(1, "Preferred date is required."),
  message: z.string().trim().optional().or(z.literal("")),
});

const privaeFitSchema = z.discriminatedUnion("mode", [
  measureSchema,
  studioSchema,
]);

export async function POST(req: Request) {
  try {
    const parsed = privaeFitSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message ??
            "Please review your Privae Fit request.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await sendFormNotificationEmails({
      type: "privae fit",
      title:
        data.mode === "measure"
          ? "Privae Fit measurements received"
          : "Privae Fit studio appointment received",
      adminSubject:
        data.mode === "measure"
          ? `New Privae Fit measurement request - ${data.fullName || data.phone || "Website"}`
          : `New Privae Fit studio request - ${data.name}`,
      fields:
        data.mode === "measure"
          ? {
              Mode: "Provide Measurements",
              "Full Name": data.fullName,
              Phone: data.phone,
              Email: data.email,
              "Bust / Chest": data.bust,
              Waist: data.waist,
              Hips: data.hips,
              "Shoulder Width": data.shoulderWidth,
              "Sleeve Length": data.sleeveLength,
              "Kurta / Top Length": data.kurtaLength,
              "Bottom Waist": data.bottomWaist,
              "Bottom Length": data.bottomLength,
              "Dupatta Length": data.dupattaLength,
              "Selected Color": data.selectedColor,
              "Additional Notes": data.additionalNotes,
            }
          : {
              Mode: "Visit the Studio",
              Name: data.name,
              Phone: data.phone,
              Email: data.email,
              "Preferred Date": data.date,
              Message: data.message,
            },
    });

    return NextResponse.json({
      success: true,
      message: "Privae Fit request submitted successfully.",
    });
  } catch (error) {
    console.error("Privae Fit submission error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
