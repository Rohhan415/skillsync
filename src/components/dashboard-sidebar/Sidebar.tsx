import { twMerge } from "tailwind-merge";

const DashboardSidebar = async () => {
  return (
    <aside
      className={twMerge(
        "hidden sm:flex sm:flex-col w-[280px] border-r-1 border-r border-primary-foreground  shrink-0 p-4 md:gap-4 !justify-between"
        // className
      )}
    >
      <div></div>
    </aside>
  );
};

export default DashboardSidebar;
