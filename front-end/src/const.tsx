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

export const APP_NAME = "Socialite";
