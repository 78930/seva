# 🚀 Vercel Deployment Quick Start

## Three Easy Steps

### Step 1: Set Up MongoDB Atlas (5 minutes)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (Free Tier)
4. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/problem_reporting
5. Save this - you'll need it for Vercel
```

### Step 2: Deploy Backend to Vercel (3 minutes)
```
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "problem-reporting-app" from GitHub
4. Set Root Directory to: server
5. Add Environment Variable:
   - Name: MONGO_URI
   - Value: Your MongoDB connection string
6. Click "Deploy"
7. Copy your backend URL (e.g., https://problem-reporting-api.vercel.app)
```

### Step 3: Deploy Frontend to Vercel (3 minutes)
```
1. In Vercel: Click "Add New..." → "Project"
2. Select "problem-reporting-app" again
3. Set Root Directory to: mobile
4. Set Build Command: npx expo export --platform web
5. Set Output Directory: dist
6. Click "Deploy"
7. Copy your frontend URL (e.g., https://problem-reporting-app.vercel.app)
```

---

## 📋 What's Configured

✅ **Backend Configuration** (vercel.json)
- Express.js server setup
- Routes for API, admin, uploads
- Environment variables for MongoDB

✅ **Frontend Configuration** (Expo export)
- Web build optimization
- Static file deployment
- Production-ready bundle

✅ **Environment Variables**
- MONGO_URI: Your MongoDB connection
- NODE_ENV: Production
- CORS: Configured for your domain

---

## 🔗 After Deployment

Update API URL in your code (optional if on same domain):

**File**: `mobile/app/(tabs)/index.tsx` (Line 20)

```javascript
// Change from:
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://192.168.1.3:5000';

// To:
const API_BASE_URL = 'https://your-backend-domain.vercel.app';
```

Then push changes:
```bash
git add .
git commit -m "Update API URL for production Vercel domain"
git push origin main
```

---

## ✅ Test Your Deployment

After deployment, test these URLs:

```
Backend Health: https://your-backend.vercel.app/api/health
Admin Dashboard: https://your-backend.vercel.app/admin
Frontend App: https://your-frontend.vercel.app
```

All should return 200 OK ✅

---

## 📊 Monitoring

After deployment, check:

1. **Vercel Logs**: View in Vercel Dashboard → Logs tab
2. **MongoDB Status**: Check MongoDB Atlas dashboard
3. **Real-time Traffic**: Vercel Analytics section
4. **Error Tracking**: Check console errors in browser (F12)

---

## 🐛 If Something Goes Wrong

| Issue | Solution |
|-------|----------|
| Backend 500 error | Check MONGO_URI in Vercel env vars |
| Blank frontend | Check console (F12) for CORS errors |
| CORS errors | Backend might not have frontend domain in whitelist |
| Slow performance | Optimize MongoDB queries, check logs |
| Can't upload files | Check file size limits (15MB in backend) |

For detailed troubleshooting: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

## 📚 Full Deployment Guide

See **VERCEL_DEPLOYMENT.md** for:
- Detailed step-by-step instructions
- Environment variable setup
- Custom domain configuration
- Performance optimization
- Monitoring and scaling
- Rollback procedures

---

**Repository**: https://github.com/78930/seva
**Status**: ✅ Ready to deploy
**Last Updated**: April 7, 2026
