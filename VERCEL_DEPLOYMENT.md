# Vercel Deployment Guide

## Overview
This guide explains how to deploy the Problem Reporting App to Vercel.

### Architecture
- **Backend**: Node.js + Express API → Deploy to Vercel (Backend)
- **Frontend**: React Native (Expo Web) → Deploy to Vercel (Frontend) or Netlify
- **Database**: MongoDB Atlas (Cloud)

---

## Prerequisites
1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Account**: Connected to Vercel
3. **MongoDB Atlas**: Free tier cluster at https://www.mongodb.com/cloud/atlas
4. **Git**: Repository already uploaded to GitHub

---

## Step 1: MongoDB Atlas Setup

### Create MongoDB Atlas Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and sign in
3. Click **Create** → **Free Shared Cluster**
4. Choose region (closest to your users)
5. Click **Create Cluster**
6. Wait for cluster to be created (2-5 minutes)

### Get Connection String
1. Go to **Clusters** → Click **Connect**
2. Select **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `myFirstDatabase` with `problem_reporting`

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/problem_reporting?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel Web Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Click "Add New..."** → **Project**
3. **Select GitHub Repository**: problem-reporting-app
4. **Set Configuration**:
   - **Root Directory**: `server`
   - **Framework**: Other (Node.js)
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - Name: `MONGO_URI`
   - Value: Your MongoDB connection string from Step 1

6. **Click "Deploy"**
7. **Wait for deployment** (2-3 minutes)
8. **Copy your backend URL**: `https://your-backend-domain.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd c:\Users\nalla\Downloads\problem-reporting-app

# Deploy backend
cd server
vercel --env MONGO_URI=your_mongodb_uri

# Follow prompts and enter environment variables
```

### Verify Backend Deployment
```bash
curl https://your-backend-domain.vercel.app/api/health
# Response: {"ok":true,"message":"Server is running",...}
```

---

## Step 3: Build Mobile Frontend

```bash
cd mobile
npx expo export --platform web
```

This creates a `dist` folder with production-ready static files.

---

## Step 4: Deploy Frontend to Vercel

### Option A: Using Vercel Web Dashboard

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Click "Add New..."** → **Project**
3. **Select GitHub Repository**: problem-reporting-app
4. **Set Configuration**:
   - **Root Directory**: `mobile`
   - **Framework**: Other
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`

5. **Add Environment Variables** (optional):
   - Name: `REACT_APP_API_URL`
   - Value: Your backend domain from Step 2

6. **Click "Deploy"**
7. **Wait for deployment** (2-3 minutes)
8. **Copy your frontend URL**: `https://your-frontend-domain.vercel.app`

### Option B: Deploy to Netlify (Alternative)

```bash
# Build
cd mobile
npx expo export --platform web

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

---

## Step 5: Update API URL

If deployed, update the API URL in the mobile app to point to your backend:

**File**: `mobile/app/(tabs)/index.tsx`

```typescript
// Change from:
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://192.168.1.3:5000';

// To:
const API_BASE_URL = 'https://your-backend-domain.vercel.app';
```

Then redeploy the frontend.

---

## Step 6: Enable CORS for Production

Update your backend server to allow your frontend domain:

**File**: `server/src/server.js`

```javascript
// Change from:
app.use(cors());

// To:
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:3000',
    'http://localhost:8083'
  ]
}));
```

---

## Deployment URLs (Examples)

After successful deployment:
- **Backend API**: `https://problem-reporting-api.vercel.app`
- **Admin Dashboard**: `https://problem-reporting-api.vercel.app/admin`
- **Frontend App**: `https://problem-reporting-app.vercel.app`
- **Health Check**: `https://problem-reporting-api.vercel.app/api/health`

---

## Environment Variables Setup

### Backend (Vercel Backend Project)
```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/problem_reporting?retryWrites=true&w=majority
NODE_ENV = production
PORT = 3000
```

### Frontend (Vercel Frontend Project)
```
REACT_APP_API_URL = https://your-backend-domain.vercel.app
```

---

## Troubleshooting

### Backend Deployment Issues

**Error: "Cannot find module 'express'"**
- Ensure `package.json` exists in `/server`
- Verify all dependencies are listed
- Run: `npm install`

**Error: "MONGO_URI is undefined"**
- Add environment variable in Vercel project settings
- Format: `mongodb+srv://...`

**Error: "Port is already in use"**
- Vercel automatically assigns port (usually 3000)
- Remove hardcoded port configuration

### Frontend Deployment Issues

**Error: "Cannot find module 'expo'"**
- Run: `cd mobile && npm install`
- Rebuild: `npx expo export --platform web`

**Error: "Blank page appears"**
- Check browser console (F12)
- Verify API URL is correct
- Check if backend is running

### CORS Issues
If frontend can't reach backend:
1. Check network tab in browser (F12)
2. Verify CORS is enabled in backend
3. Confirm frontend domain is in CORS whitelist
4. Clear browser cache and retry

---

## Monitoring & Logs

### View Backend Logs
1. Go to Vercel Dashboard
2. Select your backend project
3. Click **Logs** tab
4. View real-time logs

### View Frontend Logs
1. Go to Vercel Dashboard
2. Select your frontend project
3. Click **Logs** tab
4. View build and runtime logs

---

## Custom Domain (Optional)

### Connect Custom Domain to Vercel
1. Go to Vercel Project Settings
2. Click **Domains**
3. Enter your custom domain (e.g., `api.myapp.com`)
4. Update DNS records at your domain registrar
5. Wait for DNS propagation (24-48 hours)

---

## Scaling & Optimization

### For Production Use
- ✅ Enable MongoDB backups (Atlas)
- ✅ Set rate limiting environment variable
- ✅ Enable database authentication
- ✅ Use HTTPS (automatic with Vercel)
- ✅ Setup error tracking (Sentry)
- ✅ Setup uptime monitoring
- ✅ Enable caching headers
- ✅ Optimize image uploads

### Performance Tips
- Use compression middleware
- Enable caching ("Cache-Control" headers)
- Use CDN for static assets
- Optimize database indexes
- Use query pagination
- Monitor logs regularly

---

## Rollback Deployment

If something goes wrong:

### Vercel Dashboard Rollback
1. Go to Vercel Project → **Deployments**
2. Find previous working deployment
3. Click **...** → **Promote to Production**

### Git Rollback
```bash
git log --oneline
git revert <commit-hash>
git push origin main
# Auto-redeploy on push
```

---

## Next Steps

After successful deployment:

1. **Test the application**:
   - Visit frontend URL
   - Submit test reports
   - Check admin dashboard

2. **Set up monitoring**:
   - Enable Vercel analytics
   - Setup error tracking
   - Monitor database usage

3. **Optimize performance**:
   - Check Vercel speed insights
   - Optimize database queries
   - Setup CDN for uploads

4. **Plan scaling**:
   - Monitor request rates
   - Plan for growth
   - Setup load testing

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Expo Docs**: https://docs.expo.dev
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Express.js Docs**: https://expressjs.com

---

**Deployment Date**: April 7, 2026
**Last Updated**: 2026-04-07
