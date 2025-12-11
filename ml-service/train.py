"""
Train a classifier to predict optimal timeslots based on event details and temporal features.
Expected input CSV: data/labels.csv with columns:
- start_time (ISO)
- end_time (ISO)
- hour
- day_of_week
- is_weekend
- duration_hours
- event_title
- event_description
- label (1 accepted / 0 ignored)

This script extracts text features from title/description and trains a model.
"""
import os
import pandas as pd
import numpy as np
import re
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

def extract_text_features(title, description):
    """Extract semantic features from event title and description"""
    text = f"{title} {description}".lower()
    
    # Event type keywords
    is_meeting = 1 if any(kw in text for kw in ['meeting', 'call', 'sync', 'standup', 'discussion']) else 0
    is_work = 1 if any(kw in text for kw in ['work', 'project', 'deadline', 'task', 'review']) else 0
    is_social = 1 if any(kw in text for kw in ['lunch', 'dinner', 'coffee', 'happy hour', 'party']) else 0
    is_exercise = 1 if any(kw in text for kw in ['gym', 'workout', 'run', 'yoga', 'fitness']) else 0
    is_personal = 1 if any(kw in text for kw in ['doctor', 'appointment', 'dentist', 'haircut', 'personal']) else 0
    
    # Urgency/priority indicators
    is_urgent = 1 if any(kw in text for kw in ['urgent', 'asap', 'important', 'critical', 'emergency']) else 0
    
    # Time preference hints
    prefers_morning = 1 if any(kw in text for kw in ['morning', 'breakfast', 'early']) else 0
    prefers_afternoon = 1 if any(kw in text for kw in ['afternoon', 'lunch']) else 0
    prefers_evening = 1 if any(kw in text for kw in ['evening', 'dinner', 'after work']) else 0
    
    # Length features
    title_len = len(title) if pd.notna(title) else 0
    desc_len = len(description) if pd.notna(description) else 0
    
    return {
        'is_meeting': is_meeting,
        'is_work': is_work,
        'is_social': is_social,
        'is_exercise': is_exercise,
        'is_personal': is_personal,
        'is_urgent': is_urgent,
        'prefers_morning': prefers_morning,
        'prefers_afternoon': prefers_afternoon,
        'prefers_evening': prefers_evening,
        'title_len': min(title_len / 50.0, 1.0),  # normalize
        'desc_len': min(desc_len / 200.0, 1.0),   # normalize
    }

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

# Extract text features from title and description
print("Extracting text features from event titles and descriptions...")
text_features_list = []
for _, row in df.iterrows():
    title = row.get('event_title', '')
    desc = row.get('event_description', '')
    text_features_list.append(extract_text_features(title, desc))

text_features_df = pd.DataFrame(text_features_list)

# Combine temporal and text features
TEMPORAL_COLS = ['hour', 'day_of_week', 'is_weekend', 'duration_hours']
for col in TEMPORAL_COLS:
    if col not in df.columns:
        raise ValueError(f"Missing required column: {col}")

X_temporal = df[TEMPORAL_COLS].fillna(0).astype(float)
X = pd.concat([X_temporal.reset_index(drop=True), text_features_df.reset_index(drop=True)], axis=1)
y = df['label'].astype(int)

print(f"Training with {len(X.columns)} features: {list(X.columns)}")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training LogisticRegression model...")
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

print("Evaluating model...")
y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

print(f"Saving time slot model to {MODEL_PATH}...")
joblib.dump(clf, MODEL_PATH)

# Train a separate model for duration prediction
print("\n" + "="*50)
print("Training duration prediction model...")
print("="*50)

DURATION_MODEL_PATH = os.path.join(MODEL_DIR, 'duration_model.pkl')

# Use only text features + historical duration for duration prediction
X_duration = text_features_df.copy()
y_duration = df['duration_hours'].fillna(1.0).astype(float)

print(f"Training duration model with {len(X_duration.columns)} features")
print(f"Duration range: {y_duration.min():.1f} to {y_duration.max():.1f} hours")

X_dur_train, X_dur_test, y_dur_train, y_dur_test = train_test_split(
    X_duration, y_duration, test_size=0.2, random_state=42
)

# Use regression for duration prediction
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

dur_model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
dur_model.fit(X_dur_train, y_dur_train)

y_dur_pred = dur_model.predict(X_dur_test)
mae = mean_absolute_error(y_dur_test, y_dur_pred)
r2 = r2_score(y_dur_test, y_dur_pred)

print(f"\nDuration Model Performance:")
print(f"  Mean Absolute Error: {mae:.2f} hours")
print(f"  R² Score: {r2:.3f}")
print(f"\nExample predictions:")
for i in range(min(5, len(X_dur_test))):
    print(f"  Actual: {y_dur_test.iloc[i]:.1f}h, Predicted: {y_dur_pred[i]:.1f}h")

print(f"\nSaving duration model to {DURATION_MODEL_PATH}...")
joblib.dump(dur_model, DURATION_MODEL_PATH)

print("\nDone. Both models trained successfully!")
