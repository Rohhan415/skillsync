import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

const DashboardSidebar = async () => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("workspace_owner", user.id);

  return (
    <aside
      className={twMerge(
        "hidden sm:flex sm:flex-col w-[280px] border-r-1 border-r border-primary-foreground  shrink-0 p-4 md:gap-4 !justify-between"
        // className
      )}
    >
      <div>
        <Link href={`/dashboard/${workspace?.[0]?.id}`}>
          <div className="text-blue-500 hover:underline">Go to Workspace</div>
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
