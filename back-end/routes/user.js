import { Router } from "express";
// import { createUser } from "../controllers/userController.js";
import { getUsers, createUser, loginUser, logoutUser } from "../controllers/userController.js";
import { authMiddleware } from "../services/authMiddleware.js";
const router = Router();

router.get("/", authMiddleware, getUsers); // authmiddleware runs first to make sure user is logged in
router.post("/", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser)

// check if user is logged in. Returns { id, username, email} if they are
router.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});

export default router;
