# FluxFlow Deployment Guide

This guide covers deploying FluxFlow to production environments.

## Prerequisites

Before deploying, ensure you have:

- [ ] Production Firebase project created
- [ ] Environment variables configured
- [ ] All tests passing
- [ ] Docker Hub account (for ML service)
- [ ] Domain name (optional, for ML service)

## Pre-Deployment Checklist

### Security

- [ ] Remove all hardcoded credentials
- [ ] Update CORS origins in ML service to production domains
- [ ] Review Firestore security rules
- [ ] Enable Firebase App Check (optional but recommended)
- [ ] Set up Firebase Authentication email templates

### Configuration

- [ ] Set production environment variables
- [ ] Update `app.json` with production bundle identifiers
- [ ] Configure app icons and splash screens
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics (optional)

### Testing

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing on iOS/Android devices
- [ ] Performance testing completed

## Deployment Steps

### 1. Deploy Firebase Backend

#### Deploy Firestore Rules

```bash
cd backend
firebase use production  # Switch to production project
firebase deploy --only firestore:rules
```

#### Deploy Cloud Functions

```bash
cd backend/functions

# Build TypeScript
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

**Environment Variables for Functions:**

Set via Firebase Console or CLI:
```bash
firebase functions:config:set \
  app.env="production" \
  app.log_level="info"
```

### 2. Deploy ML Service

#### Option A: Docker to Cloud Run (Recommended)

**Build and push Docker image:**

```bash
cd ml-service

# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/fluxflow-ml:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/fluxflow-ml:latest
```

**Deploy to Cloud Run:**

```bash
gcloud run deploy fluxflow-ml \
  --image gcr.io/YOUR_PROJECT_ID/fluxflow-ml:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars CORS_ORIGINS=https://yourapp.com,LOG_LEVEL=INFO,ENVIRONMENT=production \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

**Get the service URL:**
```bash
gcloud run services describe fluxflow-ml --region us-central1 --format 'value(status.url)'
```

#### Option B: Docker to AWS ECS

**Prerequisites:**
- AWS CLI configured
- ECR repository created

**Build and push:**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t fluxflow-ml .
docker tag fluxflow-ml:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/fluxflow-ml:latest

# Push
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/fluxflow-ml:latest
```

**Deploy to ECS:**
- Create ECS cluster
- Create task definition with environment variables
- Create service with load balancer
- Configure auto-scaling

#### Option C: Heroku

```bash
cd ml-service

# Login to Heroku
heroku login

# Create app
heroku create fluxflow-ml

# Set environment variables
heroku config:set CORS_ORIGINS=https://yourapp.com
heroku config:set LOG_LEVEL=INFO
heroku config:set ENVIRONMENT=production

# Deploy
git push heroku main
```

### 3. Deploy Frontend (Mobile App)

#### Setup EAS Build

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

#### Update Environment for Production

Create `frontend/.env.production`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_production_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_production_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_production_app_id
EXPO_PUBLIC_ML_SERVICE_URL=https://your-ml-service.run.app
EXPO_PUBLIC_APP_ENV=production
```

#### Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build for App Store
eas build --platform ios --profile production
```

**Submit to App Store:**

```bash
eas submit --platform ios
```

#### Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production build for Play Store
eas build --platform android --profile production
```

**Submit to Play Store:**

```bash
eas submit --platform android
```

### 4. Deploy Frontend (Web)

#### Build for Web

```bash
cd frontend

# Set production environment
export EXPO_PUBLIC_ML_SERVICE_URL=https://your-ml-service.run.app
# ... set other env vars

# Build
npx expo export --platform web
```

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd dist
vercel --prod
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd dist
netlify deploy --prod
```

#### Deploy to Firebase Hosting

```bash
cd backend

# Configure hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Post-Deployment

### Monitoring

