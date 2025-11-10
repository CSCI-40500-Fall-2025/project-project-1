jest.mock("../../db/neon.js", () => ({
  sql: {
    query: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock("../../db/pgPool.js", () => ({
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest
        .fn()
        .mockRejectedValue(new Error("Default DB failure from mock")),
      release: jest.fn(),
    }),
  },
}));

import * as eventService from "../eventService";
import { sql } from "../../db/neon.js";
import { pool } from "../../db/pgPool.js";

const createFakeEvent = (id = "e1", overrides = {}) => ({
  event_id: id,
  group_id: "g1",
  event_title: "Test Event",
  event_description: "Fun event description",
  event_datetime: "2025-01-01 18:00",
  location: "Park",
  event_host: "Alice",
  attendees: 1,
  ...overrides,
});

const createMockPgClient = (success = true) => {
  const client = {
    query: jest.fn(),
    release: jest.fn(),
  };

  if (success) {
    client.query.mockResolvedValue({ rows: [] });
  }

  return client;
};

describe("Event Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic CRUD Operations (Neon DB)", () => {
    const fakeEvent = createFakeEvent();
    const eventId = fakeEvent.event_id;

    describe("getAllEvents", () => {
      test("should return all events", async () => {
        const fakeEvents = [fakeEvent, createFakeEvent("e2")];
        sql.query.mockResolvedValue({ rows: fakeEvents });

        const result = await eventService.getAllEvents();

        expect(sql.query).toHaveBeenCalledWith("SELECT * FROM events");
        expect(result).toEqual(fakeEvents);
      });
    });

    describe("getEventById", () => {
      test("should return the event with the given id", async () => {
        sql.query.mockResolvedValue([fakeEvent]);

        const result = await eventService.getEventById(eventId);

        expect(sql.query).toHaveBeenCalledWith(
          expect.stringContaining("SELECT * FROM events"),
          [eventId]
        );
        expect(result).toEqual(fakeEvent);
      });
    });

    describe("getEventAndParticipantsById", () => {
      const mockParticipants = [
        { participant_id: 101, user_id: "u1" },
        { participant_id: 102, user_id: "u2" },
      ];

      const sqlRegex =
        /SELECT\s+e\.\*,\s+COALESCE\(\s*json_agg\s*\(\s*json_build_object/i;

      test("should return event data with a populated participants array", async () => {
        const dbResult = { ...fakeEvent, participants: mockParticipants };
        sql.query.mockResolvedValue([dbResult]);

        const result = await eventService.getEventAndParticipantsById(eventId);

        expect(sql.query).toHaveBeenCalledWith(
          expect.stringMatching(sqlRegex),
          [eventId]
        );
        expect(result).toEqual({
          ...fakeEvent,
          participants: mockParticipants,
        });
      });

      test("should return event data with an empty participants array when no participants exist", async () => {
        const dbResult = { ...fakeEvent, participants: [] };
        sql.query.mockResolvedValue([dbResult]);

        const result = await eventService.getEventAndParticipantsById(eventId);

        expect(sql.query).toHaveBeenCalledWith(
          expect.stringMatching(sqlRegex),
          [eventId]
        );
        expect(result.participants).toEqual([]);
        expect(result.event_id).toBe(eventId);
      });

      test("should return null if the event is not found", async () => {
        sql.query.mockResolvedValue([]);

        const result = await eventService.getEventAndParticipantsById(
          "nonexistent"
        );

        expect(sql.query).toHaveBeenCalledWith(
          expect.stringMatching(sqlRegex),
          ["nonexistent"]
        );
        expect(result).toBeNull();
      });
    });

    describe("createEvent", () => {
      const newEventData = { ...createFakeEvent() };
      delete newEventData.event_id;
      test("should insert a new event and return it", async () => {
        sql.query.mockResolvedValue([fakeEvent]);

        const result = await eventService.createEvent(newEventData);

        expect(sql.query).toHaveBeenCalledWith(
          expect.stringContaining("INSERT INTO events"),
          Object.values(newEventData)
        );
        expect(result).toEqual(fakeEvent);
      });

      test("should throw an error if insertion fails", async () => {
        const dbError = new Error("DB insertion failure");
        sql.query.mockRejectedValue(dbError);

        await expect(eventService.createEvent(newEventData)).rejects.toThrow(
          dbError.message
        );

        expect(sql.query).toHaveBeenCalledWith(
          expect.stringContaining("INSERT INTO events"),
          Object.values(newEventData)
        );
      });
    });

    describe("updateEvent", () => {
      const updates = { event_title: "Updated Title", location: "New Place" };
      const updatedEvent = createFakeEvent(eventId, updates);

      test("should update only the fields provided and return the updated event", async () => {
        sql.query.mockResolvedValue([updatedEvent]);

        const result = await eventService.updateEvent(eventId, updates);

        expect(result).toEqual(updatedEvent);
        expect(sql.query).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE events"),
          expect.arrayContaining([...Object.values(updates), eventId])
        );
      });

      test("should return null if no update data is provided", async () => {
        const result = await eventService.updateEvent(eventId, {});

        expect(result).toBeNull();
        expect(sql.query).not.toHaveBeenCalled();
      });
    });

    describe("increaseAttendees", () => {
      const newAttendees = 10;
      const updatedEvent = createFakeEvent(eventId, {
        attendees: newAttendees,
      });

      test("should update the attendees count and return the updated event", async () => {
        sql.query.mockResolvedValue([updatedEvent]);

        const result = await eventService.increaseAttendees(
          eventId,
          newAttendees
        );

        expect(result).toEqual(updatedEvent);
        expect(sql.query).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE events"),
          [newAttendees, eventId]
        );
      });
    });
  });

  // --- Tests using 'pgPool.js' (Transactions) ---
  describe("Database Client Operations (pgPool)", () => {
    let mockClient;

    beforeEach(() => {
      mockClient = createMockPgClient(true);
      pool.connect.mockResolvedValue(mockClient);
    });

    describe("deleteEvent", () => {
      test("should connect, execute delete query, and release the client", async () => {
        const eventId = "e1";
        await eventService.deleteEvent(eventId);

        expect(pool.connect).toHaveBeenCalledTimes(1);
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringContaining("DELETE FROM events"),
          [eventId]
        );
        expect(mockClient.release).toHaveBeenCalledTimes(1);
      });

      test("should rollback transaction and release client on error", async () => {
        const eventId = "e1";
        const dbError = new Error("DB failure during delete");
        mockClient.query
          .mockResolvedValueOnce({ rows: [] })
          .mockRejectedValueOnce(dbError)
          .mockResolvedValueOnce({ rows: [] });

        await expect(eventService.deleteEvent(eventId)).rejects.toThrow(
          dbError.message
        );

        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(mockClient.release).toHaveBeenCalledTimes(1);
      });
    });

    describe("createEventAndEventParticipants (Transaction)", () => {
      const eventData = { ...createFakeEvent() };
      delete eventData.event_id;
      const fakeEvent = createFakeEvent("e1", eventData);

      test("should execute a transaction (BEGIN, inserts, COMMIT) successfully", async () => {
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // 1. BEGIN
          .mockResolvedValueOnce({ rows: [fakeEvent] }) // 2. event insert
          .mockResolvedValueOnce({ rows: [] }) // 3. participant insert
          .mockResolvedValueOnce({ rows: [] }); // 4. COMMIT

        const result = await eventService.createEventAndEventParticipants(
          eventData
        );

        expect(result).toEqual(fakeEvent);
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
        expect(mockClient.release).toHaveBeenCalledTimes(1);
        expect(mockClient.query).toHaveBeenCalledTimes(4);
      });

      test("should throw an error and call ROLLBACK if any query fails", async () => {
        const dbError = new Error("Transaction DB failure");
        mockClient = createMockPgClient(false);
        pool.connect.mockResolvedValue(mockClient);

        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // 1. BEGIN
          .mockRejectedValueOnce(dbError) // 2. Fail on event insert
          .mockResolvedValueOnce({ rows: [] }); // 3. ROLLBACK (to catch the rollback call)

        await expect(
          eventService.createEventAndEventParticipants(eventData)
        ).rejects.toThrow(dbError.message);

        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(mockClient.query).not.toHaveBeenCalledWith("COMMIT");
        expect(mockClient.release).toHaveBeenCalledTimes(1);
      });
    });
  });
});
