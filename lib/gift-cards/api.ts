import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { isGiftCardSchemaMissing } from "./redemption";

export function giftCardJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function giftCardApi(
  action: (userId: string) => Promise<unknown>,
) {
  const session = await getServerSession(authOptions);
  if (!session?.id)
    return giftCardJson(
      { success: false, msg: "Sign in to manage or use gift cards." },
      401,
    );
  try {
    return giftCardJson(await action(session.id));
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError)
      return giftCardJson(
        {
          success: false,
          msg:
            error instanceof ZodError
              ? error.issues[0]?.message || "Check your gift card details."
              : "Valid gift card details are required.",
        },
        400,
      );
    if (error instanceof CheckoutError)
      return giftCardJson({ success: false, msg: error.message }, error.status);
    if (isGiftCardSchemaMissing(error))
      return giftCardJson(
        {
          success: false,
          msg: "Gift cards are not available yet. Please try again later.",
        },
        503,
      );
    console.error("Gift card operation failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return giftCardJson(
      {
        success: false,
        msg: "Unable to complete this gift card request. Please try again.",
      },
      500,
    );
  }
}
