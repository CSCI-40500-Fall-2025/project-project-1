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
