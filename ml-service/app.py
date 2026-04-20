import os
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import re

app = Flask(__name__)

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")
scaler = joblib.load("scaler.pkl")
use_numeric = joblib.load("use_numeric.pkl")
numeric_features = joblib.load("numeric_features.pkl")


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " URL ", text)
    text = re.sub(r"\S+@\S+", " EMAIL ", text)
    text = re.sub(r"\d+", " NUMBER ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


spam_keywords = [
    "free", "winner", "win", "claim", "urgent", "reward", "lottery",
    "offer", "limited", "click", "cash", "money", "prize", "bonus",
    "congratulations", "verify", "account", "blocked", "immediately",
    "refund", "kyc", "wallet", "password", "suspended", "payment",
    "courier", "mailbox", "reactivation", "payroll", "invoice"
]


def count_spam_keywords(text):
    words = text.split()
    return sum(1 for word in words if word in spam_keywords)


@app.route("/", methods=["GET"])
def home():
    return "Advanced ML Service is running"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No input data provided"
            }), 400

        subject = data.get("subject", "")
        email_text = data.get("email_text", "")

        clean_subject = clean_text(subject)
        clean_email_text = clean_text(email_text)
        combined_text = clean_subject + " " + clean_email_text

        text_vector = vectorizer.transform([combined_text])

        if use_numeric:
            num_words = len(email_text.split())
            num_characters = len(email_text)
            num_exclamation_marks = email_text.count("!")
            num_links = len(re.findall(r"http\S+|www\S+", email_text))
            has_suspicious_link = 1 if num_links > 0 else 0
            num_attachments = 0
            has_attachment = 0
            sender_reputation_score = 45
            email_hour = 12
            email_day_of_week = 1
            is_weekend = 0
            num_recipients = 1

            contains_money_terms = 1 if any(
                word in combined_text
                for word in ["money", "cash", "prize", "reward", "refund", "payment", "bonus"]
            ) else 0

            contains_urgency_terms = 1 if any(
                word in combined_text
                for word in ["urgent", "immediately", "now", "limited", "verify", "today"]
            ) else 0

            spam_keyword_count = count_spam_keywords(combined_text)
            subject_length = len(subject)
            email_length = len(email_text)

            numeric_data = pd.DataFrame([{
                "num_words": num_words,
                "num_characters": num_characters,
                "num_exclamation_marks": num_exclamation_marks,
                "num_links": num_links,
                "has_suspicious_link": has_suspicious_link,
                "num_attachments": num_attachments,
                "has_attachment": has_attachment,
                "sender_reputation_score": sender_reputation_score,
                "email_hour": email_hour,
                "email_day_of_week": email_day_of_week,
                "is_weekend": is_weekend,
                "num_recipients": num_recipients,
                "contains_money_terms": contains_money_terms,
                "contains_urgency_terms": contains_urgency_terms,
                "spam_keyword_count": spam_keyword_count,
                "subject_length": subject_length,
                "email_length": email_length,
            }])

            numeric_data = numeric_data[numeric_features]
            numeric_scaled = scaler.transform(numeric_data)

            from scipy.sparse import hstack, csr_matrix
            final_features = hstack([text_vector, csr_matrix(numeric_scaled)])
        else:
            final_features = text_vector

        probabilities = model.predict_proba(final_features)[0]
        spam_prob = float(probabilities[1])

        if spam_prob >= 0.6:
            prediction_label = 1
            prediction_text = "spam"
        elif spam_prob <= 0.4:
            prediction_label = 0
            prediction_text = "not spam"
        else:
            prediction_label = 2
            prediction_text = "suspicious"

        if prediction_text == "spam":
            confidence = spam_prob
        elif prediction_text == "not spam":
            confidence = 1 - spam_prob
        else:
            confidence = 0.5

        return jsonify({
            "prediction": prediction_text,
            "label": prediction_label,
            "confidence": round(confidence * 100, 2),
            "spam_probability": round(spam_prob * 100, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# if __name__ == "__main__":
#     app.run(port=5001, debug=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=False)
