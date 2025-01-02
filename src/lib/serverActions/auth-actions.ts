"use server";

import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { FormSchema } from "@/lib/types";
import { cookies } from "next/headers";

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { response: null, error: error.message };
  }

  return { response: { data }, error: null };
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email);

  if (data?.length) return { error: { message: "User already exists", data } };
  const { error, ...response } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return {
      error: { message: error.message, code: error.code, status: error.status },
    };
  }

  return response;
}
