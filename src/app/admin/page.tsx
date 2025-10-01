import { Button } from "@/components/ui/button";
import { ProductTableAdmin } from "./productTable";
import Link from "next/link";
import { PAGINATION_LIMIT } from "@/const";
import { useGetAllProducts } from "@/src/hepler";

const Page = async ({ searchParams }: any) => {
  const currentPage = (await searchParams).page || 1;
  const productData: any = await useGetAllProducts(
    currentPage,
    PAGINATION_LIMIT
  );
  return (
    <div className=" w-full p-4 space-y-8">
      <div>
        <Link href={"/admin/products/create"}>
          <Button>Add new Product</Button>
        </Link>
      </div>
      <ProductTableAdmin
        productData={productData.products}
        total={productData.total}
        currentPage={Number(currentPage)}
      />
    </div>
  );
};

export default Page;
