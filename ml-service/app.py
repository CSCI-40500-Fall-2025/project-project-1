from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import joblib
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "supports_credentials": True}})

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
    
    def extract_text_features(self, title, description):
        """Extract semantic features from event title and description"""
        text = f"{title} {description}".lower()
        
        is_meeting = 1 if any(kw in text for kw in ['meeting', 'call', 'sync', 'standup', 'discussion']) else 0
        is_work = 1 if any(kw in text for kw in ['work', 'project', 'deadline', 'task', 'review']) else 0
        is_social = 1 if any(kw in text for kw in ['lunch', 'dinner', 'coffee', 'happy hour', 'party']) else 0
        is_exercise = 1 if any(kw in text for kw in ['gym', 'workout', 'run', 'yoga', 'fitness']) else 0
        is_personal = 1 if any(kw in text for kw in ['doctor', 'appointment', 'dentist', 'haircut', 'personal']) else 0
        is_urgent = 1 if any(kw in text for kw in ['urgent', 'asap', 'important', 'critical', 'emergency']) else 0
        prefers_morning = 1 if any(kw in text for kw in ['morning', 'breakfast', 'early']) else 0
        prefers_afternoon = 1 if any(kw in text for kw in ['afternoon', 'lunch']) else 0
        prefers_evening = 1 if any(kw in text for kw in ['evening', 'dinner', 'after work']) else 0
        
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
            'title_len': min(title_len / 50.0, 1.0),
            'desc_len': min(desc_len / 200.0, 1.0),
        }
    
    def score_slots(self, available_slots, preferences, event_title="", event_description=""):
        """Score available slots based on user preferences and event semantics"""
        scored_slots = []

        # If a trained model is available, use it to score candidates
        if self.model is not None:
            # Extract text features once for the event
            text_features = self.extract_text_features(event_title, event_description)
            
            # Build feature matrix rows for each slot
            rows = []
            for slot in available_slots:
                row = {
                    'hour': slot.hour,
                    'day_of_week': slot.weekday(),
                    'is_weekend': 1 if slot.weekday() in [5, 6] else 0,
                    'duration_hours': 1,
                }
                row.update(text_features)
                rows.append(row)

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
    Recommend optimal time slots for a new event based on availability and event semantics
    
    Expected JSON body:
    {
        "user_id": "string",
        "existing_events": [...],  // User's event history
        "date_range_start": "2025-12-01T00:00:00",
        "date_range_end": "2025-12-07T23:59:59",
        "duration_hours": 1,
        "event_title": "Meeting",  // NEW: event title for semantic analysis
        "event_description": "Team sync"  // NEW: event description for semantic analysis
    }
    """
    try:
        data = request.json
        
        existing_events = data.get('existing_events', [])
        date_range_start = datetime.fromisoformat(data['date_range_start'])
        date_range_end = datetime.fromisoformat(data['date_range_end'])
        duration_hours = data.get('duration_hours', 1)
        event_title = data.get('event_title', '')
        event_description = data.get('event_description', '')
        
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
        
        # Score and rank slots using event semantics
        recommendations = recommender.score_slots(available_slots, preferences, event_title, event_description)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'preferences_used': preferences,
            'event_title': event_title,
            'event_description': event_description
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/create-event', methods=['POST'])
def create_event_from_recommendation():
    """
    Automatically create an event based on ML recommendation
    Takes action on behalf of the user by calling the backend API
    
    Expected JSON body:
    {
        "event_title": "string",
        "event_description": "string",
        "start_time": "2025-12-01T10:00:00",
        "end_time": "2025-12-01T11:00:00",
        "location": "string (optional)",
        "backend_api_url": "https://project-project-1.onrender.com/api",
        "auth_cookie": "session cookie for authentication"
    }
    """
    try:
        data = request.json
        print(f"[AUTO-CREATE] Received request: {data}")
        event_title = data.get('event_title')
        event_description = data.get('event_description')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        location = data.get('location', '')
        backend_api_url = data.get('backend_api_url', 'https://project-project-1.onrender.com/api')
        
        if not all([event_title, start_time, end_time]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: event_title, start_time, end_time'
            }), 400
        
        # Log the accepted recommendation for future model training
        log_file = os.path.join('data', 'accepted_logs.csv')
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        log_entry = {
            'start_time': start_time,
            'end_time': end_time,
            'hour': start_dt.hour,
            'day_of_week': start_dt.weekday(),
            'is_weekend': 1 if start_dt.weekday() in [5, 6] else 0,
            'duration_hours': (datetime.fromisoformat(end_time.replace('Z', '+00:00')) - start_dt).seconds / 3600,
            'event_title': event_title,
            'event_description': event_description or '',
            'label': 1,
            'timestamp': datetime.now().isoformat()
        }
        
        # Append to log file (create if doesn't exist)
        log_df = pd.DataFrame([log_entry])
        if os.path.exists(log_file):
            log_df.to_csv(log_file, mode='a', header=False, index=False)
        else:
            log_df.to_csv(log_file, mode='w', header=True, index=False)
        
        # Call backend API to create the event
        event_payload = {
            'event_title': event_title,
            'event_description': event_description,
            'start_time': start_time,
            'end_time': end_time,
            'location': location,
            'event_datetime': start_time,  # for backward compatibility
            'attendees': 1
        }
        
        # Get cookies from request headers if present
        cookies = {}
        if 'Cookie' in request.headers:
            cookie_header = request.headers.get('Cookie')
            for cookie in cookie_header.split(';'):
                if '=' in cookie:
                    key, val = cookie.strip().split('=', 1)
                    cookies[key] = val
        
        print(f"[AUTO-CREATE] Calling backend: {backend_api_url}/events")
        print(f"[AUTO-CREATE] Payload: {event_payload}")
        print(f"[AUTO-CREATE] Cookies: {cookies}")
        
        # The backend expects cookies, not Authorization header
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(
            f"{backend_api_url}/events",
            json=event_payload,
            cookies=cookies,
            headers=headers,
            timeout=10
        )
        
        print(f"[AUTO-CREATE] Response status: {response.status_code}")
        print(f"[AUTO-CREATE] Response body: {response.text}")
        print(f"[AUTO-CREATE] Response headers: {dict(response.headers)}")
        
        if response.status_code in [200, 201]:
            return jsonify({
                'success': True,
                'message': 'Event created successfully',
                'event': response.json()
            })
        else:
            # Return detailed error to help debug
            error_msg = f'Backend API error: {response.status_code}'
            try:
                error_detail = response.json()
            except:
                error_detail = response.text
            
            print(f"[AUTO-CREATE] Error detail: {error_detail}")
            return jsonify({
                'success': False,
                'error': error_msg,
                'details': error_detail
            }), response.status_code
            
    except Exception as e:
        print(f"[AUTO-CREATE] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/log-accepted', methods=['POST'])
def log_accepted_recommendation():
    """
    Log an accepted recommendation for future model training
    Frontend calls this after successfully creating an event
    """
    try:
        data = request.get_json()
        event_title = data.get('event_title', '')
        event_description = data.get('event_description', '')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if not start_time or not end_time:
            return jsonify({'success': False, 'error': 'Missing time data'}), 400
        
        # Parse times
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        
        # Log for future training
        log_file = 'data/accepted_logs.csv'
        log_entry = {
            'start_time': start_time,
            'end_time': end_time,
            'hour': start_dt.hour,
            'day_of_week': start_dt.weekday(),
            'is_weekend': 1 if start_dt.weekday() in [5, 6] else 0,
            'duration_hours': (datetime.fromisoformat(end_time.replace('Z', '+00:00')) - start_dt).seconds / 3600,
            'event_title': event_title,
            'event_description': event_description,
            'label': 1,
            'timestamp': datetime.now().isoformat()
        }
        
        log_df = pd.DataFrame([log_entry])
        if os.path.exists(log_file):
            log_df.to_csv(log_file, mode='a', header=False, index=False)
        else:
            log_df.to_csv(log_file, mode='w', header=True, index=False)
        
        print(f"[LOG] Logged accepted event: {event_title} at {start_time}")
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"[LOG] Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Time Slot Recommender with Auto-Create'
    })

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    # Run the app
    app.run(host='0.0.0.0', port=5001, debug=True)
