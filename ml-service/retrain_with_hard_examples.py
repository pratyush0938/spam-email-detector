import re
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from scipy.sparse import hstack, csr_matrix


# ----------------------------
# 1. Load original + hard addon
# ----------------------------
df_main = pd.read_csv("spam_email_dataset.csv")
df_hard = pd.read_csv("hard_train_addon.csv")

print("Original dataset shape:", df_main.shape)
print("Hard addon shape:", df_hard.shape)

# make sure same base columns exist
required_columns = [
    "subject",
    "email_text",
    "num_words",
    "num_characters",
    "num_exclamation_marks",
    "num_links",
    "has_suspicious_link",
    "num_attachments",
    "has_attachment",
    "sender_reputation_score",
    "email_hour",
    "email_day_of_week",
    "is_weekend",
    "num_recipients",
    "contains_money_terms",
    "contains_urgency_terms",
    "label",
]

# prepare hard addon missing columns
for col in required_columns:
    if col not in df_hard.columns:
        df_hard[col] = 0

# fill hard addon engineered defaults from text
def compute_basic_features(row):
    subject = str(row["subject"])
    email_text = str(row["email_text"])
    combined = (subject + " " + email_text).lower()

    return pd.Series({
        "num_words": len(email_text.split()),
        "num_characters": len(email_text),
        "num_exclamation_marks": email_text.count("!"),
        "num_links": len(re.findall(r"http\S+|www\S+", email_text)),
        "has_suspicious_link": 1 if len(re.findall(r"http\S+|www\S+", email_text)) > 0 else 0,
        "num_attachments": 0,
        "has_attachment": 0,
        "sender_reputation_score": 45,
        "email_hour": 12,
        "email_day_of_week": 1,
        "is_weekend": 0,
        "num_recipients": 1,
        "contains_money_terms": 1 if any(word in combined for word in ["money", "cash", "prize", "reward", "refund"]) else 0,
        "contains_urgency_terms": 1 if any(word in combined for word in ["urgent", "immediately", "now", "limited", "verify"]) else 0,
    })

df_hard[[
    "num_words",
    "num_characters",
    "num_exclamation_marks",
    "num_links",
    "has_suspicious_link",
    "num_attachments",
    "has_attachment",
    "sender_reputation_score",
    "email_hour",
    "email_day_of_week",
    "is_weekend",
    "num_recipients",
    "contains_money_terms",
    "contains_urgency_terms",
]] = df_hard.apply(compute_basic_features, axis=1)

df_main = df_main[required_columns].copy()
df_hard = df_hard[required_columns].copy()

df = pd.concat([df_main, df_hard], ignore_index=True)

print("Combined dataset shape:", df.shape)


# ----------------------------
# 2. Clean values
# ----------------------------
for col in ["subject", "email_text"]:
    df[col] = df[col].fillna("")

numeric_columns = [
    "num_words",
    "num_characters",
    "num_exclamation_marks",
    "num_links",
    "has_suspicious_link",
    "num_attachments",
    "has_attachment",
    "sender_reputation_score",
    "email_hour",
    "email_day_of_week",
    "is_weekend",
    "num_recipients",
    "contains_money_terms",
    "contains_urgency_terms",
]

for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)


# ----------------------------
# 3. Clean text
# ----------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " URL ", text)
    text = re.sub(r"\S+@\S+", " EMAIL ", text)
    text = re.sub(r"\d+", " NUMBER ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


df["clean_subject"] = df["subject"].apply(clean_text)
df["clean_email_text"] = df["email_text"].apply(clean_text)
df["combined_text"] = df["clean_subject"] + " " + df["clean_email_text"]


# ----------------------------
# 4. Extra engineered features
# ----------------------------
spam_keywords = [
    "free", "winner", "win", "claim", "urgent", "reward", "lottery",
    "offer", "limited", "click", "cash", "money", "prize", "bonus",
    "congratulations", "verify", "account", "blocked", "immediately",
    "refund", "kyc", "wallet", "password", "suspended"
]

def count_spam_keywords(text):
    words = text.split()
    return sum(1 for word in words if word in spam_keywords)

df["spam_keyword_count"] = df["combined_text"].apply(count_spam_keywords)
df["subject_length"] = df["subject"].apply(lambda x: len(str(x)))
df["email_length"] = df["email_text"].apply(lambda x: len(str(x)))

engineered_columns = [
    "spam_keyword_count",
    "subject_length",
    "email_length",
]

all_numeric_features = numeric_columns + engineered_columns


# ----------------------------
# 5. Drop duplicates
# ----------------------------
before_rows = len(df)
df = df.drop_duplicates(subset=["combined_text", "label"])
after_rows = len(df)

print("Removed duplicates:", before_rows - after_rows)
print("Final dataset shape:", df.shape)


# ----------------------------
# 6. Vectorize + scale
# ----------------------------
X_text = df["combined_text"]
X_numeric = df[all_numeric_features]
y = df["label"]

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=9000,
    ngram_range=(1, 2)
)

X_text_vec = vectorizer.fit_transform(X_text)

scaler = StandardScaler()
X_num_scaled = scaler.fit_transform(X_numeric)
X_num_sparse = csr_matrix(X_num_scaled)

X_final = hstack([X_text_vec, X_num_sparse])


# ----------------------------
# 7. Train final model
# ----------------------------
model = LogisticRegression(max_iter=3000, class_weight="balanced")
model.fit(X_final, y)

print("Retraining complete.")

joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(True, "use_numeric.pkl")
joblib.dump(all_numeric_features, "numeric_features.pkl")

print("Saved updated model files:")
print("- model.pkl")
print("- vectorizer.pkl")
print("- scaler.pkl")
print("- use_numeric.pkl")
print("- numeric_features.pkl")