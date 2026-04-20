import axios from "axios";

export const getSpamPrediction = async (subject, email_text) => {
  try {
    const response = await axios.post(`${process.env.ML_API_URL}/predict`, {
      subject,
      email_text,
    });

    return response.data;
  } catch (error) {
    console.error("ML Service Error:", error.message);

    throw new Error(
      error.response?.data?.error || "Failed to get prediction from ML service",
    );
  }
};
