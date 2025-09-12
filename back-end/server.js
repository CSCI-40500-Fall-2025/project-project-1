import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.js";
// import functions from "firebase-functions";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "*", // allow all for now, change to frontend URL in prod
  credentials: true,
}));
app.use(express.json()); // parse JSON request body

app.use("/user", userRoutes);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hi this is server" });
});

// Start server (if running locally)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
