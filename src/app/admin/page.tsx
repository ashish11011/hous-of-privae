import { Button } from "@/components/ui/button";
import { ProductTableAdmin } from "./productTable";
import Link from "next/link";
import { getAllProducts } from "@/lib";

const Page = async () => {
  const productData = await getAllProducts();
  return (
    <div className=" w-full p-4 space-y-8">
      <div>
        <Link href={"/admin/products/create"}>
          <Button>Add new Product</Button>
        </Link>
      </div>
      <ProductTableAdmin productData={productData} />
    </div>
  );
};

export default Page;
