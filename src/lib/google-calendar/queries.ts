import { google } from "googleapis";
import oauth2Client from "@/lib/serverActions/google-auth";

export async function getGoogleCalendarEvents() {
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary", // Use 'primary' for the main calendar
      timeMin: new Date().toISOString(), // Only get events from now onward
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items.map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date, // Handle both date and dateTime
      end: event.end.dateTime || event.end.date,
    }));

    return events;
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return [];
  }
}
