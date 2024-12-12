import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().min(1, "required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  duration_in_minutes: z.coerce
    .number()
    .int()
    .positive("Duration must be greater than 0")
    .max(60 * 12, `Duration must be less than 12 hours (${60 * 12} minutes)`),
});