# FluxFlow Setup Guide

This guide will walk you through setting up FluxFlow for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Python** 3.11 or higher ([Download](https://www.python.org/))
- **pip** (comes with Python)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized ML service) ([Download](https://www.docker.com/))

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/fluxflow.git
cd fluxflow
```

## Step 2: Firebase Setup

### Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Authentication (Email/Password)
5. Create a Firestore database (start in production mode)

### Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Under "Your apps", click the web icon (</>)
3. Register your app
4. Copy the configuration object

### Configure Firebase Locally

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the backend directory
cd backend
firebase init

# Select:
# - Firestore
# - Functions
# - Use existing project (select your project)
# - JavaScript for Functions
# - Install dependencies: Yes
```

## Step 3: Environment Configuration

### Frontend Environment

Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and add your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_ML_SERVICE_URL=http://localhost:8000
EXPO_PUBLIC_APP_ENV=development
```

### Backend Environment

Create `backend/functions/.env`:

```bash
cp backend/functions/.env.example backend/functions/.env
```

The backend uses Firebase Admin SDK which automatically uses Application Default Credentials. No additional configuration needed for local development.

### ML Service Environment

Create `ml-service/.env`:

```bash
cp ml-service/.env.example ml-service/.env
```

Edit `ml-service/.env`:

```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
CORS_ORIGINS=*
LOG_LEVEL=INFO
```

## Step 4: Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../backend/functions
npm install
```

### ML Service

```bash
cd ../../ml-service
pip install -r requirements.txt
```

## Step 5: Deploy Firestore Rules

```bash
cd backend
firebase deploy --only firestore:rules
```

## Step 6: Start Development Servers

### Option A: Using Docker Compose (Recommended)

```bash
# From the project root
docker-compose up
```

This will start:
- ML Service on http://localhost:8000

### Option B: Manual Start

**Terminal 1 - ML Service:**
```bash
cd ml-service
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Firebase Emulators (Optional):**
```bash
cd backend
firebase emulators:start
```

## Step 7: Verify Setup

### Test ML Service

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000",
  "service": "FluxFlow ML Engine"
}
```

### Test Frontend

1. Open http://localhost:8081 in your browser (for web)
2. Or scan the QR code with Expo Go app (for mobile)
3. You should see the FluxFlow login screen

## Troubleshooting

### Frontend won't start

- **Error**: "Unable to resolve module"
  - Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again

- **Error**: "Firebase config not found"
  - Solution: Verify your `.env` file exists and has all required variables

### ML Service won't start

- **Error**: "Port 8000 already in use"
  - Solution: Kill the process using port 8000 or change the port in `.env`

- **Error**: "Module not found"
  - Solution: Activate your virtual environment and reinstall: `pip install -r requirements.txt`

### Firebase Connection Issues

- **Error**: "Permission denied"
  - Solution: Check your Firestore rules are deployed: `firebase deploy --only firestore:rules`

- **Error**: "Auth domain not authorized"
  - Solution: Add `localhost` to authorized domains in Firebase Console > Authentication > Settings

## Next Steps

- Read the [Architecture Documentation](ARCHITECTURE.md)
- Explore the [API Documentation](API.md)
- Check out the [Deployment Guide](DEPLOYMENT.md)

## Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/yourusername/fluxflow/issues)
2. Review the [Firebase Documentation](https://firebase.google.com/docs)
3. Check the [Expo Documentation](https://docs.expo.dev/)
