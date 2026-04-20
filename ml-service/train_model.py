import re
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from scipy.sparse import hstack, csr_matrix


# ----------------------------
# 1. Load dataset
# ----------------------------
df = pd.read_csv("spam_email_dataset.csv")

print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())


# ----------------------------
# 2. Keep important columns
# ----------------------------
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

df = df[required_columns].copy()


# ----------------------------
# 3. Handle missing values
# ----------------------------
text_columns = ["subject", "email_text"]
for col in text_columns:
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
# 4. Text cleaning
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
# 5. Feature engineering
# ----------------------------
spam_keywords = [
    "free", "winner", "win", "claim", "urgent", "reward", "lottery",
    "offer", "limited", "click", "cash", "money", "prize", "bonus",
    "congratulations", "verify", "account", "blocked", "immediately"
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
# 6. Remove duplicates
# ----------------------------
before_rows = len(df)
df = df.drop_duplicates(subset=["combined_text", "label"])
after_rows = len(df)

print(f"\nRemoved duplicates: {before_rows - after_rows}")
print(f"New shape: {df.shape}")


# ----------------------------
# 7. Features and target
# ----------------------------
X_text = df["combined_text"]
X_numeric = df[all_numeric_features]
y = df["label"]


# ----------------------------
# 8. Train-test split
# ----------------------------
X_text_train, X_text_test, X_num_train, X_num_test, y_train, y_test = train_test_split(
    X_text,
    X_numeric,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ----------------------------
# 9. TF-IDF for text
# ----------------------------
vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=7000,
    ngram_range=(1, 2)
)

X_text_train_vec = vectorizer.fit_transform(X_text_train)
X_text_test_vec = vectorizer.transform(X_text_test)


# ----------------------------
# 10. Scale numeric features
# ----------------------------
scaler = StandardScaler()
X_num_train_scaled = scaler.fit_transform(X_num_train)
X_num_test_scaled = scaler.transform(X_num_test)

X_num_train_sparse = csr_matrix(X_num_train_scaled)
X_num_test_sparse = csr_matrix(X_num_test_scaled)


# ----------------------------
# 11. Combine text + numeric
# ----------------------------
X_train_final = hstack([X_text_train_vec, X_num_train_sparse])
X_test_final = hstack([X_text_test_vec, X_num_test_sparse])


# ----------------------------
# 12. Train models
# ----------------------------
nb_model = MultinomialNB()
# NB non-negative values पसंद करता है, so only text features use करेंगे
nb_model.fit(X_text_train_vec, y_train)
nb_pred = nb_model.predict(X_text_test_vec)
nb_acc = accuracy_score(y_test, nb_pred)

lr_model = LogisticRegression(max_iter=2000)
lr_model.fit(X_train_final, y_train)
lr_pred = lr_model.predict(X_test_final)
lr_acc = accuracy_score(y_test, lr_pred)


# ----------------------------
# 13. Compare models
# ----------------------------
print("\nModel Comparison:")
print(f"Naive Bayes Accuracy (Text only): {nb_acc * 100:.2f}%")
print(f"Logistic Regression Accuracy (Text + Numeric): {lr_acc * 100:.2f}%")


if lr_acc >= nb_acc:
    best_model = lr_model
    best_predictions = lr_pred
    best_model_name = "Logistic Regression (Text + Numeric)"
    use_numeric = True
else:
    best_model = nb_model
    best_predictions = nb_pred
    best_model_name = "Multinomial Naive Bayes (Text only)"
    use_numeric = False


print(f"\nBest Model Selected: {best_model_name}")


# ----------------------------
# 14. Evaluation
# ----------------------------
best_acc = accuracy_score(y_test, best_predictions)

print(f"\nBest Model Accuracy: {best_acc * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, best_predictions))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, best_predictions))


# ----------------------------
# 15. Save all required files
# ----------------------------
joblib.dump(best_model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(use_numeric, "use_numeric.pkl")
joblib.dump(all_numeric_features, "numeric_features.pkl")

print("\nSaved files:")
print("- model.pkl")
print("- vectorizer.pkl")
print("- scaler.pkl")
print("- use_numeric.pkl")
print("- numeric_features.pkl")