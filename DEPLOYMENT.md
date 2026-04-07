# Problem Reporting App - Deployment Guide

## 🚀 System Overview

A full-stack problem reporting application with mobile-first design, featuring:
- **Frontend**: React Native (Expo) - Cross-platform mobile/web
- **Backend**: Node.js + Express API
- **Database**: MongoDB
- **Features**: Image upload, voice recording, GPS location, categorization, priority levels

---

## 📋 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 5.0+ running locally or remote URI
- Windows/macOS/Linux with npm installed

### Backend Setup
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
# Admin dashboard: http://localhost:5000/admin
```

### Mobile App Setup
```bash
cd mobile
npm install
npx expo start --web
# Web app available at http://localhost:8081 (or next available port)
```

---

## 🏗️ Architecture

### Backend API (`server/src/server.js`)
**Port**: 5000

**Key Endpoints**:
- `POST /api/reports` - Submit report with files (images, audio)
- `GET /api/reports` - Get all reports with pagination, filtering, search
- `PATCH /api/reports/:id/status` - Update report status
- `GET /api/reports/nearby` - Geospatial query for nearby reports
- `GET /api/health` - Health check

**Features**:
- ✅ Input validation with Joi
- ✅ Rate limiting (50 req/15min for uploads, 100 for general)
- ✅ CORS enabled for all origins
- ✅ Multipart form-data file upload with Multer
- ✅ MongoDB integration with Mongoose
- ✅ Comprehensive logging with emoji indicators
- ✅ Error handling and file cleanup

### Mobile App (`mobile/app/(tabs)/index.tsx`)
**Tech Stack**: React Native + Expo, TypeScript

**Features**:
- 📝 Text input (title, description)
- 🏷️ Category selection (infrastructure, safety, environment, service, other)
- 🔴 Priority levels (low, medium, high, critical)
- 📷 Image picker with preview
- 🎤 Voice recording/playback
- 📍 GPS location capture with permission handling
- 📊 Character counters for inputs
- 🎨 Modern, responsive UI with Tailwind-inspired styling
- ✅ Form validation (min/max lengths)
- 🔌 Backend connection testing

### Admin Dashboard (`server/public/admin.html`)
**URL**: http://localhost:5000/admin

**Features**:
- 📊 Real-time report statistics
- 🔍 Search, filter, sort functionality
- 📸 Image preview with lightbox
- 🎵 Audio player
- 📍 Location display with coordinates
- 🏷️ Status badges and updates
- 📄 Pagination (configurable page size)
- 📱 Responsive grid layout

---

## 📦 Deployment by Environment

### Local Development
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Mobile Web
cd mobile && npx expo start --web
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]

# Environment variables needed:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/problem_reporting
# PORT=5000
```

### Cloud Deployment (Heroku, Railway, Render)

1. **Backend**:
```bash
# Push to cloud platform
git push heroku main

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set PORT=5000
```

2. **Mobile App**:
```bash
# Build Expo app for web
npx expo export --platform web

# Deploy to Vercel, Netlify, or similar
npm run build
```

### AWS Deployment

**Backend (EC2 or Lambda)**:
```bash
# EC2 Setup
sudo apt update && sudo apt install -y nodejs npm mongodb
npm install
npm start

# Lambda Setup
# Create Lambda function with Node.js 20 runtime
# Upload server code, set MONGO_URI environment variable
```

**Mobile (S3 + CloudFront)**:
```bash
npx expo export --platform web
# Upload build to S3 bucket
# Create CloudFront distribution for CDN
```

---

## 🔧 Configuration

### Environment Variables
Create `.env` file in `server/` directory:
```env
MONGO_URI=mongodb://127.0.0.1:27017/problem_reporting
PORT=5000
NODE_ENV=production
```

### Database Configuration
- **Host**: 127.0.0.1 (local) or MongoDB Atlas URI
- **Port**: 27017
- **Database**: `problem_reporting`
- **Collections**: `reports` (auto-created)

### File Upload Limits
- **Max file size**: 15MB
- **Accepted types**: 
  - Images: JPEG, PNG, WebP, GIF
  - Audio: M4A, WAV, MP3, AAC
- **Storage**: `server/uploads/` directory

---

## 🗄️ Database Schema

### Report Model
```javascript
{
  title: String (required, 3-100 chars),
  description: String (required, 10-500 chars),
  category: Enum [infrastructure|safety|environment|service|other],
  priority: Enum [low|medium|high|critical],
  status: Enum [submitted|in_review|resolved],
  imageUrl: String (optional),
  audioUrl: String (optional),
  locationConsent: Boolean,
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON format
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes**:
- 2dsphere on `location` for geospatial queries
- Ascending on `createdAt` for efficient sorting

---

## 📊 API Examples

### Submit Report with Files
```bash
curl -X POST http://localhost:5000/api/reports \
  -F "title=Pothole on Main St" \
  -F "description=Large pothole blocking traffic lane 2" \
  -F "category=infrastructure" \
  -F "priority=high" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "locationConsent=true" \
  -F "image=@photo.jpg" \
  -F "audio=@voice.m4a"
