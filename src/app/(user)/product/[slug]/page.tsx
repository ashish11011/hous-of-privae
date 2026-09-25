import { getProdcutInfoBySlug } from "@/lib";
import { notFound } from "next/navigation";
import ProductInformation from "./ProductInformation";

export const dynamic = "force-dynamic";

const Page = async ({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ variant?: string }> }) => {
  const productSlug = (await params).slug;
  if (!productSlug) return <div>no product found</div>;
  const productData = await getProdcutInfoBySlug(productSlug);
  const currentProduct = productData?.[0];
  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="eyebrow mb-3">Product</p>
        <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
          Product Not Found
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          This piece may no longer be available.
        </p>
      </div>
    );
  }
  const requestedVariant = (await searchParams).variant;
  const selected = requestedVariant ? currentProduct.variants.find(variant => variant.id === requestedVariant) : currentProduct.variants[0];
  if (!selected || !currentProduct.sizes?.length) notFound();
  const safeProductData = { ...currentProduct, variantId: selected.id, bannerImage: selected.bannerImage, images: [selected.bannerImage, ...(selected.images ?? []).filter(image => image !== selected.bannerImage)] };

  return (
    <>
      <div className=" container mx-auto px-6">
        <ProductInformation key={selected.id} productData={safeProductData} />
        {/* <ShowMoreProducts simillarProducts={simillarProducts} /> */}
      </div>
    </>
  );
};
export default Page;
