# Enhanced Machine Learning

## Task Number
**Option 1**: Enhance the ML component to take action on behalf of the user based on the output of the ML component.

## Description of Enhanced Machine Learning Component

### How It Works
Our enhanced ML component now uses **Natural Language Processing (NLP) and semantic analysis** to intelligently recommend and automatically create calendar events based on the event title and description provided by the user.

**Key Enhancements:**

1. **Text Feature Extraction**: The system analyzes event titles and descriptions to extract semantic features:
   - **Event Type Classification**: Detects meetings, work tasks, social events, exercise, personal appointments
   - **Urgency Detection**: Identifies urgent/critical events from keywords
   - **Time Preference Hints**: Extracts preferences for morning, afternoon, or evening from text
   - **Content Analysis**: Uses title/description length as features

2. **Enhanced ML Model**: 
   - Trains on **15 features** (up from 4): 4 temporal + 11 text-based features
   - Uses LogisticRegression classifier trained on labeled historical data
   - Predicts optimal time slots based on:
     - User's historical scheduling patterns
     - Event semantics (type, urgency, time preferences)
     - Calendar availability (conflict avoidance)

3. **Automated Action-Taking**:
   - **Auto-Create Feature**: Users can click "🤖 Auto-Create" on any recommendation
   - The ML service directly calls the backend API to create the event in the database
   - No manual form filling required - the system acts on behalf of the user
   - Logs all accepted recommendations for continuous model improvement

### How It Enhances User Experience

**Before Enhancement:**
- Users had to manually enter title, description, AND pick a time
- ML only considered temporal patterns (hour, day, weekend)
- Recommendations were disconnected from event semantics
- Users still needed to manually create the event after selection

**After Enhancement:**
1. **Intelligent Context-Aware Suggestions**: 
   - "Morning standup" → suggests early slots (9-10 AM)
   - "Gym workout" → suggests afternoon/evening slots
   - "Urgent deadline" → prioritizes immediate available times
   - "Dinner party" → suggests evening slots on weekends

2. **One-Click Event Creation**:
   - User enters: Title + Description
   - ML suggests: Best times based on semantics + availability
   - User clicks: "🤖 Auto-Create"
   - System: **Automatically creates event in database**

3. **Reduced Cognitive Load**:
   - No need to think about when to schedule
   - No manual time selection
   - No form filling after recommendation
   - System learns from accepted suggestions

4. **Continuous Learning**:
   - Every auto-created event is logged with features + label=1
   - Logs accumulate in `ml-service/data/accepted_logs.csv`
   - Model can be retrained offline with production data
   - Recommendations improve over time

## Differences from Previous Deliverable

| Aspect | Previous Deliverable | Enhanced Version |
|--------|---------------------|------------------|
| **Input** | Only existing events + date range | Title + Description + existing events |
| **Features** | 4 temporal features (hour, day, weekend, duration) | **15 features** (4 temporal + 11 NLP/semantic) |
| **ML Approach** | Rule-based heuristics OR simple temporal model | **NLP-enhanced trained classifier** |
| **User Action** | Manual: Select recommendation → Fill form → Submit | **Automated**: Click "Auto-Create" → Event created |
| **Data Collection** | None | **Automatic logging** of accepted events to CSV |
| **Semantic Understanding** | No | **Yes** - understands event types, urgency, time hints |
| **Backend Integration** | Frontend-only | **ML service calls backend API** to persist events |
| **Learning Loop** | Static model | **Continuous**: Logs production data for retraining |

### Key Technical Differences

1. **Text Processing Pipeline**:
   ```python
   # NEW: Extract semantic features from title/description
   is_meeting = keyword_match(['meeting', 'call', 'sync', ...])
   is_urgent = keyword_match(['urgent', 'asap', 'critical', ...])
   prefers_morning = keyword_match(['morning', 'breakfast', 'early', ...])
   # ... 11 total text features
   ```

2. **Model Enhancement**:
   - Previous: `X = [hour, day_of_week, is_weekend, duration]`
   - Enhanced: `X = [temporal_features] + [text_features]` (15 dimensions)

3. **Action-Taking Capability**:
   ```python
   # NEW: ML service directly creates events
   @app.route('/api/ml/create-event', methods=['POST'])
   def create_event_from_recommendation():
       # 1. Log accepted recommendation
       # 2. Call backend API to create event
       # 3. Return success/failure
   ```

## Integration into Existing Application

