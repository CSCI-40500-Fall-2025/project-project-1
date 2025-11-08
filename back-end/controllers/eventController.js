import {
  getAllEvents,
  createEvent as createEventService,
  deleteEvent as deleteEventService,
  updateEvent as updateEventService,
  updateAttendees as updateAttendeesService,
} from "../services/eventService.js";

export async function getEvents(req, res) {
  try {
    const events = await getAllEvents();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}

export async function createEvent(req, res) {
  try {
    const {
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees,
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

    const num_attendees = attendees || 0;

    const event = await createEventService({
      group_id,
      event_title,
      event_description,
      event_datetime,
      location,
      event_host,
      attendees: num_attendees,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
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
    } = req.body;

    if (
      group_id === undefined &&
      event_title === undefined &&
      event_description === undefined &&
      event_datetime === undefined &&
      location === undefined &&
      event_host === undefined &&
      attendees === undefined
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
    });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
}

export async function updateAttendees(req, res) {
  try {
    const { event_id } = req.params;
    const { attendees } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    const updatedEvent = await updateAttendeesService(event_id, attendees);
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update attendees" });
  }
}
