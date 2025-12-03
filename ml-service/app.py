from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import joblib

app = Flask(__name__)
CORS(app)

class TimeSlotRecommender:
    def __init__(self):
        self.model = None
        self.model_path = 'models/time_slot_model.pkl'
        # Try to load trained model if available
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print('Loaded ML model from', self.model_path)
            except Exception as e:
                print('Failed to load model:', e)
        
    def extract_features(self, events, target_date=None):
        """Extract features from user's event history"""
        if target_date is None:
            target_date = datetime.now()
            
        df = pd.DataFrame(events)

        # Normalize to a single event start timestamp field (support both 'start_time'/'end_time' and legacy 'event_datetime')
        if 'start_time' in df.columns:
            df['start_time'] = pd.to_datetime(df['start_time'])
        elif 'event_datetime' in df.columns:
            df['start_time'] = pd.to_datetime(df['event_datetime'])
        else:
            # nothing meaningful to extract
            df['start_time'] = pd.to_datetime(pd.Series([target_date]*len(df)))

        # Time-based features
        df['hour'] = df['start_time'].dt.hour
        df['day_of_week'] = df['start_time'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['month'] = df['start_time'].dt.month
        
        # Preference patterns
        preferred_hours = df['hour'].value_counts().head(3).index.tolist()
        preferred_days = df['day_of_week'].value_counts().head(2).index.tolist()
        
        return {
            'preferred_hours': preferred_hours,
            'preferred_days': preferred_days,
            'avg_hour': df['hour'].mean(),
            'weekend_preference': df['is_weekend'].mean()
        }
    
    def find_available_slots(self, existing_events, date_range_start, date_range_end, duration_hours=1):
        """Find available time slots avoiding conflicts"""
        existing_events_df = pd.DataFrame(existing_events)

        # Normalize start/end times for robust conflict checking
        if 'start_time' in existing_events_df.columns and 'end_time' in existing_events_df.columns:
            existing_events_df['start_time'] = pd.to_datetime(existing_events_df['start_time'])
            existing_events_df['end_time'] = pd.to_datetime(existing_events_df['end_time'])
        elif 'event_datetime' in existing_events_df.columns:
            existing_events_df['start_time'] = pd.to_datetime(existing_events_df['event_datetime'])
            existing_events_df['end_time'] = existing_events_df['start_time'] + timedelta(hours=1)
        else:
            # no existing events
            existing_events_df = pd.DataFrame(columns=['start_time', 'end_time'])

        # Generate potential slots (9 AM - 6 PM, every hour)
        current = date_range_start
        available_slots = []

        while current < date_range_end:
            slot_end = current + timedelta(hours=duration_hours)

            # Check for conflicts using interval overlap logic
            has_conflict = False
            for _, event in existing_events_df.iterrows():
                event_start = event['start_time']
                event_end = event['end_time']

                # If event_end or event_start are NaT, skip
                if pd.isna(event_start) or pd.isna(event_end):
                    continue

                # Overlap occurs when event_start < slot_end AND event_end > current
                if (event_start < slot_end) and (event_end > current):
                    has_conflict = True
                    break

            # Business hours: allow slots that start between 9 and 17 (inclusive start, exclusive end)
            if not has_conflict and 9 <= current.hour < 18:
                available_slots.append(current)

            current += timedelta(hours=1)

        return available_slots
    
    def score_slots(self, available_slots, preferences):
        """Score available slots based on user preferences"""
        scored_slots = []

        # If a trained model is available, use it to score candidates
        if self.model is not None:
            # Build feature matrix rows for each slot
            rows = []
            for slot in available_slots:
                rows.append({
                    'hour': slot.hour,
                    'day_of_week': slot.weekday(),
                    'is_weekend': 1 if slot.weekday() in [5, 6] else 0,
                    'duration_hours': 1,
                })

            X = pd.DataFrame(rows)
            try:
                probs = self.model.predict_proba(X)[:, 1]
            except Exception:
                probs = self.model.predict(X)

            for slot, prob in zip(available_slots, probs):
                scored_slots.append({
                    'datetime': slot.isoformat(),
                    'score': float(prob * 100),
                    'hour': slot.hour,
                    'day': slot.strftime('%A'),
                    'date': slot.strftime('%Y-%m-%d')
                })

            scored_slots.sort(key=lambda x: x['score'], reverse=True)
            return scored_slots[:5]

        # Fallback heuristic scoring
        for slot in available_slots:
            score = 0

            if slot.hour in preferences['preferred_hours']:
                score += 30

            if slot.weekday() in preferences['preferred_days']:
                score += 20

            hour_diff = abs(slot.hour - preferences['avg_hour'])
            score += max(0, 10 - hour_diff)

            is_weekend = slot.weekday() in [5, 6]
            if is_weekend and preferences['weekend_preference'] > 0.3:
                score += 15
            elif not is_weekend and preferences['weekend_preference'] < 0.3:
                score += 15

            scored_slots.append({
                'datetime': slot.isoformat(),
                'score': score,
                'hour': slot.hour,
                'day': slot.strftime('%A'),
                'date': slot.strftime('%Y-%m-%d')
            })

        scored_slots.sort(key=lambda x: x['score'], reverse=True)
        return scored_slots[:5]

recommender = TimeSlotRecommender()

@app.route('/api/ml/recommend-timeslots', methods=['POST'])
def recommend_timeslots():
    """
    Recommend optimal time slots for a new event
    
    Expected JSON body:
    {
        "user_id": "string",
        "existing_events": [...],  // User's event history
        "date_range_start": "2025-12-01T00:00:00",
        "date_range_end": "2025-12-07T23:59:59",
        "duration_hours": 1
    }
    """
    try:
        data = request.json
        
        existing_events = data.get('existing_events', [])
        date_range_start = datetime.fromisoformat(data['date_range_start'])
        date_range_end = datetime.fromisoformat(data['date_range_end'])
        duration_hours = data.get('duration_hours', 1)
        
        # Extract user preferences from history
        if existing_events:
            preferences = recommender.extract_features(existing_events)
        else:
            # Default preferences for new users
            preferences = {
                'preferred_hours': [10, 14, 15],
                'preferred_days': [1, 2, 3],  # Tue, Wed, Thu
                'avg_hour': 13,
                'weekend_preference': 0.2
            }
        
        # Find available slots
        available_slots = recommender.find_available_slots(
            existing_events,
            date_range_start,
            date_range_end,
            duration_hours
        )
        
        # Score and rank slots
        recommendations = recommender.score_slots(available_slots, preferences)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'preferences_used': preferences
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Time Slot Recommender'
    })

if __name__ == '__main__':
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Run the app
    app.run(host='0.0.0.0', port=5001, debug=True)
