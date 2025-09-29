import { createProduct } from "@/lib";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  body.slug = "this-is-a-slug";
  await createProduct(body);
  return NextResponse.json({ success: true, msg: "success" });
};
