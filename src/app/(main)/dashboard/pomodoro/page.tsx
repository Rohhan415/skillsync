import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getPrivateWorkspaces } from "@/lib/supabase/queries";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftFromLine } from "lucide-react";
import { Pomodoro } from "@/components/pomodoro/Pomodoro";

const TimerPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const privateWWorkspaces = await getPrivateWorkspaces(user.id);

  if (!user) return;

  return (
    <div className="w-full h-full gap-24 flex flex-col mx-auto px-6 lg:px-8 py-10 bg-background">
      <div className="flex flex-wrap justify-between items-center gap-4  bg-card p-6 rounded-xl border text-card-foreground shadow">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight  text-foreground">
          Let&apos;s focus
        </h1>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href={`/dashboard/${privateWWorkspaces[0].id}`}>
              <span> Return to Workspace</span>
              <ArrowLeftFromLine />
            </Link>
          </Button>
        </div>
      </div>
      <Pomodoro />
    </div>
  );
};

export default TimerPage;
