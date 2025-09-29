import { updateProdcutInfoBySlug } from "@/lib";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  console.log("body: ", body);
  await updateProdcutInfoBySlug({ productDetails: body, slug: body.slug });
  return NextResponse.json({ success: true, msg: "success" });
};
