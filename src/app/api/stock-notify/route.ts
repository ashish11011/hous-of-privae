import { sendFormNotificationEmails } from "@/lib/email/ses";
import { NextResponse } from "next/server";
import { z } from "zod";

const stockNotifySchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().optional().or(z.literal("")),
  productId: z.string().trim().optional().or(z.literal("")),
  productName: z.string().trim().min(1, "Product name is required."),
  productSku: z.string().trim().optional().or(z.literal("")),
  productSlug: z.string().trim().min(1, "Product slug is required."),
  productUrl: z.string().trim().min(1, "Product link is required."),
});

export async function POST(req: Request) {
  try {
    const parsed = stockNotifySchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message ??
            "Please review your stock alert request.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await sendFormNotificationEmails({
      type: "stock alert",
      title: "Stock alert request received",
      adminSubject: `Back in stock request - ${data.productName}`,
      fields: {
        Name: data.name,
        Email: data.email,
        Phone: data.phone,
        Product: data.productName,
        SKU: data.productSku,
        "Product ID": data.productId,
        Slug: data.productSlug,
        Link: data.productUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stock alert request submitted successfully.",
    });
  } catch (error) {
    console.error("Stock alert submission error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
