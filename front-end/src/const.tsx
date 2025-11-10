export type User = {
  userID: string;
  username: string;
  email: string;
};

export type Event = {
  eventID: number;
  eventName: string;
  eventDate: Date;
  eventTime: string;
  eventDescription: string;
  attendeeIDs: string[];
  organizerID: string;
    groupID?: number;
  location?: string;
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
};

export type Calendar = {
  calendarID: string;
  userID: string;
  calendar_data: CalendarEvent[]; 
  updated_at: number;
};

export const APP_NAME = "Socialite";
