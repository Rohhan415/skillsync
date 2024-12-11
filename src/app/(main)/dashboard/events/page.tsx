import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { getEvents } from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/ui/eventCard";

export const revalidate = 0;

const EventsPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const events = await getEvents(user.id);

  return (
    <>
      <div className="flex gap-4 items-baseline">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6">
          events
        </h1>
        <Button asChild>
          <Link href="events/new">
            <CalendarPlus className="mr-4 size-6" />
            New Event
          </Link>
        </Button>
      </div>
      {events.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
          {events.map((event) => {
            const eventProps = {
              ...event,
              durationInMinutes: event.duration_in_minutes,
              isActive: event.is_active,
              userId: event.user_id,
            };
            return <EventCard key={event.id} {...eventProps} />;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <CalendarRange className="size-16 mx-auto" />
          You do not have any events yet.Create your first event to get started!
          <Button size="lg" className="text-lg" asChild>
            <Link href="/dashboard/events/new">
              <CalendarPlus className="mr-4 size-6" />
              New Event
            </Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default EventsPage;
