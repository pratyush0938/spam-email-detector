import re
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)
from scipy.sparse import hstack, csr_matrix


# ----------------------------
# 1. Load dataset
# ----------------------------
df = pd.read_csv("spam_email_dataset.csv")

print("Dataset loaded successfully!")
print("Original shape:", df.shape)


# ----------------------------
# 2. Keep required columns
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
# 6. Drop duplicates
# ----------------------------
before_rows = len(df)
df = df.drop_duplicates(subset=["combined_text", "label"])
after_rows = len(df)

print("Removed duplicates:", before_rows - after_rows)
print("New shape:", df.shape)


# ----------------------------
# 7. Prepare data
# ----------------------------
X_text = df["combined_text"]
X_numeric = df[all_numeric_features]
y = df["label"]


# ----------------------------
# 8. Holdout split
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
# 9. TF-IDF + scaling
# ----------------------------
vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=7000,
    ngram_range=(1, 2)
)

X_text_train_vec = vectorizer.fit_transform(X_text_train)
X_text_test_vec = vectorizer.transform(X_text_test)

scaler = StandardScaler()
X_num_train_scaled = scaler.fit_transform(X_num_train)
X_num_test_scaled = scaler.transform(X_num_test)

X_num_train_sparse = csr_matrix(X_num_train_scaled)
X_num_test_sparse = csr_matrix(X_num_test_scaled)

X_train_final = hstack([X_text_train_vec, X_num_train_sparse])
X_test_final = hstack([X_text_test_vec, X_num_test_sparse])


# ----------------------------
# 10. Train final logistic model
# ----------------------------
lr_model = LogisticRegression(max_iter=2000)
lr_model.fit(X_train_final, y_train)

train_pred = lr_model.predict(X_train_final)
test_pred = lr_model.predict(X_test_final)

train_prob = lr_model.predict_proba(X_train_final)[:, 1]
test_prob = lr_model.predict_proba(X_test_final)[:, 1]


# ----------------------------
# 11. Holdout metrics
# ----------------------------
print("\n" + "=" * 60)
print("HOLDOUT EVALUATION")
print("=" * 60)

print(f"Train Accuracy: {accuracy_score(y_train, train_pred) * 100:.2f}%")
print(f"Test Accuracy:  {accuracy_score(y_test, test_pred) * 100:.2f}%")

print(f"\nTest Precision: {precision_score(y_test, test_pred):.4f}")
print(f"Test Recall:    {recall_score(y_test, test_pred):.4f}")
print(f"Test F1-Score:  {f1_score(y_test, test_pred):.4f}")
print(f"Test ROC-AUC:   {roc_auc_score(y_test, test_prob):.4f}")

print("\nClassification Report:")
print(classification_report(y_test, test_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, test_pred))


# ----------------------------
# 12. Cross-validation helper
# ----------------------------
def build_features(text_series, numeric_df):
    vec = TfidfVectorizer(
        stop_words="english",
        max_features=7000,
        ngram_range=(1, 2)
    )
    scaler_local = StandardScaler()

    text_vec = vec.fit_transform(text_series)
    num_scaled = scaler_local.fit_transform(numeric_df)

    final_x = hstack([text_vec, csr_matrix(num_scaled)])
    return final_x


# ----------------------------
# 13. Cross-validation
# ----------------------------
print("\n" + "=" * 60)
print("5-FOLD CROSS VALIDATION")
print("=" * 60)

X_full_final = build_features(X_text, X_numeric)

cv_model = LogisticRegression(max_iter=2000)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scoring = {
    "accuracy": "accuracy",
    "precision": "precision",
    "recall": "recall",
    "f1": "f1",
    "roc_auc": "roc_auc",
}

cv_results = cross_validate(
    cv_model,
    X_full_final,
    y,
    cv=cv,
    scoring=scoring,
    n_jobs=None,
    return_train_score=False
)

for metric_name in scoring.keys():
    scores = cv_results[f"test_{metric_name}"]
    print(
        f"{metric_name.upper():<10} "
        f"Mean: {scores.mean():.4f} | "
        f"Std: {scores.std():.4f} | "
        f"Scores: {np.round(scores, 4)}"
    )


# ----------------------------
# 14. Leakage suspicion hints
# ----------------------------
print("\n" + "=" * 60)
print("LEAKAGE / DATASET QUALITY CHECK")
print("=" * 60)

train_acc = accuracy_score(y_train, train_pred)
test_acc = accuracy_score(y_test, test_pred)

if train_acc == 1.0 and test_acc == 1.0:
    print("Warning: Train and test accuracy are both 100%.")
    print("This may indicate:")
    print("- Dataset is extremely easy")
    print("- Engineered features are too label-revealing")
    print("- Synthetic or highly templated data")
    print("- Possible data leakage")
elif train_acc > 0.99 and test_acc > 0.99:
    print("Very high performance detected. Review dataset realism and leakage risk.")
else:
    print("Performance looks more realistic, but still review feature quality.")

print("\nLabel distribution:")
print(df["label"].value_counts())

print("\nBasic text length stats:")
print(df[["subject_length", "email_length", "spam_keyword_count"]].describe())


# ----------------------------
# 15. Baseline text-only comparison
# ----------------------------
print("\n" + "=" * 60)
print("TEXT-ONLY BASELINE COMPARISON")
print("=" * 60)

baseline_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=7000,
    ngram_range=(1, 2)
)

X_train_text_only = baseline_vectorizer.fit_transform(X_text_train)
X_test_text_only = baseline_vectorizer.transform(X_text_test)

nb_model = MultinomialNB()
nb_model.fit(X_train_text_only, y_train)

nb_pred = nb_model.predict(X_test_text_only)
nb_prob = nb_model.predict_proba(X_test_text_only)[:, 1]

print(f"Naive Bayes Accuracy:  {accuracy_score(y_test, nb_pred):.4f}")
print(f"Naive Bayes Precision: {precision_score(y_test, nb_pred):.4f}")
print(f"Naive Bayes Recall:    {recall_score(y_test, nb_pred):.4f}")
print(f"Naive Bayes F1:        {f1_score(y_test, nb_pred):.4f}")
print(f"Naive Bayes ROC-AUC:   {roc_auc_score(y_test, nb_prob):.4f}")

print("\nEvaluation complete.")