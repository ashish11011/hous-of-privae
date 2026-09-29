import SidebarAdmin from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getOrderAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  if (!await getOrderAdmin()) redirect("/auth/login?callbackUrl=/admin");
  return (

      <div className=" flex min-h-screen h-full w-full">
        <SidebarProvider className=" w-fit">
          <SidebarAdmin />
        </SidebarProvider>
        <>{children}</>
      </div>

  );
};

export default Layout;
