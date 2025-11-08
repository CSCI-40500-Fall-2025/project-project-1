import { Router } from "express";
import { getEvents, createEvent, deleteEvent, updateEvent } from "../controllers/eventController.js";

const router = Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.delete("/:event_id", deleteEvent);
router.put("/:event_id", updateEvent);

export default router;

