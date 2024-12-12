import { startOfDay } from "date-fns";
import { z } from "zod";

const meetingSchemaBase = z.object({
  start_time: z.date().min(new Date()),
  guest_email: z.string().email().min(1, "Required"),
  guest_name: z.string().min(1, "Required"),
  guest_notes: z.string().optional(),
  timezone: z.string().min(1, "Required"),
});

export const meetingFormSchema = z
  .object({
    date: z.date().min(startOfDay(new Date()), "Must be in the future"),
  })
  .merge(meetingSchemaBase);

export const meetingActionSchema = z
  .object({
    event_id: z.string().min(1, "Required"),
    user_id: z.string().min(1, "Required"),
  })
  .merge(meetingSchemaBase);
