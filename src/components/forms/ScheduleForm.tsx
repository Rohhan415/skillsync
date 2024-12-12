"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { DAYS_OF_WEEK_IN_ORDER } from "@/lib/constants";
import { scheduleFormSchema } from "@/lib/schema/schedule";
import { timeToInt } from "@/lib/helpers/timeToInt";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";

import { formatTimezoneOffset } from "@/lib/helpers/formatters";
import { Fragment, useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { saveSchedule } from "@/lib/supabase/queries";

type Availability = {
  start_time: string;
  end_time: string;
  day_of_week: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

const ScheduleForm = ({
  schedule,
}: {
  schedule?: {
    timezone: string;
    schedule_availabilities: Availability[];
  };
}) => {
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities:
        schedule?.schedule_availabilities.toSorted((a, b) => {
          return timeToInt(a.start_time) - timeToInt(b.end_time);
        }) ?? [],
    },
  });

  const {
    append: addAvailability,
    fields: availabilityFields,
    remove: removeAvailability,
  } = useFieldArray({
    control: form.control,
    name: "availabilities",
  });

  const groupedAvailabilities = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (availability) => availability.day_of_week
  );

  const onSubmit = async (schedule: z.infer<typeof scheduleFormSchema>) => {
    const data = await saveSchedule(schedule);

    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your schedule",
      });
    } else {
      setSuccessMessage("Schedule saved!");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-6 flex flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm">{successMessage}</div>
        )}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                      {` (${formatTimezoneOffset(tz)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className="capitalize text-sm font-semibold">
                {dayOfWeek.substring(0, 3)}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="size-6 p-1"
                  variant="outline"
                  onClick={() => {
                    addAvailability({
                      day_of_week: dayOfWeek,
                      start_time: "9:00",
                      end_time: "17:00",
                    });
                  }}
                >
                  <Plus className="size-full" />
                </Button>
                {groupedAvailabilities[dayOfWeek]?.map((field, labelIndex) => (
                  <div className="flex flex-col gap-1" key={field.id}>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.start_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-24"
                                aria-label={`${dayOfWeek} Start Time ${
                                  labelIndex + 1
                                }`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      -
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.end_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-24"
                                aria-label={`${dayOfWeek} End Time ${
                                  labelIndex + 1
                                }`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        className="size-6 p-1"
                        variant="destructiveGhost"
                        onClick={() => removeAvailability(field.index)}
                      >
                        <X />
                      </Button>
                    </div>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(field.index)
                          ?.root?.message
                      }
                    </FormMessage>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(field.index)
                          ?.start_time?.message
                      }
                    </FormMessage>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(field.index)
                          ?.end_time?.message
                      }
                    </FormMessage>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleForm;
