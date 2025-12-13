import { Router } from "express";
import {
  getGroups,
  createGroup,
  joinGroupByInviteCode,
} from "../controllers/groupController.js";

const router = Router();

router.get("/", getGroups);
router.post("/", createGroup);
router.post("/join", joinGroupByInviteCode);

export default router;
