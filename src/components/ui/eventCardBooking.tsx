import Link from "next/link";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { formatEventDescription } from "@/lib/helpers/formatters";

type BookingEventCardProps = {
  id: string;
  name: string;
  user_id: string;
  description: string | null;
  event_hour: string;
  duration_in_minutes: number;
};

function BookingEventCard({
  id,
  name,
  description,
  user_id,
  duration_in_minutes,
}: BookingEventCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(duration_in_minutes)}
        </CardDescription>
      </CardHeader>
      {description != null && <CardContent>{description}</CardContent>}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        <Button asChild>
          <Link href={`/dashboard/book/${user_id}/${id}`}>Select</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default BookingEventCard;
