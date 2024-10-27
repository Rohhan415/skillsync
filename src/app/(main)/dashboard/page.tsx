import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { getUserSubscriptionStatus } from "@/lib/supabase/queries";

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
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup
          subscription={subscription}
          user={user}
        ></DashboardSetup>
      </div>
    );
  }

  redirect(`/dashboard/${workspace.id}`);

  return <div>Page</div>;
}

export default DashboardPage;
