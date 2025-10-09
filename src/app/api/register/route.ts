// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const hashed = await hash(password, 10);
  // Save to DB (replace this with actual DB call)
  // await fakeSaveUser({ email, password: hashed });

  return NextResponse.json({ success: true });
}
