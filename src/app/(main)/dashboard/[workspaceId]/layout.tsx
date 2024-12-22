import Sidebar from "@/components/workspace-sidebar/sidebar";
import MobileSidebar from "@/components/workspace-sidebar/sidebar-mobile";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string };
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  return (
    // this h and w screen are not good, I should change it later
    <main className="flex over-hidden h-screen w-screen">
      <Sidebar params={params} />
      <MobileSidebar>
        <Sidebar params={params} className="w-screen inline-block sm:hidden" />
      </MobileSidebar>
      <div className="dark:border-neutral-border-l-[1px] w-full relative  overflow-y-scroll">
        {children}
      </div>
    </main>
  );
};

export default Layout;
