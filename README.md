# 📋 Problem Reporting App

A complete, production-ready problem reporting system where citizens can submit reports with photos, voice recordings, and GPS location data.

## ✨ Features

### 📱 Mobile App
- **Text Reports**: Title and detailed description with character counters
- **Categorization**: Infrastructure, Safety, Environment, Service, Other
- **Priority Levels**: Low, Medium, High, Critical
- **📸 Image Upload**: Pick photos from device with preview
- **🎤 Voice Recording**: Record audio directly in app with playback
- **📍 GPS Location**: Capture location with permission handling
- **✅ Form Validation**: Smart validation for title (3+ chars) and description (10+ chars)
- **🔌 Backend Testing**: Built-in connection test button
- **🎨 Modern UI**: Beautiful, responsive interface with Tailwind-inspired design
- **⚡ Real-time Feedback**: Success/error alerts with submission status

### 🖥️ Admin Dashboard
- **📊 Real-time Statistics**: Total reports, by category and priority
- **🔍 Advanced Search**: Search by title or description
- **🏷️ Multi-filter Support**: Filter by status, category, and priority
- **📄 Pagination**: View reports in pages
- **📸 Media Viewer**: Click to expand images, play audio
- **📍 Location Display**: View report coordinates
- **⚙️ Status Management**: Update report status from dashboard
- **📱 Responsive Design**: Works on desktop and tablets

### 🔧 Backend API
- **Validation**: Input validation with Joi schemas
- **Rate Limiting**: Protection against abuse
- **File Uploads**: Multer with type and size validation
- **Search & Filter**: MongoDB aggregation for complex queries
- **Geospatial**: Find nearby reports by location
- **Pagination**: Efficient data retrieval
- **Error Handling**: Comprehensive error responses
- **Logging**: Detailed console logging for debugging

---

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Mobile App:**
```bash
cd mobile
npm install
```

### 2. Start Services

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
✅ Server runs on `http://localhost:5000`
✅ Admin dashboard: `http://localhost:5000/admin`

**Terminal 2 - Mobile App:**
```bash
cd mobile
npx expo start --web
```
✅ App available at `http://localhost:8081` (or next available port like 8082, 8083)

### 3. Test the Application

1. **Open the web app** in your browser (localhost:8081)
2. **Click "Test Connection"** to verify backend connectivity
3. **Fill out the form**:
   - Enter a title (minimum 3 characters)
   - Enter a description (minimum 10 characters)
   - Select a category
   - Select a priority level
   - Optionally add an image or record audio
   - Optionally capture GPS location
4. **Click "Submit Report"**
5. **Wait for success message** with the report ID
6. **View in admin dashboard** at `http://localhost:5000/admin`

---

## 📁 Project Structure

```
problem-reporting-app/
├── server/                          # Backend API
│   ├── src/
│   │   ├── server.js               # Express server with all endpoints
│   │   └── models/
│   │       └── Report.js           # MongoDB schema
│   ├── public/
│   │   └── admin.html              # Admin dashboard
│   ├── uploads/                    # User-uploaded files
│   ├── package.json
│   └── README.md
│
├── mobile/                          # React Native app
│   ├── app/
│   │   ├── (tabs)/
│   │   │   └── index.tsx          # Main problem reporting screen
│   │   ├── _layout.tsx
│   │   └── modal.tsx
│   ├── components/                 # Reusable components
│   ├── constants/                  # App constants
│   ├── hooks/                      # Custom React hooks
│   ├── assets/                     # Images and icons
│   ├── package.json
│   └── tsconfig.json
│
├── DEPLOYMENT.md                   # Deployment guide
└── README.md                       # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - React Native development platform
- **Expo Router** - File-based routing
- **TypeScript** - Type-safe JavaScript
- **expo-image-picker** - Image selection
- **expo-location** - GPS location
- **expo-av** - Audio recording/playback

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Joi** - Input validation
- **Multer** - File upload handling
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

---

## 📊 API Documentation

### Submit Report
```
POST /api/reports
Content-Type: multipart/form-data

