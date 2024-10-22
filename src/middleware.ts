import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (req.nextUrl.pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl).toString());
  }
  const emailListError =
    "Email link is invalid or has expired. Please request a new one.";
  if (
    req.nextUrl.searchParams.get("error_description") === emailListError &&
    req.nextUrl.pathname !== "/signup"
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?error_description=${req.nextUrl.searchParams.get(
          "error_description"
        )}`,
        req.url
      ).toString()
    );
  }

  if (["/login", "/signup"].includes(req.nextUrl.pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url).toString());
  }
  return res;
}
