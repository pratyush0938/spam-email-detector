import express from "express";
import {
  predictEmail,
  getPredictionHistory,
  clearPredictionHistory,
} from "../controllers/predictionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/predict", protect, predictEmail);
router.get("/history", protect, getPredictionHistory);
router.delete("/clear", protect, clearPredictionHistory);

export default router;
