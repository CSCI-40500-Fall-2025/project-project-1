import type { Calendar, CalendarEvent } from "../const";
const API_URL = "https://project-project-1.onrender.com/api";

export async function getCalendar(): Promise<CalendarEvent[]> {
    const res = await fetch(`${API_URL}/calendar/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch calendar");
    }

    const calendarData: CalendarEvent[] = await res.json();
    return calendarData;
}

export async function upsertCalendar(calendar: CalendarEvent[]): Promise<Calendar> {
    const res = await fetch(`${API_URL}/calendar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(calendar),
    });

    if (!res.ok) {
        throw new Error("Failed to upsert calendar");
    }

    const updatedCalendar: Calendar= await res.json();
    return updatedCalendar;
}