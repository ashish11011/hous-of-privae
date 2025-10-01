import SidebarAdmin from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import LocalstorageHashProvider from "@/lib/localstorageHashProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocalstorageHashProvider>
      <div className=" flex min-h-screen h-full w-full">
        <SidebarProvider className=" w-fit">
          <SidebarAdmin />
        </SidebarProvider>
        <>{children}</>
      </div>
    </LocalstorageHashProvider>
  );
};

export default Layout;
