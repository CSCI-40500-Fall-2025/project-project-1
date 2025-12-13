import {
  getAllEvents as getAllEventsService,
  createEvent as createEventService,
  deleteEvent as deleteEventService,
  updateEvent as updateEventService,
  increaseAttendees as increaseAttendeesService,
  createEventAndEventParticipants as createEventAndEventParticipantsService,
  getEventById as getEventByIdService,
  getEventAndParticipantsById as getEventAndParticipantsByIdService,
  getAllEventsForUser as getAllEventsForUserService,
} from "../services/eventService.js";

export async function getAllEvents(req, res) {
  console.log("called getAllEvents");
  try {
    const events = await getAllEventsService();
    res.status(200).json(events);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch events", details: err.message });
  }
}

export async function getAllEventsForUser(req, res) {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({ error: "user_id required" });
    }
    const events = await getAllEventsForUserService(user_id);
    if (!events) {
      return res.status(404).json({ error: "No events found for this user" });
    }
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events for user:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch events", details: err.message });
  }
}

export async function createEvent(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    var {
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees,
      start_time,
      end_time,
      rrule,
    } = req.body;

    if (event_host === undefined || event_host === "") {
      event_host = user.id;
    }

    //should remove later, we dont need event_datetime
    if (event_datetime === undefined || event_datetime === "") {
      event_datetime = new Date().toISOString();
    }

    if (!event_title || !event_host || !start_time || !end_time) {
      return res.status(400).json({
        error: "Event title, start time, end time, and host are required",
      });
    }
    const event = await createEventService({
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees: attendees || 1,
      start_time,
      end_time,
      rrule,
    });
    res.status(201).json(event);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create event", details: err.message });
  }
}

export async function getEventById(req, res) {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    const event = await getEventByIdService(event_id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch event", details: err.message });
  }
}

export async function getEventAndParticipantsById(req, res) {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    const eventWithParticipants = await getEventAndParticipantsByIdService(
      event_id
    );
    if (!eventWithParticipants) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(eventWithParticipants);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch event", details: err.message });
  }
}

export async function createEventAndEventParticipants(req, res) {
  try {
    const {
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      start_time,
      end_time,
      rrule,
    } = req.body;

    if (
      !group_id ||
      !event_title ||
      !event_description ||
      !event_datetime ||
      !location ||
      !event_host
    ) {
      return res.status(400).json({
        error:
          "Group Id, Event title, description, date, location, and host are required",
      });
    }

    const attendees = 1;

    const event = await createEventAndEventParticipantsService({
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees,
      start_time,
      end_time,
      rrule,
    });

    res.status(201).json(event);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create event", details: err.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    const deletedEvent = await deleteEventService(event_id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
}

export async function updateEvent(req, res) {
  try {
    const { event_id } = req.params;
    const {
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees,
      start_time,
      end_time,
      rrule,
    } = req.body;

    if (
      group_id === undefined &&
      event_title === undefined &&
      event_description === undefined &&
      event_datetime === undefined &&
      location === undefined &&
      event_host === undefined &&
      attendees === undefined &&
      start_time === undefined &&
      end_time === undefined &&
      rrule === undefined
    ) {
      return res.status(400).json({
        error: "At least one field is required to update",
      });
    }

    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    const updatedEvent = await updateEventService(event_id, {
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees,
      start_time,
      end_time,
      rrule,
    });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
}

export async function increaseAttendees(req, res) {
  try {
    const { event_id } = req.params;
    const { attendees } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    if (
      attendees === undefined ||
      typeof attendees !== "number" ||
      attendees <= 0
    ) {
      return res
        .status(400)
        .json({ error: "A valid number of attendees is required" });
    }
    const updatedEvent = await increaseAttendeesService(event_id, attendees);
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ error: `No event found with event_id: ${event_id}` });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update attendees" });
  }
}
