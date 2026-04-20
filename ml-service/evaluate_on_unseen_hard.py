import re
import joblib
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")
scaler = joblib.load("scaler.pkl")
use_numeric = joblib.load("use_numeric.pkl")
numeric_features = joblib.load("numeric_features.pkl")

df = pd.read_csv("hard_eval_unseen.csv")

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
    "refund", "kyc", "wallet", "password", "suspended"
]

def count_spam_keywords(text):
    words = text.split()
    return sum(1 for word in words if word in spam_keywords)

df["subject"] = df["subject"].fillna("")
df["email_text"] = df["email_text"].fillna("")
df["combined_text"] = df["subject"].apply(clean_text) + " " + df["email_text"].apply(clean_text)

X_text = vectorizer.transform(df["combined_text"])
y_true = df["label"]

if use_numeric:
    numeric_data = pd.DataFrame({
        "num_words": df["email_text"].apply(lambda x: len(str(x).split())),
        "num_characters": df["email_text"].apply(lambda x: len(str(x))),
        "num_exclamation_marks": df["email_text"].apply(lambda x: str(x).count("!")),
        "num_links": df["email_text"].apply(lambda x: len(re.findall(r"http\S+|www\S+", str(x)))),
        "has_suspicious_link": df["email_text"].apply(lambda x: 1 if len(re.findall(r"http\S+|www\S+", str(x))) > 0 else 0),
        "num_attachments": 0,
        "has_attachment": 0,
        "sender_reputation_score": 45,
        "email_hour": 12,
        "email_day_of_week": 1,
        "is_weekend": 0,
        "num_recipients": 1,
        "contains_money_terms": df["combined_text"].apply(lambda x: 1 if any(word in x for word in ["money", "cash", "prize", "reward", "refund"]) else 0),
        "contains_urgency_terms": df["combined_text"].apply(lambda x: 1 if any(word in x for word in ["urgent", "immediately", "now", "limited", "verify"]) else 0),
        "spam_keyword_count": df["combined_text"].apply(count_spam_keywords),
        "subject_length": df["subject"].apply(lambda x: len(str(x))),
        "email_length": df["email_text"].apply(lambda x: len(str(x))),
    })

    numeric_data = numeric_data[numeric_features]
    numeric_scaled = scaler.transform(numeric_data)
    X_final = hstack([X_text, csr_matrix(numeric_scaled)])
else:
    X_final = X_text

y_pred = model.predict(X_final)

print("Unseen Hard Dataset Accuracy:", round(accuracy_score(y_true, y_pred) * 100, 2), "%")
print("\nClassification Report:\n")
print(classification_report(y_true, y_pred, zero_division=0))
print("Confusion Matrix:\n")
print(confusion_matrix(y_true, y_pred))

df["predicted_label"] = y_pred
df["predicted_text"] = df["predicted_label"].map({1: "spam", 0: "not spam"})

print("\nDetailed Predictions:\n")
print(df[["subject", "label", "predicted_label", "predicted_text"]])