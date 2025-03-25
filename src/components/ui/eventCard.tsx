import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./card";

import { cn } from "@/lib/utils";
import CustomDialogTrigger from "../global/custom-dialog";
import EventForm from "@/components/calendar/EventForm";

interface EventCardProps {
  id?: string;
  isActive: boolean;
  name: string;
  description: string | null;
  durationInMinutes: number;
  eventDate: string;
  eventHour: string;
  userId: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  isActive,
  name,
  description,
  durationInMinutes,
  eventDate,
  eventHour,
}) => {
  return (
    <Card className={cn("flex flex-col", !isActive && "border-secondary/50")}>
      <CardHeader className={cn(!isActive && "opacity-50")}>
        <div className="flex justify-between">
          {" "}
          <CardTitle>{name}</CardTitle>
          <CardDescription className="text-xs">
            Duration: <span className="text-primary">{durationInMinutes}</span>
          </CardDescription>
        </div>

        <CardDescription className="flex gap-4">
          <span>
            <span>The time: </span>
            <span className="text-primary">{eventHour}</span>
          </span>
          <span>
            <span>Date: </span>
            <span className="text-primary">{eventDate}</span>
          </span>
        </CardDescription>
      </CardHeader>
      {description && (
        <CardContent className={cn(!isActive && "opacity-50")}>
          {description}
        </CardContent>
      )}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        {isActive ? (
          <CustomDialogTrigger
            header="Edit Event"
            className="inline-block"
            content={
              <EventForm
                event={{
                  id,
                  name,
                  description: description ?? undefined,
                  event_hour: eventHour,
                  duration_in_minutes: 60,
                  is_active: isActive,
                  event_date: eventDate,
                }}
              />
            }
          >
            <div className={buttonStyles}>Edit</div>
          </CustomDialogTrigger>
        ) : (
          <CustomDialogTrigger
            header="Edit Event"
            className="inline-block"
            content={
              <EventForm
                event={{
                  id,
                  name,
                  description: description ?? undefined,
                  event_hour: eventHour,
                  duration_in_minutes: 60,
                  is_active: isActive,
                  event_date: eventDate,
                }}
              />
            }
          >
            <div className={buttonStyles}>Edit</div>
          </CustomDialogTrigger>
        )}
      </CardFooter>
    </Card>
  );
};

const buttonStyles = `
  inline-flex items-center px-8 py-2 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
  ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background 
  hover:bg-accent hover:text-accent-foreground
`;
