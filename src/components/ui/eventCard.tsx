import { formatEventDescription } from "@/lib/helpers/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import Link from "next/link";
import CopyEventButton from "./copyEventButton";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  isActive: boolean;
  name: string;
  description: string | null;
  durationInMinutes: number;
  userId: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  isActive,
  name,
  description,
  durationInMinutes,
  userId,
}) => {
  console.log(isActive);

  return (
    <Card className={cn("flex flex-col", !isActive && "border-secondary/50")}>
      <CardHeader className={cn(!isActive && "opacity-50")}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description !== null && (
        <CardContent className={cn(!isActive && "opacity-50")}>
          {description}
        </CardContent>
      )}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        {isActive && (
          <CopyEventButton variant="outline" eventId={id} userId={userId} />
        )}
        <Button asChild>
          <Link href={`/dashboard/events/${id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
