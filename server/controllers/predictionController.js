import Prediction from "../models/Prediction.js";
import { getSpamPrediction } from "../services/mlService.js";
import { analyzeSenderEmail } from "../utils/senderAnalyzer.js";

export const predictEmail = async (req, res) => {
  try {
    const { sender_email = "", subject = "", email_text = "" } = req.body;

    if (!email_text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email text is required",
      });
    }

    const mlResult = await getSpamPrediction(subject, email_text);
    const senderCheck = analyzeSenderEmail(sender_email);

    let finalPrediction = mlResult.prediction;
    let finalLabel = mlResult.label;
    let finalConfidence = mlResult.confidence;

    const spamProbability = mlResult.spam_probability || 0;
    const senderRisk = senderCheck.sender_risk_score || 0;

    // -----------------------------
    // SMART DECISION LOGIC
    // -----------------------------

    // Case 1: ML already says spam
    if (mlResult.prediction === "spam") {
      finalPrediction = "spam";
      finalLabel = 1;
      finalConfidence = Math.max(mlResult.confidence, 75);
    }

    // Case 2: ML says suspicious
    else if (mlResult.prediction === "suspicious") {
      // If sender is highly suspicious too, push towards spam
      if (senderCheck.sender_analysis === "highly suspicious") {
        finalPrediction = "spam";
        finalLabel = 1;
        finalConfidence = Math.max(mlResult.confidence, 80);
      } else {
        finalPrediction = "suspicious";
        finalLabel = 2;
        finalConfidence = Math.max(mlResult.confidence, 60);
      }
    }

    // Case 3: ML says not spam
    else if (mlResult.prediction === "not spam") {
      // highly suspicious sender + some spam probability => suspicious or spam
      if (senderCheck.sender_analysis === "highly suspicious") {
        if (spamProbability >= 40) {
          finalPrediction = "spam";
          finalLabel = 1;
          finalConfidence = Math.max(mlResult.confidence, 78);
        } else {
          finalPrediction = "suspicious";
          finalLabel = 2;
          finalConfidence = 60;
        }
      }

      // suspicious sender + safe ML => suspicious
      else if (senderCheck.sender_analysis === "suspicious") {
        finalPrediction = "suspicious";
        finalLabel = 2;
        finalConfidence = Math.max(55, 100 - spamProbability);
      }

      // sender safe => keep not spam
      else {
        finalPrediction = "not spam";
        finalLabel = 0;
        finalConfidence = mlResult.confidence;
      }
    }

    // Extra rule: very high sender risk can upgrade suspicious to spam
    if (
      finalPrediction === "suspicious" &&
      senderRisk >= 80 &&
      spamProbability >= 35
    ) {
      finalPrediction = "spam";
      finalLabel = 1;
      finalConfidence = Math.max(finalConfidence, 80);
    }

    const savedPrediction = await Prediction.create({
      user: req.user._id,
      sender_email,
      sender_analysis: senderCheck.sender_analysis,
      sender_risk_score: senderCheck.sender_risk_score,
      sender_flags: senderCheck.sender_flags,
      subject,
      email_text,
      prediction: finalPrediction,
      label: finalLabel,
      confidence: finalConfidence,
      spam_probability: spamProbability,
    });

    res.status(201).json({
      success: true,
      message: "Prediction generated successfully",
      data: savedPrediction,
    });
  } catch (error) {
    console.error("Prediction Controller Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getPredictionHistory = async (req, res) => {
  try {
    const history = await Prediction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Get History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch prediction history",
    });
  }
};

export const clearPredictionHistory = async (req, res) => {
  try {
    await Prediction.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: "Prediction history cleared successfully",
    });
  } catch (error) {
    console.error("Clear History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to clear prediction history",
    });
  }
};
