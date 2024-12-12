import "use-server";

import { google } from "googleapis";
import { auth } from "@/app/_lib/auth";
import { endOfDay, startOfDay } from "date-fns";
import { cookies } from "next/headers";
import { oAuth2Client } from "../serverActions/google-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export async function getCalendarEvents({
  start,
  end,
}: {
  start: Date;
  end: Date;
}) {
  const oAuthClient = await getOAuthClient();

  const events = await google.calendar("v3").events.list({
    auth: oAuthClient,
    calendarId: "primary",
    eventTypes: ["default"],
    singleEvents: true,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 2500,
  });

  return (
    events.data.items
      ?.map((event) => {
        if (event.start?.date && event.end?.date) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.start.date),
          };
        }

        if (event.start?.dateTime && event.end?.dateTime) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          };
        }
      })
      .filter((date) => date != null) || []
  );
}

// export async function createCalendarEvent({
//   userId,
//   guestName,
//   guestEmail,
//   startTime,
//   guestNotes,
//   durationInMinutes,
//   eventName,
// }: {
//   clerkUserId: string;
//   guestName: string;
//   guestEmail: string;
//   startTime: Date;
//   guestNotes?: string | null;
//   durationInMinutes: number;
//   eventName: string;
// }) {
//   const oAuthClient = await getOAuthClient(userId);
//   const calendarUser = await clerkClient().users.getUser(userId);
//   if (calendarUser.primaryEmailAddress == null) {
//     throw new Error("Clerk user has no email");
//   }

//   const calendarEvent = await google.calendar("v3").events.insert({
//     calendarId: "primary",
//     auth: oAuthClient,
//     sendUpdates: "all",
//     requestBody: {
//       attendees: [
//         { email: guestEmail, displayName: guestName },
//         {
//           email: calendarUser.primaryEmailAddress.emailAddress,
//           displayName: calendarUser.fullName,
//           responseStatus: "accepted",
//         },
//       ],
//       description: guestNotes ? `Additional Details: ${guestNotes}` : undefined,
//       start: {
//         dateTime: startTime.toISOString(),
//       },
//       end: {
//         dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
//       },
//       summary: `${guestName} + ${calendarUser.fullName}: ${eventName}`,
//     },
//   });

//   return calendarEvent.data;
// }

export async function getOAuthClient() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("google_access_token");
  const session = await auth();

  const token = session?.accessToken;

  if (token?.length === 0 || token === null) {
    return;
  }

  oAuth2Client.setCredentials({ access_token: accessToken?.value });

  return oAuth2Client;
}
