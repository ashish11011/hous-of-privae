import { getProdcutInfoBySlug, getSimillarProducts } from "@/lib";
import ProductInformation from "./ProductInformation";
import ShowMoreProducts from "./ShowMoreProducts";
import { useGetAllProducts } from "@/src/hepler";

// export async function generateStaticParams() {
//   const products: any = await useGetAllProducts(null, null);
//   return products.map((cat: any) => ({
//     productID: cat.id,
//   }));
// }

export const revalidate = 86400;

const Page = async ({ params }: { params: any }) => {
  const productSlug = (await params).slug;
  if (!productSlug) return <div>no product found</div>;
  const productData = await getProdcutInfoBySlug(productSlug);
  const simillarProducts = await getSimillarProducts(
    productData ? (productData[0]?.categoryId1 as string) : "",
    productSlug
  );
  const { isDeleted, ...safeProductData } = productData ? productData[0] : {};

  return (
    <>
      <ProductInformation productData={safeProductData} />
      <ShowMoreProducts simillarProducts={simillarProducts} />
    </>
  );
};
export default Page;
