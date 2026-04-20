import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://spam-email-detector-1-urun.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Spam Email Detector API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);

export default app;
