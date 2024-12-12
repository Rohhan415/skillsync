import {
  addMinutes,
  areIntervalsOverlapping,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns";
import { getCalendarEvents } from "../google-calendar/queries";
import { getCalendarSchedule } from "../supabase/queries";
import { DAYS_OF_WEEK_IN_ORDER } from "../constants";
import { fromZonedTime } from "date-fns-tz";
import { Database } from "../supabase/supabase.types";

export async function getValidTimesFromSchedule(
  times: Date[],
  event: { user_id: string; duration_in_minutes: number }
) {
  const start = times[0];
  const end = times.at(-1);

  if (start == null || end == null) return [];

  const schedule = await getCalendarSchedule(event.user_id);

  if (schedule == null) return [];

  const groupedAvailabilities = groupBy(
    schedule[0].schedule_availabilities,
    (a) => a.day_of_week
  );

  const eventTimes = await getCalendarEvents({
    start,
    end,
  });

  return times.filter((intervalDate) => {
    const availabilities = getAvailabilities(
      groupedAvailabilities,
      intervalDate,
      schedule[0].timezone
    );
    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, event.duration_in_minutes),
    };

    return (
      eventTimes.every((eventTime) => {
        return !areIntervalsOverlapping(eventTime, eventInterval);
      }) &&
      availabilities.some((availability) => {
        return (
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
        );
      })
    );
  });
}

type DayOfWeek = (typeof DAYS_OF_WEEK_IN_ORDER)[number];
type Availability =
  Database["public"]["Tables"]["schedule_availabilities"]["Row"][];

type GroupedAvailabilities = Partial<Record<DayOfWeek, Availability>>;

function getAvailabilities(
  groupedAvailabilities: GroupedAvailabilities,
  date: Date,
  timezone: string
) {
  let availabilities: Availability | undefined;

  if (isMonday(date)) {
    availabilities = groupedAvailabilities.monday;
  }
  if (isTuesday(date)) {
    availabilities = groupedAvailabilities.tuesday;
  }
  if (isWednesday(date)) {
    availabilities = groupedAvailabilities.wednesday;
  }
  if (isThursday(date)) {
    availabilities = groupedAvailabilities.thursday;
  }
  if (isFriday(date)) {
    availabilities = groupedAvailabilities.friday;
  }
  if (isSaturday(date)) {
    availabilities = groupedAvailabilities.saturday;
  }
  if (isSunday(date)) {
    availabilities = groupedAvailabilities.sunday;
  }

  if (availabilities == null) return [];

  return availabilities.map(({ start_time, end_time }) => {
    const start = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(start_time.split(":")[0])),
        parseInt(start_time.split(":")[1])
      ),
      timezone
    );

    const end = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(end_time.split(":")[0])),
        parseInt(end_time.split(":")[1])
      ),
      timezone
    );

    return { start, end };
  });
}

function groupBy<T>(
  array: T[],
  keyGetter: (item: T) => string
): { [key: string]: T[] } {
  const map: { [key: string]: T[] } = {};
  array.forEach((item) => {
    const key = keyGetter(item);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(item);
  });
  return map;
}
