import { useGetContactsPaginated } from "@/src/hepler";
import ContactsTable from "./contactsTable";
import { PAGINATION_LIMIT } from "@/const";

const Page = async ({ searchParams }: any) => {
  const currentPage = (await searchParams).page || 1;
  const contactFormData = await useGetContactsPaginated(
    currentPage,
    PAGINATION_LIMIT
  );

  return (
    <div className=" w-full h-full p-4">
      <ContactsTable
        contacts={contactFormData.contacts}
        total={contactFormData.total}
        currentPage={Number(currentPage)}
      />
    </div>
  );
};

export default Page;
