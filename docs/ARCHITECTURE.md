# FluxFlow Architecture

This document describes the system architecture, design decisions, and technical implementation of FluxFlow.

## System Overview

FluxFlow is a three-tier application consisting of:

1. **Frontend**: Cross-platform mobile/web application
2. **Backend**: Firebase services (Authentication, Firestore, Cloud Functions)
3. **ML Service**: Python microservice for intelligent scheduling

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     Client Layer                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │         React Native (Expo) Application            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │   iOS    │  │ Android  │  │       Web        │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└────────────┬─────────────────────────┬───────────────────┘
             │                         │
             │ Firebase SDK            │ HTTP/REST
             │                         │
┌────────────▼─────────────┐  ┌────────▼──────────────────┐
│    Firebase Backend      │  │     ML Service            │
│                          │  │     (FastAPI)             │
│  ┌────────────────────┐  │  │                           │
│  │  Authentication    │  │  │  ┌──────────────────────┐ │
│  └────────────────────┘  │  │  │ Schedule Prediction  │ │
│  ┌────────────────────┐  │  │  └──────────────────────┘ │
│  │  Firestore DB      │  │  │  ┌──────────────────────┐ │
│  │  - Users           │  │  │  │ Energy-Aware Logic   │ │
│  │  - Tasks           │  │  │  └──────────────────────┘ │
│  │  - Energy Logs     │  │  │                           │
│  └────────────────────┘  │  │  Docker Container         │
│  ┌────────────────────┐  │  └───────────────────────────┘
│  │  Cloud Functions   │  │
│  │  - User Lifecycle  │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

## Component Details

### Frontend (React Native + Expo)

**Technology Stack:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript
- NativeWind (Tailwind CSS)
- Firebase SDK

**Key Features:**
- Cross-platform (iOS, Android, Web)
- Offline-first architecture with local fallback
- Real-time data synchronization
- Responsive UI with native feel

**Directory Structure:**
```
frontend/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── index.tsx          # Entry point
├── components/            # Reusable UI components
├── services/              # Business logic & API calls
│   ├── taskService.ts     # Task CRUD operations
│   ├── energyService.ts   # Energy logging
│   └── scheduleService.ts # ML service integration
├── utils/                 # Utility functions
│   ├── errorHandler.ts    # Error handling
│   └── logger.ts          # Logging
├── config/                # Configuration
│   └── index.ts           # Centralized config
└── firebaseConfig.ts      # Firebase initialization
```

### Backend (Firebase)

**Services Used:**
- **Firebase Authentication**: Email/password authentication
- **Cloud Firestore**: NoSQL database for user data
- **Cloud Functions**: Serverless backend logic

**Data Model:**

```
users/{userId}
├── email: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── settings: object
    ├── theme: string
    └── notificationsEnabled: boolean

users/{userId}/tasks/{taskId}
├── title: string
├── estimatedDuration: number (minutes)
├── priority: number (1-5)
├── completed: boolean
├── createdAt: timestamp
└── deadline?: timestamp

users/{userId}/energy_logs/{logId}
├── level: number (1-10)
├── timestamp: timestamp
└── notes?: string
```

**Security Rules:**
- User data isolation (users can only access their own data)
- Field-level validation
- Type checking
- Immutable energy logs (cannot be updated/deleted)

### ML Service (FastAPI)

**Technology Stack:**
- Python 3.11
- FastAPI
- Pydantic for validation
- NumPy, Pandas, scikit-learn

**Scheduling Algorithm:**

The ML service uses an energy-aware scheduling algorithm:

1. **High Energy (8-10)**:
   - Prioritizes challenging tasks
   - Formula: `priority * 2 + duration / 30`
   - Best for: High-priority, long-duration tasks

2. **Medium Energy (4-7)**:
   - Balanced approach
   - Formula: `priority + duration / 60`
   - Best for: Mixed task types

3. **Low Energy (1-3)**:
   - Quick wins first
   - Sorted by: Duration (ascending)
   - Best for: Short, easy tasks

**Confidence Scoring:**
- Base confidence: 0.75
- High energy + high priority task: 0.90
- Low energy + quick task: 0.85
- Random variance: +0.0 to +0.1

**API Endpoints:**
- `GET /`: Service status
- `GET /health`: Health check
- `POST /predict-schedule`: Generate optimized schedule

## Data Flow

### Task Creation Flow

```
1. User creates task in app
   ↓
2. Frontend validates input
   ↓
3. taskService.createTask() called
   ↓
4. Firebase SDK writes to Firestore
   ↓
5. Firestore security rules validate
   ↓
6. Document created in users/{uid}/tasks/
   ↓
7. Real-time listener updates UI
```

### Schedule Generation Flow

```
1. User requests schedule
   ↓
2. Frontend fetches tasks & latest energy log
   ↓
3. scheduleService.generateSchedule() called
   ↓
4. HTTP POST to ML service /predict-schedule
   ↓
5. ML service validates request
   ↓
6. Energy-aware sorting algorithm runs
   ↓
7. Schedule with confidence scores returned
   ↓
8. Frontend displays optimized schedule
   
   (If ML service fails)
   ↓
   Local fallback algorithm runs
   ↓
   Schedule generated client-side
```

## Design Decisions

### Why Separate ML Service?

1. **Language Optimization**: Python is better suited for ML/data processing
2. **Scalability**: Can scale ML service independently
3. **Flexibility**: Easy to swap algorithms or add models
4. **Offline Support**: Frontend has fallback logic

### Why Firebase?

1. **Real-time Sync**: Automatic data synchronization
2. **Authentication**: Built-in auth with minimal setup
3. **Serverless**: No server management needed
4. **Security**: Declarative security rules
5. **Scalability**: Auto-scales with usage

### Why Expo?

1. **Cross-Platform**: Single codebase for iOS, Android, Web
2. **Developer Experience**: Fast refresh, easy debugging
3. **OTA Updates**: Push updates without app store review
4. **Native Modules**: Access to native APIs

## Security Considerations

### Authentication
- Email/password authentication via Firebase Auth
- Secure token-based session management
- Automatic token refresh

### Data Security
- All data encrypted in transit (HTTPS/TLS)
- Firestore security rules enforce data isolation
- Field-level validation prevents data tampering
- No sensitive data in client-side code

### API Security
- ML service uses CORS to restrict origins
- Input validation on all endpoints
- Rate limiting (to be implemented)
- Health checks for monitoring

## Performance Optimizations

### Frontend
- Lazy loading of screens
- Memoization of expensive computations
- Optimistic UI updates
- Local caching of frequently accessed data

### Backend
- Firestore indexes for efficient queries
- Batch operations for bulk updates
- Cloud Functions cold start optimization

### ML Service
- Request timeout (10 seconds)
- Efficient sorting algorithms
- Docker multi-stage builds for smaller images
- Health checks for container orchestration

## Monitoring & Observability

### Logging
- Structured logging in all services
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized error handling

### Metrics (To Be Implemented)
- API response times
- Error rates
- User engagement metrics
- ML service prediction accuracy

## Future Enhancements

1. **Machine Learning**
   - Train models on historical user data
   - Personalized scheduling based on patterns
   - Deadline prediction

2. **Features**
   - Calendar integration
   - Team collaboration
   - Habit tracking
   - Analytics dashboard

3. **Infrastructure**
   - Redis caching layer
   - GraphQL API
   - Kubernetes deployment
   - A/B testing framework
