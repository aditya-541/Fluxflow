# FluxFlow

**Adaptive AI scheduler for people with irregular lives.**

FluxFlow is an intelligent task scheduling application that adapts to your energy levels throughout the day. Using machine learning, it optimizes your schedule based on your current state, helping you work smarter, not harder.

## 🌟 Features

- **Energy-Aware Scheduling**: Automatically adjusts task order based on your energy levels
- **Smart Prioritization**: ML-driven task scheduling that considers priority, duration, and deadlines
- **Cross-Platform**: React Native app for iOS, Android, and Web
- **Real-time Sync**: Firebase-powered real-time data synchronization
- **Offline Support**: Local fallback scheduling when ML service is unavailable
- **Secure**: Comprehensive Firestore security rules and authentication

## 🏗️ Architecture

FluxFlow consists of three main components:

```
┌─────────────────┐
│   Frontend      │  React Native (Expo)
│   Mobile/Web    │  - User Interface
└────────┬────────┘  - Task Management
         │           - Energy Logging
         │
         ├──────────┐
         │          │
┌────────▼────┐  ┌──▼──────────────┐
│  Firebase   │  │  ML Service     │
│  Backend    │  │  (FastAPI)      │
│             │  │                 │
│ - Auth      │  │ - Schedule      │
│ - Firestore │  │   Prediction    │
│ - Functions │  │ - Energy-Aware  │
└─────────────┘  │   Optimization  │
                 └─────────────────┘
```

### Components

- **frontend/**: React Native (Expo) application
  - Cross-platform mobile and web app
  - Firebase authentication and data sync
  - Offline-capable with local fallback

- **backend/**: Firebase Cloud Functions and configuration
  - User profile management
  - Firestore security rules
  - Cloud Functions for user lifecycle

- **ml-service/**: Python FastAPI microservice
  - Energy-aware scheduling algorithm
  - RESTful API for schedule prediction
  - Dockerized for easy deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Firebase CLI (`npm install -g firebase-tools`)
- Docker (optional, for ML service)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fluxflow.git
   cd fluxflow
   ```

2. **Set up environment variables**
   
   Copy the example environment files and fill in your values:
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/functions/.env.example backend/functions/.env
   cp ml-service/.env.example ml-service/.env
   ```

   See [docs/SETUP.md](docs/SETUP.md) for detailed configuration instructions.

3. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd ../backend/functions && npm install
   
   # ML Service
   cd ../../ml-service && pip install -r requirements.txt
   ```

4. **Start development servers**
   
   Using Docker Compose (recommended):
   ```bash
   docker-compose up
   ```
   
   Or manually:
   ```bash
   # Terminal 1: ML Service
   cd ml-service
   uvicorn main:app --reload
   
   # Terminal 2: Frontend
   cd frontend
   npm start
   
   # Terminal 3: Firebase Emulators (optional)
   cd backend
   firebase emulators:start
   ```

5. **Open the app**
   - Web: http://localhost:8081
   - iOS: Press `i` in the Expo terminal
   - Android: Press `a` in the Expo terminal

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture and design
- [API Documentation](docs/API.md) - Backend and ML service APIs
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend/functions
npm test

# ML Service tests
cd ml-service
pytest --cov=. --cov-report=term-missing
```

## 🔧 Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test` or `pytest`
4. Commit your changes: `git commit -m "Add feature"`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

## 📦 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
# Deploy Firebase Functions
cd backend
firebase deploy --only functions

# Deploy ML Service (Docker)
cd ml-service
docker build -t fluxflow-ml .
docker push your-registry/fluxflow-ml:latest

# Build mobile app
cd frontend
npx eas build --platform all
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- ML service using [FastAPI](https://fastapi.tiangolo.com/)