### Architecture Overview
```
User Input (Title + Description)
         ↓
Frontend (SchedulePage)
         ↓
ML Service (Flask) ← Analyzes text semantics
         ↓
ML Model ← Predicts best slots (15 features)
         ↓
User Clicks "Auto-Create"
         ↓
ML Service → Backend API → PostgreSQL
         ↓
Event Created ✓
         ↓
Logged to accepted_logs.csv (for future training)
```

### Integration Steps Implemented

1. **Frontend Changes** (`front-end/src/Pages/SchedulePage/index.tsx`):
   - Added validation: Title required before recommendations
   - Send `event_title` and `event_description` to ML endpoint
   - Added "Auto-Create" button in recommendations dialog
   - Implemented `handleAutoCreateEvent()` to call ML create endpoint

2. **ML Service Enhancements** (`ml-service/app.py`):
   - Added `extract_text_features()` method for NLP analysis
   - Updated `score_slots()` to accept and use title/description
   - Created `/api/ml/create-event` endpoint
   - Integrated with backend API using `requests` library
   - Automatic logging to `data/accepted_logs.csv`

3. **Training Pipeline** (`ml-service/train.py`):
   - Added text feature extraction function
   - Updated training data format (added title/description columns)
   - Expanded feature matrix to 15 dimensions
   - Model now trains on semantic + temporal features

4. **Data Flow**:
   ```
   labels.csv (historical) → train.py → model.pkl
                                              ↓
   User input → recommend endpoint → model.pkl → recommendations
                                                        ↓
                                              Auto-create → Backend API
                                                        ↓
                                              accepted_logs.csv
   ```

### New Dependencies Added
- `scikit-learn==1.3.2` - ML model training
- `joblib==1.3.2` - Model serialization
- `requests==2.31.0` - Backend API calls from ML service

## Challenges Faced

### 1. **Windows Build Tools for scikit-learn**
- **Problem**: Installing scikit-learn on Windows requires Microsoft Visual C++ Build Tools
- **Solution**: Documented alternative approaches (Miniconda, WSL) and ensured code works with standard wheels

### 2. **Cross-Service Authentication**
- **Problem**: ML service needs to authenticate with backend API on behalf of user
- **Solution**: Forward session cookies from frontend → ML service → backend API
  ```python
  # Extract cookies from request headers
  cookies = {}
  for cookie in request.headers.get('Cookie').split(';'):
      key, val = cookie.strip().split('=', 1)
      cookies[key] = val
  
  # Forward to backend
  requests.post(backend_url, json=payload, cookies=cookies)
  ```

### 3. **Feature Engineering for Small Datasets**
- **Problem**: Limited training data (15 samples) can lead to overfitting
- **Solution**: 
  - Used simple keyword-based feature extraction (interpretable)
  - Normalized continuous features (title_len, desc_len)
  - Logged production data for future retraining with more samples

### 4. **Balancing Automation with User Control**
- **Problem**: Full automation might create unwanted events
- **Solution**: Provided two options:
  - "Fill Form" - pre-fills form for manual review
  - "🤖 Auto-Create" - immediate creation (requires confirmation via alert)

### 5. **Data Schema Evolution**
- **Problem**: Training data format changed (added title/description columns)
- **Solution**: 
  - Updated `labels.csv` with sample text data
  - Backward compatibility: Handle missing text fields gracefully
  - Clear documentation of expected CSV format

### 6. **Timezone Handling**
- **Problem**: ISO datetime strings may not preserve timezone correctly
- **Consideration**: Current implementation uses ISO strings; production deployment should normalize to UTC

## Performance and Future Improvements

### Current Performance
- **Accuracy**: 67% on test set (small sample size, room for improvement)
- **Features**: 15 semantic + temporal features
- **Response Time**: < 500ms for recommendations
- **Action Success**: Direct event creation with backend API integration

### Planned Enhancements
1. **More Training Data**: Accumulate accepted_logs.csv from production usage
2. **Advanced NLP**: Use embeddings (Word2Vec, BERT) instead of keyword matching
3. **Personalization**: Per-user models trained on individual history
4. **Online Learning**: Retrain model periodically from accepted_logs.csv (MLOps pipeline)
5. **A/B Testing**: Measure acceptance rate of ML suggestions vs. manual selection
6. **Multi-Event Optimization**: Suggest multiple coordinated events (e.g., meeting + prep time)

---

**Summary**: Our enhanced ML component now understands event semantics through NLP, recommends times intelligently based on 15 features, and automatically creates events in the database on behalf of users - significantly reducing friction and demonstrating true ML-driven automation.
