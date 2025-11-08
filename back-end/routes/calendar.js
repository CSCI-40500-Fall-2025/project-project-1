import { Router } from "express";
import { upsertCalendar, getCalendar} from "../controllers/calendarController.js";
import { authMiddleware } from "../services/authMiddleware.js";

const router = Router();

router.get("/", getCalendar); // authmiddleware runs first to make sure user is logged in
router.post("/", upsertCalendar);

// check if user is logged in. Returns { id, username, email} if they are
router.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});

export default router;