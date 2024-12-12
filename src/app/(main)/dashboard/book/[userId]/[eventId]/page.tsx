import { getEventById } from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  addMonths,
  eachMinuteOfInterval,
  endOfDay,
  roundToNearestMinutes,
} from "date-fns";
import { getValidTimesFromSchedule } from "@/lib/helpers/validTimesFromSchedule";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/auth-js";
import { MeetingForm } from "@/components/forms/MeetingForm";

const BookEventPage = async ({
  params: { userId, eventId },
}: {
  params: { userId: string; eventId: string };
}) => {
  const event = await getEventById(userId, eventId);

  if (event == null) return notFound();

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: "ceil",
  });

  const endDate = endOfDay(addMonths(startDate, 2));

  const validTimes = await getValidTimesFromSchedule(
    eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 10 }),
    event
  );

  if (validTimes.length === 0) {
    return <NoTimeSlots event={event} calendarUser={user} />;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {user.email?.split("@")[0]}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <MeetingForm
          validTimes={validTimes}
          eventId={event.id}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
};

export default BookEventPage;

function NoTimeSlots({
  event,
  calendarUser,
}: {
  event: { name: string; description: string | null };
  calendarUser: SupabaseUser;
}) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.email?.split("@")[0]}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {calendarUser.email?.split("@")[0]} is currently booked up. Please check
        back later or choose a shorter event.
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/dashboard/book/${calendarUser.id}`}>
            Choose Another Event
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
