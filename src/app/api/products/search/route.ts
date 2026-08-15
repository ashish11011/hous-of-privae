import { searchProducts } from "@/src/hepler/order/useGetAllProducts";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? 8);

  try {
    const products = await searchProducts(query, Number.isFinite(limit) ? limit : 8);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { products: [], message: String(error) },
      { status: 500 }
    );
  }
}
