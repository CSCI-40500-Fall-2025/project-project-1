import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.js";
import cookieParser from "cookie-parser";
// import functions from "firebase-functions";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend URL, set to actual url in production
  credentials: true,
}));
app.use(express.json()); // parse JSON request body
app.use(cookieParser()); // parse cookies

app.use("/api/user", userRoutes);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hi this is server" });
});



// Start server (if running locally)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
