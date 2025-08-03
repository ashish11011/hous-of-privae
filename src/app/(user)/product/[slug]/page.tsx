import { getProdcutInfoBySlug, getSimillarProducts } from "../../../../../lib";
import ProductInformation from "./ProductInformation";
import ShowMoreProducts from "./ShowMoreProducts";

const Page = async ({ params }: { params: any }) => {
  const productSlug = (await params).slug;
  if (!productSlug) return <div>no product found</div>;
  const productData = await getProdcutInfoBySlug(productSlug);
  const simillarProducts = await getSimillarProducts(
    productData ? (productData[0]?.categoryId1 as string) : "",
    productSlug
  );
  return (
    <>
      <ProductInformation productData={productData ? productData[0] : null} />
      <ShowMoreProducts simillarProducts={simillarProducts} />
    </>
  );
};
export default Page;
