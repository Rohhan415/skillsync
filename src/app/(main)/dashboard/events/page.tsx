import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { getEvents, getPrivateWorkspaces } from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeftFromLine, CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/ui/eventCard";
import NewEvent from "@/components/calendar/newEvent";

export const revalidate = 0;

const EventsPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const events = await getEvents(user.id);
  const privateWWorkspaces = await getPrivateWorkspaces(user.id);

  return (
    <div className="w-full mx-auto px-6 lg:px-8 py-10 bg-background">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-card p-6 rounded-xl border text-card-foreground shadow">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight  text-foreground">
          Let&apos;s work on your events
        </h1>
        <div className="flex gap-4">
          <Button asChild>
            <NewEvent className="">
              <CalendarPlus />
              New Event
            </NewEvent>
          </Button>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href={`/dashboard/${privateWWorkspaces[0].id}`}>
              <span> Return to Workspace</span>
              <ArrowLeftFromLine />
            </Link>
          </Button>
        </div>
      </div>
      {events.length > 0 ? (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {events.map((event) => {
            const eventProps = {
              ...event,
              durationInMinutes: event.duration_in_minutes,
              isActive: event.is_active,
              userId: event.user_id,
              eventHour: event.event_hour,
              eventDate: event.event_date,
            };
            return <EventCard key={event.id} {...eventProps} />;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-6 mt-10">
          <CalendarRange className="h-16 w-16 text-gray-400" />
          <p className="text-lg text-gray-600">
            You do not have any events yet. Create your first event to get
            started!
          </p>
          <Button size="lg" className="text-lg px-6 py-3" asChild>
            <NewEvent className="">
              <CalendarPlus />
              New Event
            </NewEvent>
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
