import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardSidebar from "@/components/dashboard-sidebar/Sidebar";
import { google } from "googleapis";
import oauth2Client from "@/lib/serverActions/google-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Calendar from "@/components/calendar/Calendar";
async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const cookieStore = cookies();
  const accessToken = cookieStore.get("google_access_token");
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const authURL = oauth2Client.generateAuthUrl({
    access_type: "online",
    response_type: "code",
    scope: scopes,
  });

  oauth2Client.setCredentials({ access_token: accessToken?.value });
  const drive = google
    .calendar("v3")
    .events.list({ calendarId: "primary", auth: oauth2Client });

  console.log(drive, " misissipi");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("workspace_owner", user.id)
    .single();

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

          {/* <DashboardSetup subscription={subscription} user={user} /> */}
        </div>
      </>
    );
  }

  redirect(`/dashboard/${workspace.id}`);
}

export default DashboardPage;
