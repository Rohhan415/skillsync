import Sidebar from "@/components/sidebar/sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string };
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  return (
    // this h and w screen are not good, I should change it later
    <main className="flex over-hidden h-screen w-screen">
      {" "}
      <Sidebar params={params} />
      <div className="dark:border-Neutrals-12/70 border-l-[1px] w-full relative overflow-scroll">
        {" "}
        {children}
      </div>
    </main>
  );
};

export default Layout;
