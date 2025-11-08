import * as eventService from "../eventService.js";
import { sql } from "../neon.js";

jest.mock("../neon.js", () => ({
  sql: {
    query: jest.fn(),
  },
}));

describe("Event Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllEvents", () => {
    test("return all events", async () => {
      const fakeEvents = [{ event_id: 1, event_title: "Test Event" }];
      sql.query.mockResolvedValue({ rows: fakeEvents });

      const result = await eventService.getAllEvents();

      expect(sql.query).toHaveBeenCalledWith("SELECT * FROM events");
      expect(result).toEqual(fakeEvents);
    });
  });

  describe("createEvent", () => {
    test("insert a new event and return it", async () => {
      const newEvent = {
        group_id: "g1",
        event_title: "Party",
        event_description: "Fun event",
        event_datetime: "2025-01-01 18:00",
        location: "Park",
        event_host: "Alice",
        attendees: 1,
      };

      sql.query.mockResolvedValue({ rows: [newEvent] });

      const result = await eventService.createEvent(newEvent);

      expect(sql.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO events"),
        [
          newEvent.group_id,
          newEvent.event_title,
          newEvent.event_description,
          newEvent.event_datetime,
          newEvent.location,
          newEvent.event_host,
          newEvent.attendees,
        ]
      );
      expect(result).toEqual(newEvent);
    });
  });

  describe("deleteEvent", () => {
    test("call sql to delete an event by id", async () => {
      const eventId = "e1";

      await eventService.deleteEvent(eventId);

      expect(sql.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM events"),
        [eventId]
      );
    });
  });

  describe("getEventById", () => {
    test("return the event with the given id", async () => {
      const eventId = "e1";
      const fakeEvent = { event_id: eventId, event_title: "Test Event" };
      sql.query.mockResolvedValue({ rows: [fakeEvent] });

      const result = await eventService.getEventById(eventId);

      expect(sql.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM events"),
        [eventId]
      );
      expect(result).toEqual(fakeEvent);
    });
  });

  describe("updateEventService", () => {
    test("update only the fields provided", async () => {
      const eventId = "e1";
      const updates = { event_title: "Updated Event", location: "New Place" };
      const fakeEvent = { ...updates, event_id: eventId };

      sql.query.mockResolvedValue([fakeEvent]);

      const result = await eventService.updateEvent(eventId, updates);

      expect(result).toEqual(fakeEvent);
      expect(sql.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE events"),
        expect.arrayContaining([updates.event_title, updates.location, eventId])
      );
    });

    test("return null if no update data is provided", async () => {
      const eventId = "e1";

      const result = await eventService.updateEvent(eventId, {});

      expect(result).toBeNull();
      expect(sql.query).not.toHaveBeenCalled();
    });
  });

  describe("updateAttendees", () => {
    test("update only the attendees count", async () => {
      const eventId = "e1";
      const newAttendees = 10;
      const fakeEvent = { event_id: eventId, attendees: newAttendees };

      sql.query.mockResolvedValue({ rows: [fakeEvent] });

      const result = await eventService.updateAttendees(eventId, newAttendees);

      expect(result).toEqual(fakeEvent);
      expect(sql.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE events"),
        [newAttendees, eventId]
      );
    });
  });
});
