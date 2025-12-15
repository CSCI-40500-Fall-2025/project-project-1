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

export interface MemberBusyEvent {
  event_id: string;
  start_time: Date | string;
  end_time: Date | string;
  event_datetime: string;
  user_id: string;
  username: string;
}

export async function getGroupMembersEvents(
  groupId: string
): Promise<MemberBusyEvent[]> {
  const res = await fetch(`${API_URL}/events/group/${groupId}/members`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch group members events");
  }
  return res.json();
}

export async function attendEvent(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/attend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to attend event");
  }
}

export async function unattendEvent(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/unattend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to leave event");
  }
}

export async function checkUserAttendance(eventId: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/events/${eventId}/attendance`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to check attendance");
  }
  const data = await res.json();
  return data.isAttending || false;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete event");
  }
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
