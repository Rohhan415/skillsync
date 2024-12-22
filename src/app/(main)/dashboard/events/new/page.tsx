import EventForm from "@/components/calendar/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const newPage = () => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>New Event</CardTitle>
        <CardContent>
          <EventForm />
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default newPage;
