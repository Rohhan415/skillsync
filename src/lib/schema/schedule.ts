import { z } from "zod";
import { DAYS_OF_WEEK_IN_ORDER } from "../constants";
import { timeToInt } from "../helpers/timeToInt";

export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, "Required"),
  availabilities: z
    .array(
      z.object({
        day_of_week: z.enum(DAYS_OF_WEEK_IN_ORDER),
        start_time: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            "Time must be in the format HH:MM"
          ),
        end_time: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            "Time must be in the format HH:MM"
          ),
      })
    )
    .superRefine((availabilities, ctx) => {
      availabilities.forEach((availability, index) => {
        const overlaps = availabilities.some((a, i) => {
          return (
            i !== index &&
            a.day_of_week === availability.day_of_week &&
            timeToInt(a.start_time) < timeToInt(availability.end_time) &&
            timeToInt(a.end_time) > timeToInt(availability.start_time)
          );
        });

        if (overlaps) {
          ctx.addIssue({
            code: "custom",
            message: "Availability overlaps with another",
            path: [index],
          });
        }

        if (
          timeToInt(availability.start_time) >= timeToInt(availability.end_time)
        ) {
          ctx.addIssue({
            code: "custom",
            message: "End time must be after start time",
            path: [index],
          });
        }
      });
    }),
});
