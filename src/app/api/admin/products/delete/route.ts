import { NextResponse } from "next/server";
import { deleteProductBySlug, getProdcutInfoBySlug } from "../../../../../../lib";
import { revalidateProductCatalogPaths } from "@/lib/revalidateProductPaths";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { slug } = body;
    const previousProduct = (await getProdcutInfoBySlug(slug))?.[0];

    await deleteProductBySlug(slug);
    await revalidateProductCatalogPaths(previousProduct);

    return NextResponse.json({
      success: true,
      msg: `${slug} delete sucessfully`,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error });
  }
};
