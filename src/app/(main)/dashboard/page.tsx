import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { cookies } from "next/headers";
import DashboardSidebar from "@/components/dashboard-sidebar/Sidebar";
import { oAuth2Client } from "@/lib/serverActions/google-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Calendar from "@/components/calendar/Calendar";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const cookieStore = cookies();
  const accessToken = cookieStore.get("google_access_token");
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const authURL = oAuth2Client.generateAuthUrl({
    access_type: "online",
    response_type: "code",
    scope: scopes,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("workspace_owner", user.id)
    .single(); // specjalnie zwraca null zeby pokazac okienko

  if (!workspace) {
    return (
      <>
        <DashboardSidebar />
        <div className="bg-background h-screen w-screen flex flex-col justify-start items-center">
          {accessToken ? (
            <Calendar>hi</Calendar>
          ) : (
            <Link href={authURL}>
              <Button>Login to google</Button>
            </Link>
          )}

          <DashboardSetup user={user} />
        </div>
      </>
    );
  }
}

export default DashboardPage;
