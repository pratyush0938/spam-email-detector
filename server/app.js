import express from "express";
import cors from "cors";
import predictionRoutes from "./routes/predictionRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Spam Email Detector API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);

export default app;
