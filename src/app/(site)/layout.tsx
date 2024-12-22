import Header from "@/components/landing-page/header";

interface LayoutProps {
  children: React.ReactNode;
}

const HomePageLayout: React.FC<LayoutProps> = async ({ children }) => {
  return (
    <div>
      <Header />
      <div className=" mt-12 px-8 py-12 ">
        <main className="w-full ml-40 mr-auto max-w-7xl">{children}</main>
      </div>
    </div>
  );
};

export default HomePageLayout;
