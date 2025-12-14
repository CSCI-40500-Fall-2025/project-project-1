import type { Event } from "../const";
const API_URL = "http://localhost:3000/api"; //"https://project-project-1.onrender.com/api"//

export async function getUserEvents(): Promise<Event[]> {
  const res = await fetch(`${API_URL}/events/user`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch calendar");
  }

  return res.json();
}

export async function createEvent(event: Partial<Event>): Promise<Event> {
  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    throw new Error("Failed to create event");
  }
  const newEvent: Event = await res.json();
  return newEvent;
}

export async function updateEvent(
  eventId: string,
  event: Partial<Event>
): Promise<Event> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    throw new Error("Failed to update event");
  }
  const updatedEvent: Event = await res.json();
  return updatedEvent;
}

export async function getGroupEvents(groupId: string): Promise<Event[]> {
  const res = await fetch(`${API_URL}/events/group/${groupId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch group events");
  }
  return res.json();
}

// export async function upsertCalendar(calendar: CalendarEvent[]): Promise<Calendar> {
//     const res = await fetch(`${API_URL}/calendar/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(calendar),
//     });

//     if (!res.ok) {
//         throw new Error("Failed to upsert calendar");
//     }

//     const updatedCalendar: Calendar= await res.json();
//     return updatedCalendar;
// }
