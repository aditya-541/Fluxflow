import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from main import app

client = TestClient(app)


class TestHealthEndpoints:
    """Test health check and status endpoints"""

    def test_root_endpoint(self):
        """Test root endpoint returns service status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "FluxFlow ML Engine"
        assert "version" in data

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["service"] == "FluxFlow ML Engine"


class TestSchedulePrediction:
    """Test schedule prediction endpoint"""

    def test_predict_schedule_success(self):
        """Test successful schedule prediction"""
        request_data = {
            "tasks": [
                {
                    "id": "1",
                    "title": "Deep Work",
                    "estimated_duration_minutes": 120,
                    "priority": 5
                },
                {
                    "id": "2",
                    "title": "Email",
                    "estimated_duration_minutes": 15,
                    "priority": 2
                }
            ],
            "user_state": {
                "energy_level": 9,
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2
        
        # Verify response structure
        for task in data:
            assert "task_id" in task
            assert "start_time" in task
            assert "end_time" in task
            assert "confidence_score" in task
            assert 0.0 <= task["confidence_score"] <= 1.0

    def test_high_energy_prioritization(self):
        """Test that high energy prioritizes difficult tasks"""
        request_data = {
            "tasks": [
                {
                    "id": "easy",
                    "title": "Quick Task",
                    "estimated_duration_minutes": 15,
                    "priority": 1
                },
                {
                    "id": "hard",
                    "title": "Complex Task",
                    "estimated_duration_minutes": 120,
                    "priority": 5
                }
            ],
            "user_state": {
                "energy_level": 10,
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # High energy should schedule hard task first
        assert data[0]["task_id"] == "hard"

    def test_low_energy_prioritization(self):
        """Test that low energy prioritizes quick wins"""
        request_data = {
            "tasks": [
                {
                    "id": "long",
                    "title": "Long Task",
                    "estimated_duration_minutes": 120,
                    "priority": 5
                },
                {
                    "id": "short",
                    "title": "Short Task",
                    "estimated_duration_minutes": 15,
                    "priority": 1
                }
            ],
            "user_state": {
                "energy_level": 2,
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Low energy should schedule short task first
        assert data[0]["task_id"] == "short"

    def test_invalid_energy_level(self):
        """Test validation of energy level"""
        request_data = {
            "tasks": [
                {
                    "id": "1",
                    "title": "Task",
                    "estimated_duration_minutes": 60,
                    "priority": 3
                }
            ],
            "user_state": {
                "energy_level": 15,  # Invalid: > 10
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 422  # Validation error

    def test_invalid_task_duration(self):
        """Test validation of task duration"""
        request_data = {
            "tasks": [
                {
                    "id": "1",
                    "title": "Task",
                    "estimated_duration_minutes": 0,  # Invalid: must be > 0
                    "priority": 3
                }
            ],
            "user_state": {
                "energy_level": 5,
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 422  # Validation error

    def test_empty_task_list(self):
        """Test validation of empty task list"""
        request_data = {
            "tasks": [],  # Invalid: must have at least 1 task
            "user_state": {
                "energy_level": 5,
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 422  # Validation error

    def test_confidence_scores(self):
        """Test that confidence scores are appropriate"""
        # High energy + high priority task should have high confidence
        request_data = {
            "tasks": [
                {
                    "id": "1",
                    "title": "Important Task",
                    "estimated_duration_minutes": 120,
                    "priority": 5
                }
            ],
            "user_state": {
                "energy_level": 10,
                "current_time": datetime.utcnow().isoformat()
            }
        }

        response = client.post("/predict-schedule", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data[0]["confidence_score"] >= 0.85  # Should be high confidence
