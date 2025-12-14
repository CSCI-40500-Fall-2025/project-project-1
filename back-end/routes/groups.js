import { Router } from "express";
import {
  getGroups,
  createGroup,
  joinGroupByInviteCode,
  getUserGroups,
} from "../controllers/groupController.js";

const router = Router();

router.get("/", getGroups);
router.get("/user", getUserGroups);
router.post("/", createGroup);
router.post("/join", joinGroupByInviteCode);
//router.post("/leave", leaveGroup);

export default router;
