# FluxFlow ML Service

Energy-aware adaptive scheduling service for FluxFlow.

## Features

- **Energy-Aware Scheduling**: Optimizes task order based on user's current energy level
  - High energy (8-10): Prioritizes challenging tasks (high priority, long duration)
  - Medium energy (4-7): Balanced approach
  - Low energy (1-3): Quick wins first (short, easy tasks)
- **CORS Enabled**: Ready for frontend integration
- **Confidence Scoring**: Returns confidence scores based on energy-task alignment

## Quick Start

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
cd ml-service
pip install -r requirements.txt
```

### Running the Service

```bash
uvicorn main:app --reload
```

The service will be available at `http://localhost:8000`

### Testing

Visit `http://localhost:8000` to see the service status.

Test the scheduling endpoint:

```bash
curl -X POST http://localhost:8000/predict-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {"id": "1", "title": "Deep Work", "estimated_duration_minutes": 120, "priority": 5},
      {"id": "2", "title": "Email", "estimated_duration_minutes": 15, "priority": 2}
    ],
    "user_state": {
      "energy_level": 9,
      "current_time": "2024-01-01T09:00:00Z"
    }
  }'
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Production Deployment

For production, update the CORS `allow_origins` in `main.py` to specify your frontend domain instead of `"*"`.
