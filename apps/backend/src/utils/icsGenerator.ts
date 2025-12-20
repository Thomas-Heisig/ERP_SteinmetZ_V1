// apps/backend/src/utils/icsGenerator.ts

interface CalendarEvent {
  id: string;
  start: string | Date;
  end: string | Date;
  title: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  category?: string;
  color?: string;
  createdBy?: string;
  attendees?: string[];
  reminders?: number[];
}

/**
 * Generate ICS (iCalendar) content from events
 */
export function createICS(events: CalendarEvent[]): string {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calendar App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((event) => {
    const eventStart = formatDateForICS(new Date(event.start));
    const eventEnd = formatDateForICS(new Date(event.end));
    
    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${event.id}`);
    ics.push(`DTSTAMP:${formatDateForICS(new Date())}`);
    if (event.allDay) {
      const startDateOnly = eventStart.split("T")[0];
      const endDateOnly = eventEnd.split("T")[0];
      ics.push(`DTSTART;VALUE=DATE:${startDateOnly}`);
      ics.push(`DTEND;VALUE=DATE:${endDateOnly}`);
      ics.push("TRANSP:TRANSPARENT");
    } else {
      ics.push(`DTSTART:${eventStart}`);
      ics.push(`DTEND:${eventEnd}`);
      ics.push("TRANSP:OPAQUE");
    }
    ics.push(`SUMMARY:${escapeICS(event.title)}`);
    
    if (event.description) {
      ics.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }
    
    if (event.location) {
      ics.push(`LOCATION:${escapeICS(event.location)}`);
    }
    
    if (event.category) {
      ics.push(`CATEGORIES:${escapeICS(event.category)}`);
    }
    
    // Optional: RFC 7986 Color support
    if (event.color) {
      ics.push(`COLOR:${escapeICS(event.color)}`);
    }

    // Organizer
    if (event.createdBy) {
      const organizer = String(event.createdBy);
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizer)) {
        ics.push(`ORGANIZER:mailto:${organizer}`);
      } else {
        ics.push(`ORGANIZER;CN:${escapeICS(organizer)}`);
      }
    }
    
    // Attendees
    if (Array.isArray(event.attendees)) {
      event.attendees.forEach((att: string) => {
        if (typeof att === "string" && att) {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(att);
          const cn = escapeICS(att);
          if (isEmail) {
            ics.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${cn}:mailto:${att}`);
          } else {
            ics.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${cn}`);
          }
        }
      });
    }
    
    // Add reminders
    event.reminders?.forEach((minutes: number) => {
      ics.push("BEGIN:VALARM");
      ics.push("TRIGGER:-PT" + minutes + "M");
      ics.push("ACTION:DISPLAY");
      ics.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)}`);
      ics.push("END:VALARM");
    });
    
    ics.push("END:VEVENT");
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

function formatDateForICS(date: Date): string {
  return date.toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}