from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import random
from datetime import datetime, timedelta
import os
import logging

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FluxFlow ML Service",
    description="Energy-aware adaptive scheduling service",
    version="1.0.0"
)

# Environment-based CORS configuration
cors_origins = os.getenv('CORS_ORIGINS', '*')
allowed_origins = cors_origins.split(',') if cors_origins != '*' else ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: str = Field(..., min_length=1, description="Unique task identifier")
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    estimated_duration_minutes: int = Field(..., ge=1, le=480, description="Duration in minutes (1-480)")
    deadline: Optional[datetime] = Field(None, description="Optional deadline")
    priority: int = Field(1, ge=1, le=5, description="Priority level (1-5)")

    @validator('estimated_duration_minutes')
    def validate_duration(cls, v):
        if v <= 0:
            raise ValueError('Duration must be positive')
        return v

class UserState(BaseModel):
    energy_level: int = Field(..., ge=1, le=10, description="Energy level (1-10)")
    current_time: datetime = Field(..., description="Current timestamp")

    @validator('energy_level')
    def validate_energy(cls, v):
        if not 1 <= v <= 10:
            raise ValueError('Energy level must be between 1 and 10')
        return v

class ScheduleRequest(BaseModel):
    tasks: List[Task] = Field(..., min_items=1, max_items=50, description="List of tasks to schedule")
    user_state: UserState = Field(..., description="Current user state")

class ScheduledTask(BaseModel):
    task_id: str
    start_time: datetime
    end_time: datetime
    confidence_score: float = Field(..., ge=0.0, le=1.0)

@app.get("/")
def read_root():
    """Root endpoint - service status"""
    return {
        "status": "online",
        "service": "FluxFlow ML Engine",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "FluxFlow ML Engine"
    }

@app.post("/predict-schedule", response_model=List[ScheduledTask])
def predict_schedule(request: ScheduleRequest):
    """
    Predict optimal schedule based on tasks and user energy.
    Energy-aware scheduling: High energy -> High priority/duration tasks
    """
    try:
        logger.info(f"Scheduling {len(request.tasks)} tasks with energy level {request.user_state.energy_level}")
        
        scheduled_tasks = []
        current_time = request.user_state.current_time
        energy = request.user_state.energy_level
        
        # Energy-aware sorting
        # High energy (8-10): Prioritize hard tasks (high priority, long duration)
        # Medium energy (4-7): Balance between priority and duration
        # Low energy (1-3): Prioritize quick wins (short duration, any priority)
        
        if energy >= 8:
            # High energy: tackle hard tasks first
            sorted_tasks = sorted(
                request.tasks,
                key=lambda x: (x.priority * 2 + x.estimated_duration_minutes / 30),
                reverse=True
            )
        elif energy >= 4:
            # Medium energy: balanced approach
            sorted_tasks = sorted(
                request.tasks,
                key=lambda x: (x.priority + x.estimated_duration_minutes / 60),
                reverse=True
            )
        else:
            # Low energy: quick wins first
            sorted_tasks = sorted(
                request.tasks,
                key=lambda x: x.estimated_duration_minutes
            )
        
        for task in sorted_tasks:
            # Add 10-minute buffer between tasks
            start_time = current_time + timedelta(minutes=10)
            end_time = start_time + timedelta(minutes=task.estimated_duration_minutes)
            
            # Confidence based on energy alignment
            base_confidence = 0.75
            if energy >= 8 and task.priority >= 4:
                base_confidence = 0.90
            elif energy <= 3 and task.estimated_duration_minutes <= 30:
                base_confidence = 0.85
            
            scheduled_tasks.append(ScheduledTask(
                task_id=task.id,
                start_time=start_time,
                end_time=end_time,
                confidence_score=min(base_confidence + (random.random() * 0.1), 1.0)
            ))
            
            current_time = end_time
        
        logger.info(f"Successfully scheduled {len(scheduled_tasks)} tasks")
        return scheduled_tasks
    
    except Exception as e:
        logger.error(f"Error scheduling tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scheduling error: {str(e)}")

