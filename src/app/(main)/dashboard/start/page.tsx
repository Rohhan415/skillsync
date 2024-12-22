import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import background from "../../../../../public/homepage-background.webp";
import { cookies } from "next/headers";

import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
async function InitialLoginPage() {
  const supabase = createServerComponentClient({ cookies });

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
        <div className="relative h-full w-full">
          <Image
            src={background}
            fill
            placeholder="blur"
            quality={80}
            className="object-cover object-top bg-black opacity-50"
            alt="Two green pencils on a grey background"
          />
          <div className="relative z-10 flex flex-col h-full justify-center items-center">
            <DashboardSetup user={user} />
          </div>
        </div>
      </>
    );
  }
}

export default InitialLoginPage;
