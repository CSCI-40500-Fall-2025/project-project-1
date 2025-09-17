import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//Middleware to check for valid JWT token in cookies (if user is logged in)
export function authMiddleware(req, res, next) {
    const token = req.cookies.token; // read the cookie called token (stored user login)
    if (!token) {
        console.log("no token")
        return res.status(401).json({ error: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info to request
        next();
    } catch (err) {
        console.log("invalid token", err.message);
        return res.status(403).json({ error: "Invalid token" });
    }
}