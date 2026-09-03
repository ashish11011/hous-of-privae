import ProductEdit from "./productEdit";
import { getAllCategories, getProdcutInfoBySlug } from "@/lib";

export const dynamic = "force-dynamic";

const Page = async ({ params }: any) => {
  const { slug } = await params;

  let productData;

  if (slug != "create" && slug != undefined && slug != null) {
    productData = await getProdcutInfoBySlug(slug);
  }

  const categories = await getAllCategories();
  return (
    <>
      <ProductEdit
        productData={productData ? productData[0] : null}
        slug={slug}
        categories={categories}
      />
    </>
  );
};

export default Page;
