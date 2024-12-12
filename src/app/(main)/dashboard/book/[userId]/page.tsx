import { getCalendarEvents } from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import BookingEventCard from "@/components/ui/eventCardBooking";

export const revalidate = 0;

export default async function BookingPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const events = await getCalendarEvents(user?.id);

  if (events.length === 0) return notFound();

  const fullName = user?.email?.split("@")[0] ?? "Unknown User";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-4xl md:text-5xl font-semibold mb-4 text-center">
        {fullName}
      </div>
      <div className="text-muted-foreground mb-6 max-w-sm mx-auto text-center">
        Welcome to my scheduling page. Please follow the instructions to add an
        event to my calendar.
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {events.map((event) => (
          <BookingEventCard key={event.id} {...event} />
        ))}
      </div>
    </div>
  );
}