1. **Set up monitoring:**
   - Firebase Console: Monitor Functions, Firestore usage
   - Cloud Run/ECS: Monitor ML service metrics
   - Sentry: Error tracking (if configured)

2. **Set up alerts:**
   - Firebase budget alerts
   - Cloud Run error rate alerts
   - Uptime monitoring (UptimeRobot, Pingdom)

### Health Checks

Verify all services are running:

```bash
# ML Service
curl https://your-ml-service.run.app/health

# Firebase Functions
# Check Firebase Console > Functions

# Mobile App
# Test on real devices
```

### Performance Optimization

1. **Enable caching:**
   - Configure CDN for static assets
   - Enable Firestore offline persistence

2. **Optimize images:**
   - Compress app icons
   - Use WebP format where possible

3. **Monitor bundle size:**
   ```bash
   npx expo export --platform web
   # Check dist/ folder size
   ```

## Rollback Procedures

### Firebase Functions

```bash
# List deployments
firebase functions:log

# Rollback to previous version
# (Firebase doesn't support direct rollback, redeploy previous code)
git checkout <previous-commit>
firebase deploy --only functions
```

### ML Service (Cloud Run)

```bash
# List revisions
gcloud run revisions list --service fluxflow-ml --region us-central1

# Rollback to previous revision
gcloud run services update-traffic fluxflow-ml \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

### Mobile App

- Submit new build with fixes
- Use Expo OTA updates for JavaScript changes:
  ```bash
  eas update --branch production
  ```

## Troubleshooting

### ML Service Issues

**Problem:** Service not responding
- Check Cloud Run logs: `gcloud run services logs read fluxflow-ml`
- Verify environment variables are set
- Check CORS configuration

**Problem:** High latency
- Increase memory/CPU allocation
- Enable auto-scaling
- Check for cold starts

### Firebase Issues

**Problem:** Permission denied errors
- Verify Firestore rules are deployed
- Check user authentication status
- Review security rules in Firebase Console

**Problem:** Function timeouts
- Increase function timeout in `firebase.json`
- Optimize function code
- Check for infinite loops

### Mobile App Issues

**Problem:** App crashes on startup
- Check error logs in Sentry/Firebase Crashlytics
- Verify environment variables are correct
- Test on multiple devices

**Problem:** Can't connect to ML service
- Verify ML service URL is correct
- Check CORS configuration
- Test ML service endpoint directly

## Security Best Practices

1. **Secrets Management:**
   - Never commit `.env` files
   - Use Firebase Functions config for secrets
   - Use Cloud Secret Manager for sensitive data

2. **API Security:**
   - Implement rate limiting
   - Use Firebase App Check
   - Monitor for suspicious activity

3. **Data Security:**
   - Enable Firestore backups
   - Regular security rule audits
   - Encrypt sensitive data

## Cost Optimization

1. **Firebase:**
   - Monitor Firestore read/write operations
   - Use Firestore indexes efficiently
   - Set up budget alerts

2. **Cloud Run:**
   - Set min instances to 0 for dev
   - Use appropriate memory/CPU settings
   - Monitor request patterns

3. **Mobile App:**
   - Optimize bundle size
   - Use lazy loading
   - Minimize API calls

## Maintenance

### Regular Tasks

- [ ] Weekly: Review error logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security rules
- [ ] Quarterly: Performance audit
- [ ] Quarterly: Cost review

### Updates

**Backend:**
```bash
cd backend/functions
npm update
npm audit fix
firebase deploy --only functions
```

**ML Service:**
```bash
cd ml-service
pip list --outdated
pip install -U <package>
# Rebuild and redeploy Docker image
```

**Frontend:**
```bash
cd frontend
npm update
npx expo upgrade
# Test thoroughly before deploying
```

## Support

For deployment issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Review [Firebase documentation](https://firebase.google.com/docs)
3. Check [Cloud Run documentation](https://cloud.google.com/run/docs)
4. Open an issue on GitHub
