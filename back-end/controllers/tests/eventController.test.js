import { getAllEvents, createEvent } from "../eventController.js";
import * as eventService from "../../services/eventService.js";

jest.mock("../../db/neon.js", () => ({
  sql: { query: jest.fn() },
}));


jest.mock("../../services/eventService.js");

let req;
let res;

beforeEach(() => {
  req = {};
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

describe("getAllEvents", () => {
  test("return all events", async () => {
    const fakeEvents = [{ event_id: 1, event_title: "Test Event" }];
    eventService.getAllEvents.mockResolvedValue(fakeEvents);

    await getAllEvents(req, res);

    expect(eventService.getAllEvents).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeEvents);
  });
});

describe("createEvent", () => {
  test("return 400 if required fields are missing", async () => {
    req = { user: {id: "u1"}, body: {} };
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Event title, start time, end time, and host are required",
    });
  });

  test("create a new event successfully", async () => {
    req = {
      user: { id: "u1" },
      body: {
        group_id: "g1",
        event_title: "New Event",
        event_description: "Event Description",
        event_datetime: "2024-07-01T10:00:00Z",
        location: "Event Location",
        event_host: "Host Name",
        attendees: 5,
        start_time: "10:00",
        end_time: "12:00"
      }
    };

    const fakeEvent = {
      event_id: 1,
      ...req.body,
    };

    eventService.createEvent.mockResolvedValue(fakeEvent);

    await createEvent(req, res);

    expect(eventService.createEvent).toHaveBeenCalledWith({
      group_id: "g1",
      event_title: "New Event",
      event_description: "Event Description",
      event_datetime: "2024-07-01T10:00:00Z",
      location: "Event Location",
      event_host: "Host Name",
      attendees: 5,
      start_time: "10:00",
      end_time: "12:00"
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeEvent);
  });

  test("handle errors in createEvent", async () => {
    req = {
      user: {id: "u1"}, 
      body: {
        group_id: "g1",
        event_title: "New Event",
        event_description: "Event Description",
        event_datetime: "2024-07-01T10:00:00Z",
        location: "Event Location",
        event_host: "Host Name",
        start_time: "10:00",
        end_time: "12:00"
      },
    };
    eventService.createEvent.mockRejectedValue(new Error("DB Error"));

    await createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Failed to create event" })
    );
  });

  test("not authorized user to create event", async () => {
    req = {
      user: null,
      body: {
        group_id: "g1",
        event_title: "New Event",
        event_description: "Event Description",
        event_datetime: "2024-07-01T10:00:00Z",
        location: "Event Location",
        event_host: "Host Name",
        start_time: "10:00",
        end_time: "12:00"
      },
    };
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });
  
});
