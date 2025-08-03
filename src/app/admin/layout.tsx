import SidebarAdmin from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
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
