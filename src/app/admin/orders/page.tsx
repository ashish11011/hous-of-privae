import { useGetAllOrderList } from "@/src/hepler";
import OrdersTable from "./orderTable";

const Page = async () => {
  const orderList = await useGetAllOrderList();
  return (
    <div className=" w-full h-full p-4">
      <OrdersTable orders={orderList} />
    </div>
  );
};

export default Page;
