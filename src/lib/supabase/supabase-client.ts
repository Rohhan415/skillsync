import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
