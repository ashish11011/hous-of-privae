import { getProdcutInfoBySlug, updateProdcutInfoBySlug } from "@/lib";
import { revalidateProductCatalogPaths } from "@/lib/revalidateProductPaths";
import { NextResponse } from "next/server";
import { sendBackInStockNotifications } from "@/lib/account/stock-alerts";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const previousProduct = (await getProdcutInfoBySlug(body.slug))?.[0];

    await updateProdcutInfoBySlug({ productDetails: body, slug: body.slug });
    await revalidateProductCatalogPaths(previousProduct, body);
    if (previousProduct?.id) await sendBackInStockNotifications(previousProduct.id);

    return NextResponse.json({
      success: true,
      msg: "Product updated successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, msg: String(error) },
      { status: 500 },
    );
  }
};
