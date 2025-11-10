import { Router } from "express";
import { getAllEvents, createEvent, deleteEvent, updateEvent, increaseAttendees, createEventAndEventParticipants, getEventById, getEventAndParticipantsById } from "../controllers/eventController.js";


const router = Router();

router.get("/", getAllEvents);
router.get("/:event_id", getEventById);
router.get("/:event_id/with-participants", getEventAndParticipantsById);
router.post("/with-participants", createEventAndEventParticipants);
router.post("/", createEvent);
router.delete("/:event_id", deleteEvent);
router.put("/:event_id", updateEvent);
router.patch("/:event_id/attendees", increaseAttendees);


export default router;
