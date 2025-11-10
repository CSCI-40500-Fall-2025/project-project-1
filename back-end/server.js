import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import calendarRoutes from "./routes/calendar.js";
import cookieParser from "cookie-parser";
import eventRoutes from "./routes/events.js";
import groupRoutes from "./routes/groups.js";

// import functions from "firebase-functions";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // frontend URL, set to actual url in production
      "https://bing-bong-77845.web.app",
    ],
    credentials: true,
  })
);

app.use(express.json()); // parse JSON request body
app.use(cookieParser()); // parse cookies

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hi this is server" });
});

app.use("/api/user", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/groups", groupRoutes);

// Start server (if running locally)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
