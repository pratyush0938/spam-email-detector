import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    sender_analysis: {
      type: String,
      default: "unknown",
    },
    sender_risk_score: {
      type: Number,
      default: 0,
    },
    sender_flags: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    email_text: {
      type: String,
      required: true,
      trim: true,
    },
    prediction: {
      type: String,
      enum: ["spam", "not spam", "suspicious"],
      required: true,
    },
    label: {
      type: Number,
      enum: [0, 1, 2],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    spam_probability: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;
