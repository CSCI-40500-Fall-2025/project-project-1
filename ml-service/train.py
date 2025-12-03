"""
Train a simple classifier to predict whether a candidate timeslot is likely to be accepted.
Expected input CSV: data/labels.csv with columns:
- start_time (ISO)
- end_time (ISO)
- hour
- day_of_week
- is_weekend
- duration_hours
- label (1 accepted / 0 ignored)

This script will train a LogisticRegression model and save it to models/time_slot_model.pkl
"""
import os
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, 'labels.csv')
MODEL_PATH = os.path.join(MODEL_DIR, 'time_slot_model.pkl')

if not os.path.exists(CSV_PATH):
    print(f"Label CSV not found at {CSV_PATH}. Please provide labeled data at this path.")
    exit(1)

print(f"Loading labeled data from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH)

# Basic feature preparation: hour, day_of_week, is_weekend, duration_hours
FEATURE_COLS = ['hour', 'day_of_week', 'is_weekend', 'duration_hours']
for col in FEATURE_COLS:
    if col not in df.columns:
        raise ValueError(f"Missing required column: {col}")

X = df[FEATURE_COLS].fillna(0).astype(float)
y = df['label'].astype(int)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training LogisticRegression model...")
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

print("Evaluating model...")
y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

print(f"Saving model to {MODEL_PATH}...")
joblib.dump(clf, MODEL_PATH)

print("Done.")