Form Fields:
- title (string, required): 3-100 characters
- description (string, required): 10-500 characters
- category (string): infrastructure|safety|environment|service|other
- priority (string): low|medium|high|critical
- image (file, optional): Max 15MB, image/*
- audio (file, optional): Max 15MB, audio/*
- latitude (number, optional): GPS latitude
- longitude (number, optional): GPS longitude
- locationConsent (string): 'true' or 'false'

Response:
{
  "success": true,
  "message": "Report saved successfully",
  "reportId": "63f5a1b2c9d8e1f0a2b3c4d5"
}
```

### Get Reports
```
GET /api/reports?page=1&limit=20&search=&category=&priority=&status=

Query Parameters:
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 20, max: 50)
- search (string): Search in title/description
- category (string): Filter by category
- priority (string): Filter by priority
- status (string): Filter by status

Response:
{
  "success": true,
  "reports": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Update Status
```
PATCH /api/reports/:id/status
Content-Type: application/json

Body:
{
  "status": "in_review" | "resolved"
}

Response:
{
  "success": true,
  "report": {...}
}
```

---

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the `server/` directory:
```env
MONGO_URI=mongodb://127.0.0.1:27017/problem_reporting
PORT=5000
NODE_ENV=development
```

### API URL Configuration
The mobile app automatically detects the platform:
- **Web/Local**: `http://localhost:5000`
- **Android/iOS Device**: `http://192.168.1.3:5000` (adjust IP as needed)

Edit the `API_BASE_URL` in `mobile/app/(tabs)/index.tsx` to match your backend URL.

---

## 🔌 Connectivity

### Web App (Localhost)
- Frontend: http://localhost:8081 (or 8082, 8083)
- Backend: http://localhost:5000
- Admin: http://localhost:5000/admin

### Physical Device/Emulator
- Find your PC IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Use format: `http://192.168.x.x:5000`
- Both mobile and backend must be on the same network

---

## 🗄️ Database

### MongoDB Setup

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster and database
3. Get connection string
4. Set `MONGO_URI` in `.env`

### Database Structure
- **Database**: `problem_reporting`
- **Collection**: `reports` (auto-created)

---

## 🔒 Security Notes

- Rate limiting is enabled (50 requests/15 min for uploads)
- Input validation prevents malicious data
- File uploads are validated by type and size
- CORS is enabled for development (restrict for production)
- No authentication is implemented (add for production)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill the process and retry
sudo kill -9 <PID>

# Verify MongoDB is running
mongosh
```

### Mobile app can't connect to backend
1. Check both are running (`http://localhost:5000/api/health` in browser)
2. For device: Use PC IP address instead of localhost
3. Ensure both are on the same WiFi network
4. Check firewall settings

### Image/Audio upload fails
1. Check `server/uploads/` directory exists
2. Verify file is under 15MB
3. Ensure file type is valid (image/* or audio/*)
4. Check disk space

### Admin dashboard not loading
1. Verify backend is running
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console for errors (F12)
4. Verify MongoDB connection

---

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev)
- [React Native Guide](https://reactnative.dev)
- [Express.js API Reference](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Mongoose ODM](https://mongoosejs.com)

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions for:
- Docker
- Heroku
- AWS
- Vercel
- Custom VPS

---

## 📝 License

This project is open source and ready for production use.

---

## ✅ Checklist for First Run

- [ ] Node.js and npm installed
- [ ] MongoDB running locally
- [ ] Backend dependencies installed (`cd server && npm install`)
- [ ] Mobile dependencies installed (`cd mobile && npm install`)
- [ ] Backend started (`npm run dev` in server/)
- [ ] Mobile app started (`npx expo start --web` in mobile/)
- [ ] Web app opens in browser
- [ ] Test connection button works
- [ ] Sample report submitted successfully
- [ ] Report appears in admin dashboard

---

**Ready to deploy!** 🎉 See DEPLOYMENT.md for production setup.