```

### Get Reports with Filters
```bash
# Pagination
GET http://localhost:5000/api/reports?page=1&limit=20

# Search
GET http://localhost:5000/api/reports?search=pothole

# Filter by category
GET http://localhost:5000/api/reports?category=infrastructure

# Filter by status
GET http://localhost:5000/api/reports?status=submitted

# Combine filters
GET http://localhost:5000/api/reports?page=1&category=safety&priority=high&search=water
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/reports/63f5a1b2c9d8e1f0a2b3c4d5/status \
  -H "Content-Type: application/json" \
  -d '{"status":"in_review"}'
```

### Find Nearby Reports
```bash
GET http://localhost:5000/api/reports/nearby?lng=-74.0060&lat=40.7128&radius=5000
```

---

## 🔒 Security Considerations

- ✅ **CORS**: Configured to accept requests from all origins (adjust for production)
- ✅ **Rate Limiting**: 50 requests/15min for uploads, 100 for general API
- ✅ **Input Validation**: Joi schemas validate all inputs
- ✅ **File Upload**: Type and size validation with Multer
- ✅ **Error Handling**: No sensitive stack traces exposed to clients
- ⚠️ **Authentication**: Currently none (add JWT for production)
- ⚠️ **HTTPS**: Use in production (configure reverse proxy)
- ⚠️ **CORS Whitelist**: Replace `*` with specific domains

---

## 📈 Performance Optimization

### Backend
- Add caching layer (Redis) for frequently accessed data
- Implement GraphQL for optimized queries
- Use CDN for file uploads
- Add database connection pooling

### Mobile App
- Lazy load images with caching
- Compress audio before upload
- Use Web Workers for processing
- Implement service workers for offline support

---

## 🚨 Monitoring & Logging

### Application Logs
- Backend logs to console with emoji indicators
- All requests logged with timestamps
- Error logging with stack traces (dev only)

### Recommendations for Production
```bash
# Install monitoring tools
npm install winston express-prometheus

# Setup log aggregation (ELK, Datadog, etc.)
# Monitor MongoDB with Atlas monitoring
# Use APM (Application Performance Monitoring)
```

---

## 🧪 Testing

### Manual Testing
1. Open admin dashboard: http://localhost:5000/admin
2. Submit via web app: http://localhost:8083
3. Check response in browser console (F12)
4. Verify report appears in admin dashboard
5. Test filters and search functionality

### API Testing with Postman
- Import endpoints from API documentation
- Test file uploads with different media types
- Verify pagination and filtering
- Test geospatial queries

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Port 5000 already in use
lsof -i :5000  # Check what's using it
sudo kill -9 <PID>

# MongoDB connection fails
mongosh  # Verify MongoDB is running
# Check MONGO_URI environment variable

# File upload fails
# Check server/uploads/ directory exists and has write permissions
chmod 755 server/uploads/
```

### Mobile App Issues
```bash
# Clear cache and rebuild
rm -rf .expo node_modules
npm install
npx expo start --web --clear

# Port conflicts
# App will automatically use next available port (8082, 8083, etc.)

# Connection to backend fails
# Verify API_BASE_URL in index.tsx matches your backend URL
# For web: http://localhost:5000
# For device: http://192.168.x.x:5000
```

---

## 📝 Checklist for Production Deployment

- [ ] Set environment variables (MONGO_URI, PORT, NODE_ENV)
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure CORS whitelist for allowed origins
- [ ] Implement authentication (JWT, OAuth)
- [ ] Setup database backups
- [ ] Configure logging and monitoring
- [ ] Setup error tracking (Sentry, Rollbar)
- [ ] Optimize images (compression middleware)
- [ ] Enable gzip compression
- [ ] Setup automated tests
- [ ] Create database indexes
- [ ] Document API endpoints
- [ ] Setup CI/CD pipeline
- [ ] Create database migration scripts
- [ ] Plan disaster recovery
- [ ] Setup uptime monitoring
- [ ] Configure rate limiting for production scale
- [ ] Cleanup old uploads periodically
- [ ] Add request validation middleware
- [ ] Setup reverse proxy (Nginx)

---

## 📞 Support & Documentation

- **API Docs**: See endpoint examples above
- **Database**: MongoDB documentation
- **Frontend**: Expo & React Native docs
- **Backend**: Express.js official guide
- **Mobile**: React Native documentation

---

## 📄 License & Attribution

This application is ready for deployment. All dependencies are production-grade and actively maintained.

**Last Updated**: April 7, 2026
**Version**: 1.0.0
