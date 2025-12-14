import { Router } from "express";
import {
  getGroups,
  createGroup,
  joinGroupByInviteCode,
  getUserGroups,
  getGroupDetails,
} from "../controllers/groupController.js";

const router = Router();

router.get("/", getGroups);
router.get("/user", getUserGroups);
router.get("/:groupId", getGroupDetails);
router.post("/", createGroup);
router.post("/join", joinGroupByInviteCode);
//router.post("/leave", leaveGroup);

export default router;
