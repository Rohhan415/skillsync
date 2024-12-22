import EventForm from "@/components/calendar/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventById } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const revalidate = 0;

const EditEvent = async ({
  params: { eventid },
}: {
  params: { eventid: string };
}) => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const event = await getEventById(user.id, eventid);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit event</CardTitle>
        <CardContent>
          <EventForm
            event={{
              ...event,
              description: event?.description || undefined,
              event_hour: event?.event_hour || "12:00",
              event_date: event?.event_date || new Date().toISOString(),
            }}
          />
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default EditEvent;
