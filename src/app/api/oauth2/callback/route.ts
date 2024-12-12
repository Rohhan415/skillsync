import { NextResponse } from "next/server";
import { oAuth2Client } from "@/lib/serverActions/google-auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: "Google oauth failed" + error });
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    cookies().set({
      name: "google_access_token",
      value: tokens.access_token ?? "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    return NextResponse.json({ error: "Failed to get token" + error });
  }
}
