import {
  useGetAllSubscriptions,
  useGetSubscriptionsPaginated,
} from "@/src/hepler";
import { PAGINATION_LIMIT } from "@/const";
import SubscriptionsTable from "./subscriptionsTable";

export const dynamic = "force-dynamic";

const Page = async ({ searchParams }: any) => {
  const currentPage = Number((await searchParams).page || 1);
  const subscriptionData = await useGetSubscriptionsPaginated(
    currentPage,
    PAGINATION_LIMIT
  );
  const exportSubscriptions = await useGetAllSubscriptions();

  return (
    <div className="w-full h-full p-4">
      <SubscriptionsTable
        subscriptions={subscriptionData.subscriptions}
        exportSubscriptions={exportSubscriptions}
        total={subscriptionData.total}
        currentPage={currentPage}
      />
    </div>
  );
};

export default Page;
