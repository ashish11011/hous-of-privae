import React from "react";
import ProductEdit from "./productEdit";
import { getProdcutInfoBySlug } from "@/lib";

const Page = async ({ params }: any) => {
  const { slug } = await params;

  let productData;

  if (slug != "create" && slug != undefined && slug != null) {
    productData = await getProdcutInfoBySlug(slug);
  }

  return (
    <ProductEdit
      productData={productData ? productData[0] : null}
      slug={slug}
    />
  );
};

export default Page;
