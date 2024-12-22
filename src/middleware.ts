import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getPrivateWorkspaces } from "./lib/supabase/queries";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (req.nextUrl.pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl).toString());
  }

  if (["/login"].includes(req.nextUrl.pathname) && session) {
    const workspaces = await getPrivateWorkspaces(session.user.id);

    return workspaces.length > 0
      ? NextResponse.redirect(
          new URL(`/dashboard/${workspaces[0].id}`, req.url).toString()
        )
      : NextResponse.redirect(new URL("/dashboard/start", req.url).toString());
  }
  return res;
}
