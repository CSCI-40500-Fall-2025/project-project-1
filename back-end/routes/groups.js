import { Router } from "express";
import { getGroups, createGroup } from "../controllers/groupController.js";

const router = Router();

router.get("/", getGroups);
router.post("/", createGroup);

export default router;
