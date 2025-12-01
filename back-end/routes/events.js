import { Router } from "express";
import { getAllEvents, createEvent, deleteEvent, updateEvent, getAllEventsForUser, increaseAttendees, createEventAndEventParticipants, getEventById, getEventAndParticipantsById } from "../controllers/eventController.js";
import { authMiddleware } from "../services/authMiddleware.js";

const router = Router();

router.get("/user", authMiddleware, getAllEventsForUser);
router.get("/:event_id/with-participants", getEventAndParticipantsById);
router.get("/:event_id", getEventById);

router.get("/", getAllEvents);
router.post("/", authMiddleware, createEvent);
router.post("/with-participants", createEventAndEventParticipants);
router.delete("/:event_id", deleteEvent);
router.put("/:event_id", updateEvent);
router.patch("/:event_id/attendees", increaseAttendees);

// check if user is logged in. Returns { id, username, email} if they are
router.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});

export default router;
