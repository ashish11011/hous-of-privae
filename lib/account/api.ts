import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CheckoutError } from "@/lib/payments/checkout-error";
export function accountSchemaMissing(error: unknown): boolean {
  const item = error as {
    code?: string;
    message?: string;
    cause?: unknown;
  } | null;
  if (!item || typeof item !== "object") return false;
  if (
    item.code === "42P01" &&
    /\b(account_|circle_|bespoke_)/.test(item.message ?? "")
  )
    return true;
  return item.cause ? accountSchemaMissing(item.cause) : false;
}
export function accountJson(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function accountApi(
  action: (userId: string, email: string) => Promise<unknown>,
) {
  const session = await getServerSession(authOptions);
  if (!session?.id || !session.email)
    return accountJson(
      { success: false, message: "Please sign in to view your account." },
      401,
    );
  try {
    return accountJson(await action(session.id, session.email));
  } catch (error) {
    if (error instanceof ZodError)
      return accountJson(
        {
          success: false,
          message: error.issues[0]?.message || "Check your details.",
        },
        400,
      );
    if (error instanceof SyntaxError)
      return accountJson(
        { success: false, message: "Valid details are required." },
        400,
      );
    if (error instanceof CheckoutError)
      return accountJson(
        { success: false, message: error.message },
        error.status,
      );
    if (accountSchemaMissing(error))
      return accountJson(
        {
          success: false,
          message:
            "This account feature is not available yet. Please try again later.",
        },
        503,
      );
    console.error("Account operation failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return accountJson(
      {
        success: false,
        message: "Unable to update your account. Please try again.",
      },
      500,
    );
  }
}
