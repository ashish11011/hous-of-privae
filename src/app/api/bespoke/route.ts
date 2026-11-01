import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { accountJson, accountSchemaMissing } from "@/lib/account/api";
import { submitBespoke } from "@/lib/account/atelier";
import { ZodError } from "zod";
export async function POST(req: Request) {
  try { const session = await getServerSession(authOptions); return accountJson(await submitBespoke(await req.json(), session?.id ?? null)); }
  catch (error) { return accountJson({ success: false, message: error instanceof ZodError ? error.issues[0]?.message : "We could not save your commission. Please try again shortly." }, error instanceof ZodError ? 400 : accountSchemaMissing(error) ? 503 : 500); }
}
