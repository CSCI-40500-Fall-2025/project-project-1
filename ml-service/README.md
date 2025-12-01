# ML Time Slot Recommendation Service

This service provides AI-powered time slot recommendations for scheduling events based on user history and preferences.

## Features

- **Pattern Recognition**: Analyzes user's event history to identify scheduling patterns
- **Preference Learning**: Learns preferred times of day, days of week, and weekend preferences
- **Conflict Avoidance**: Automatically excludes time slots that conflict with existing events
- **Smart Scoring**: Ranks available slots based on user preferences

## Setup

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Run the Service

```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### POST `/api/ml/recommend-timeslots`

Get recommended time slots for a new event.

**Request Body:**
```json
{
  "user_id": "string",
  "existing_events": [
    {
      "event_datetime": "2025-12-01T10:00:00",
      "event_title": "Meeting",
      "location": "Office"
    }
  ],
  "date_range_start": "2025-12-01T00:00:00",
  "date_range_end": "2025-12-07T23:59:59",
  "duration_hours": 1
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "datetime": "2025-12-02T14:00:00",
      "score": 65,
      "hour": 14,
      "day": "Monday",
      "date": "2025-12-02"
    }
  ],
  "preferences_used": {
    "preferred_hours": [10, 14, 15],
    "preferred_days": [1, 2, 3],
    "avg_hour": 13.5,
    "weekend_preference": 0.2
  }
}
```

### GET `/api/ml/health`

Health check endpoint.

## How It Works

### 1. Feature Extraction
- Analyzes historical events to identify patterns
- Extracts: preferred hours, preferred days, weekend preference, average scheduling time

### 2. Slot Generation
- Creates potential time slots within the specified date range
- Filters business hours (9 AM - 6 PM)
- Excludes conflicting time slots

### 3. Scoring Algorithm
Points are awarded based on:
- **Preferred hours** (+30 points): Times you frequently schedule events
- **Preferred days** (+20 points): Days of week you commonly use
- **Hour proximity** (+10 points max): Closer to your average scheduling time
- **Weekend preference** (+15 points): Matches your weekend/weekday pattern

### 4. Ranking
- Sorts all available slots by score (descending)
- Returns top 5 recommendations

## Future Enhancements

- **Deep Learning Model**: Train neural network on larger datasets
- **Context Awareness**: Consider event type, participants, location
- **Collaborative Filtering**: Learn from similar users
- **Time Series Analysis**: Predict future scheduling needs
- **Multi-factor Optimization**: Balance travel time, energy levels, productivity patterns

## Integration with Frontend

The frontend Calendar component includes a "Smart Suggest" button that:
1. Fetches user's event history
2. Calls ML service API
3. Displays top recommendations in a dialog
4. Allows user to select a recommended slot
5. Pre-fills event form with selected time

## Tech Stack

- **Flask**: Web framework
- **scikit-learn**: Machine learning library (ready for model upgrades)
- **pandas**: Data manipulation
- **numpy**: Numerical computations

## Development

To extend the ML model:
1. Collect more user data
2. Train advanced models (Random Forest, XGBoost, Neural Networks)
3. Save models using joblib: `joblib.dump(model, 'models/time_slot_model.pkl')`
4. Load in recommender: `self.model = joblib.load(self.model_path)`
