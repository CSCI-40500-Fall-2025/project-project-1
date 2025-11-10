import { getAllEvents, createEvent } from "../eventController.js";
import * as eventService from "../../services/eventService.js";

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
    req = { body: {} };
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Group Id, Event title, description, date, location, and host are required",
    });
  });

  test("create a new event successfully", async () => {
    req = {
      body: {
        group_id: "g1",
        event_title: "New Event",
        event_description: "Event Description",
        event_datetime: "2024-07-01T10:00:00Z",
        location: "Event Location",
        event_host: "Host Name",
        attendees: 5,
      },
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
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeEvent);
  });

  test("handle errors in createEvent", async () => {
    req = {
      body: {
        group_id: "g1",
        event_title: "New Event",
        event_description: "Event Description",
        event_datetime: "2024-07-01T10:00:00Z",
        location: "Event Location",
        event_host: "Host Name",
      },
    };
    eventService.createEvent.mockRejectedValue(new Error("DB Error"));

    await createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Failed to create event" })
    );
  });
});
