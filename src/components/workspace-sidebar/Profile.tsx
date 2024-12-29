import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, UserRoundPen } from "lucide-react";
import LogoutButton from "../global/logout-button";

import { getUser } from "@/lib/supabase/queries";

const UserProfile = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const response = await getUser(user.id);
  let avatarPath;
  if (!response) return;
  if (!response.avatar_url) avatarPath = "";
  else {
    avatarPath = supabase.storage
      .from("Avatars")
      .getPublicUrl(response.avatar_url)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article
      className="hidden
      sm:flex 
      justify-between 
      items-center 
      px-4 
      py-2 
      bg-black
      border
      border-primary/40
      rounded-3xl
  "
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback>
            <UserRoundPen />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <small
            className="w-[100px] 
          overflow-hidden 
          overflow-ellipsis
          "
          >
            {profile.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <LogoutButton>
          <LogOut />
        </LogoutButton>
      </div>
    </article>
  );
};

export default UserProfile;
