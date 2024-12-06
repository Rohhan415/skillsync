import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { getUserSubscriptionStatus } from "@/lib/supabase/queries";
import DashboardSidebar from "@/components/dashboard-sidebar/Sidebar";
import Calendar from "@/components/calendar/Calendar";

async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("workspace_owner", user.id)
    .single();

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  if (subscriptionError) return;

  if (!workspace) {
    return (
      <>
        <DashboardSidebar />
        <div className="bg-background h-screen w-screen flex justify-center items-center">
          <Calendar />
          {/* <DashboardSetup subscription={subscription} user={user} /> */}
        </div>
      </>
    );
  }

  redirect(`/dashboard/${workspace.id}`);
}

export default DashboardPage;
