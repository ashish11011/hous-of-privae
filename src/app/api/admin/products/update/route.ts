import { updateProdcutInfoBySlug } from "@/lib";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    await updateProdcutInfoBySlug({ productDetails: body, slug: body.slug });
    return NextResponse.json({
      success: true,
      msg: "Product updated successfully",
    });
  } catch (error) {
    return NextResponse.json({ success: false, msg: String(error) }, { status: 500 });
  }
};
