// app/api/products/route.ts
import { NextResponse } from "next/server";
import { createProduct } from "../../../../../lib";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const created = await createProduct(body);
    return NextResponse.json({ success: true, created });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
