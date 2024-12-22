"use server";
import "use-server";
import { cookies } from "next/headers";
import { z } from "zod";
import { eventFormSchema } from "../schema/events";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  deleteEventQuery,
  insertEvent,
  updateEventDetails,
} from "../supabase/queries";
import { redirect } from "next/navigation";

export const createEvent = async (
  values: z.infer<typeof eventFormSchema>
): Promise<{ error: boolean } | undefined> => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { success, data, error } = eventFormSchema.safeParse(values);

  if (!success || !user) {
    console.log("error", error);
    return { error: true };
  }
  await insertEvent(data, user.id);
  redirect("/dashboard/events");
};

export const updateEvent = async (
  id: string,
  values: z.infer<typeof eventFormSchema>
): Promise<{ error: boolean } | undefined> => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { success, data, error } = eventFormSchema.safeParse(values);

  if (!success || !user) {
    console.log("error", error);
    return { error: true };
  }
  await updateEventDetails(id, user.id, data);
  redirect("/dashboard/events");
};

export const deleteEvent = async (
  id: string
): Promise<{ error: boolean } | undefined> => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await deleteEventQuery(id, user.id);
  redirect("/dashboard/events");
};
