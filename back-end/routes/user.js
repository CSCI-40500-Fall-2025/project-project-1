import { Router } from "express";
// import { createUser } from "../controllers/userController.js";
import { getUsers, createUser } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);


export default router;
