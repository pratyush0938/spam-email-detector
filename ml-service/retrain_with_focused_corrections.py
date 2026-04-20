import re
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from scipy.sparse import hstack, csr_matrix


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


def compute_basic_features(row, is_spam_default=0):
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
        "sender_reputation_score": 40 if is_spam_default == 1 else 65,
        "email_hour": 12,
        "email_day_of_week": 1,
        "is_weekend": 0,
        "num_recipients": 1,
        "contains_money_terms": 1 if any(
            word in combined for word in ["money", "cash", "prize", "reward", "refund", "payment", "bonus"]
        ) else 0,
        "contains_urgency_terms": 1 if any(
            word in combined for word in ["urgent", "immediately", "now", "limited", "verify", "today"]
        ) else 0,
    })


# load files
df_main = pd.read_csv("spam_email_dataset.csv")
df_hard = pd.read_csv("hard_train_addon.csv")
df_focus = pd.read_csv("focused_correction_addon.csv")

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

for col in required_columns:
    if col not in df_hard.columns:
        df_hard[col] = 0
    if col not in df_focus.columns:
        df_focus[col] = 0

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
]] = df_hard.apply(lambda row: compute_basic_features(row, row["label"]), axis=1)

df_focus[[
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
]] = df_focus.apply(lambda row: compute_basic_features(row, row["label"]), axis=1)

df_main = df_main[required_columns].copy()
df_hard = df_hard[required_columns].copy()
df_focus = df_focus[required_columns].copy()

df = pd.concat([df_main, df_hard, df_focus], ignore_index=True)

print("Original dataset:", df_main.shape)
print("Hard addon:", df_hard.shape)
print("Focused correction addon:", df_focus.shape)
print("Combined before cleaning:", df.shape)

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

df["clean_subject"] = df["subject"].apply(clean_text)
df["clean_email_text"] = df["email_text"].apply(clean_text)
df["combined_text"] = df["clean_subject"] + " " + df["clean_email_text"]

df["spam_keyword_count"] = df["combined_text"].apply(count_spam_keywords)
df["subject_length"] = df["subject"].apply(lambda x: len(str(x)))
df["email_length"] = df["email_text"].apply(lambda x: len(str(x)))

engineered_columns = [
    "spam_keyword_count",
    "subject_length",
    "email_length",
]

all_numeric_features = numeric_columns + engineered_columns

before_rows = len(df)
df = df.drop_duplicates(subset=["combined_text", "label"])
after_rows = len(df)

print("Removed duplicates:", before_rows - after_rows)
print("Final dataset shape:", df.shape)

X_text = df["combined_text"]
X_numeric = df[all_numeric_features]
y = df["label"]

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=10000,
    ngram_range=(1, 2),
    min_df=1
)

X_text_vec = vectorizer.fit_transform(X_text)

scaler = StandardScaler()
X_num_scaled = scaler.fit_transform(X_numeric)
X_num_sparse = csr_matrix(X_num_scaled)

X_final = hstack([X_text_vec, X_num_sparse])

model = LogisticRegression(
    max_iter=4000,
    class_weight="balanced"
)
model.fit(X_final, y)

joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(True, "use_numeric.pkl")
joblib.dump(all_numeric_features, "numeric_features.pkl")

print("Focused retraining complete.")
print("Saved updated model files:")
print("- model.pkl")
print("- vectorizer.pkl")
print("- scaler.pkl")
print("- use_numeric.pkl")
print("- numeric_features.pkl")