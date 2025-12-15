import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  getAllEventsForUser,
  getAllEventsForGroup,
  getAllMembersEventsForGroup,
  increaseAttendees,
  createEventAndEventParticipants,
  getEventById,
  getEventAndParticipantsById,
  attendEvent,
  unattendEvent,
  checkUserAttendance,
} from "../controllers/eventController.js";
import { authMiddleware } from "../services/authMiddleware.js";

const router = Router();

// Static routes must come before parameterized routes
router.get("/", getAllEvents);
router.get("/user", authMiddleware, getAllEventsForUser);
// check if user is logged in. Returns { id, username, email} if they are
router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

// Specific paths with parameters (more specific than :event_id)
router.get("/group/:groupId", getAllEventsForGroup);
router.get("/group/:groupId/members", getAllMembersEventsForGroup);
router.get("/:event_id/with-participants", getEventAndParticipantsById);

// Parameterized routes (must come after all static and specific routes)
router.get("/:event_id", getEventById);

// POST routes - static before parameterized
router.post("/", authMiddleware, createEvent);
router.post("/with-participants", createEventAndEventParticipants);

// Other HTTP methods
router.delete("/:event_id", deleteEvent);
router.put("/:event_id", updateEvent);
router.patch("/:event_id/attendees", increaseAttendees);

// Event attendance routes (must come after other :event_id routes but before generic ones)
router.post("/:event_id/attend", authMiddleware, attendEvent);
router.post("/:event_id/unattend", authMiddleware, unattendEvent);
router.get("/:event_id/attendance", authMiddleware, checkUserAttendance);

export default router;
