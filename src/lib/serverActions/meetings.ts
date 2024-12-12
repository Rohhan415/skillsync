"use server";

import { getValidTimesFromSchedule } from "@/lib/helpers/validTimesFromSchedule";
import { meetingActionSchema } from "@/lib/schema/meetings";
import "use-server";
import { z } from "zod";
import { createCalendarEvent } from "../google-calendar/queries";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";
import { getEventSchedule } from "../supabase/queries";

export async function createMeeting(
  unsafeData: z.infer<typeof meetingActionSchema>
) {
  const { success, data } = meetingActionSchema.safeParse(unsafeData);

  if (!success) return { error: true };

  const event = await getEventSchedule(data.user_id, data.event_id);

  if (event == null) return { error: true };
  const startInTimezone = fromZonedTime(data.start_time, data.timezone);

  const validTimes = await getValidTimesFromSchedule([startInTimezone], event);
  if (validTimes.length === 0) return { error: true };

  // DO DOKONCZENIA

  //   await createCalendarEvent({
  //     ...data,
  //     start_time: startInTimezone,
  //     duration_in_minutes: event.duration_in_minutes,
  //     event_name: event.name,
  //   });

  redirect(
    `/dashboard/book/${data.user_id}/${
      data.event_id
    }/success?startTime=${data.start_time.toISOString()}`
  );
}
