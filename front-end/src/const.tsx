import type { UUID } from "crypto";

export type User = {
  userID: string;
  username: string;
  email: string;
};

export type Event = {
  event_id: string;
  group_id: string | null;
  event_title: string;
  event_description: string | null;
  location: string | null;
  event_datetime: string;
  event_host: string;
  attendees: number;
  
  start_time: Date;  
  end_time: Date; 
  rrule: any | null; 
};

export type TodayEvent = {
    eventID: number;
    eventName: string;
    eventTime: string;
    organizerName: string;
    eventDescription: string;
    location?: string;
    groupName: string
}

export type Group = {
  groupID: number;
  groupName: string;
  memberIDs: string[];
};

export type RecurrenceRule = {
  freq: number;
  count: number;
};

export type CalendarEvent = {
  title: string;
  start: Date; 
  end: Date;  
  rrule?: RecurrenceRule; 
  originalStart?: Date;
  originalEnd?: Date;
  Event: Event;
};

export type Calendar = {
  calendarID: string;
  userID: string;
  calendar_data: CalendarEvent[]; 
  updated_at: number;
};

export const APP_NAME = "Socialite";
