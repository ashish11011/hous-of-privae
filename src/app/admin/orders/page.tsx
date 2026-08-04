import { useGetAllOrderList } from "@/src/hepler";
import OrdersTable from "./orderTable";

export const dynamic = "force-dynamic";

const Page = async () => {
  const orderList = await useGetAllOrderList();
  return (
    <div className=" w-full h-full p-4">
      <OrdersTable orders={orderList} />
    </div>
  );
};

export default Page;
