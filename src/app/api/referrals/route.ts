import { z } from "zod";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { accountReferral } from "@/db/accountSchema";
import { eq } from "drizzle-orm";
import { accountJson, accountSchemaMissing } from "@/lib/account/api";
import {
  captureReferralForMember,
  REFERRAL_COOKIE,
  referralCookie,
} from "@/lib/account/referrals";
export async function POST(req: Request) {
  try {
    const input = z
      .object({
        code: z
          .string()
          .regex(/^[A-Fa-f0-9]{16}$/)
          .optional(),
        claim: z.boolean().optional(),
      })
      .parse(await req.json());
    const jar = await cookies();
    if (input.claim) {
      const session = await getServerSession(authOptions);
      if (!session?.id) return accountJson({ success: false }, 401);
      const cookie = jar.get(REFERRAL_COOKIE)?.value;
      const claimed = cookie
        ? await captureReferralForMember(session.id, cookie)
        : false;
      jar.delete(REFERRAL_COOKIE);
      return accountJson({ success: true, claimed });
    }
    if (input.code) {
      const [existing] = await db
        .select()
        .from(accountReferral)
        .where(eq(accountReferral.code, input.code.toUpperCase()));
      if (existing && !jar.get(REFERRAL_COOKIE))
        jar.set(REFERRAL_COOKIE, referralCookie(existing.code), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 86400,
        });
    }
    return accountJson({ success: true });
  } catch (error) {
    return accountJson(
      { success: false },
      accountSchemaMissing(error) ? 503 : 400,
    );
  }
}
