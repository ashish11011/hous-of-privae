import { NextResponse } from "next/server";
import { updateProdcutInfoBySlug } from "../../../../../../lib";

export const POST = async (req: Request) => {
  const body = await req.json();
  await updateProdcutInfoBySlug({ productDetails: body, slug: body.slug });
  return NextResponse.json({ success: true, msg: "success" });
};
