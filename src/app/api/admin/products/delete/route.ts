import { NextResponse } from "next/server";
import { deleteProductBySlug } from "../../../../../../lib";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { slug } = body;
    await deleteProductBySlug(slug);
    return NextResponse.json({
      success: true,
      msg: `${slug} delete sucessfully`,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error });
  }
};
