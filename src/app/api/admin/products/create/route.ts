import { NextResponse } from "next/server";
import { createProduct } from "../../../../../../lib";

export const POST = async (req: Request) => {
  const body = await req.json();
  console.log("this is the body: ", body);
  body.slug = "this-is-a-slug";
  await createProduct(body);
  return NextResponse.json({ success: true, msg: "success" });
};
