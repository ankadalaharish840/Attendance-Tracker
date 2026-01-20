# Deployment Guide - Attendance Tracker App

This guide will walk you through deploying the Attendance Tracker App with:
- **Frontend** on Vercel
- **Backend** on Render
- **Database** on MongoDB Atlas

## Prerequisites

1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Render account (sign up at render.com)
4. MongoDB Atlas account (sign up at mongodb.com/atlas)

## Step 1: Set Up MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Choose password authentication
   - Save username and password securely
4. Whitelist IP addresses:
   - Click "Network Access" → "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
5. Get connection string:
   - Click "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with your database name (e.g., `attendance_tracker`)

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/attendance_tracker?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Render

### Option A: Using GitHub

1. Push backend code to GitHub:
   ```bash
   cd "d:\Projects\Attendance Tracker App\Attendance_Tracker-backend"
   
   # If you haven't added a remote yet:
   git remote add origin https://github.com/YOUR_USERNAME/Attendance_Tracker-backend.git
   git push -u origin master
   ```

2. Create Web Service on Render:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (`Attendance_Tracker-backend`)
   - Configure:
     - **Name**: attendance-tracker-backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. Add Environment Variables in Render:
   - Click "Environment" tab
   - Add these variables:
     ```
     MONGO_URI=your_mongodb_connection_string_from_step1
     JWT_SECRET=your_super_secret_jwt_key_min_32_chars
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```
   - Note: You'll update `FRONTEND_URL` after deploying frontend

4. Click "Create Web Service"
5. Wait for deployment (first build takes 2-3 minutes)
6. Copy your backend URL (e.g., `https://attendance-tracker-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

### Option A: Using GitHub

1. Push frontend code to GitHub:
   ```bash
   cd "d:\Projects\Attendance Tracker App"
   
   # If you haven't added a remote yet:
   git remote add origin https://github.com/YOUR_USERNAME/Attendance_Tracker.git
   git push -u origin main
   ```

2. Import Project to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository (`Attendance_Tracker`)
   - Vercel will auto-detect Vite

3. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```
   - Use the Render backend URL from Step 2

5. Click "Deploy"
6. Wait for deployment (1-2 minutes)
7. Copy your frontend URL (e.g., `https://attendance-tracker.vercel.app`)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd "d:\Projects\Attendance Tracker App"

# Deploy
vercel

# Follow the prompts and set environment variable when asked:
# VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Step 4: Update Backend CORS Settings

1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL:
   ```
   FRONTEND_URL=https://attendance-tracker.vercel.app
   ```
3. This will trigger a redeploy (automatic)

## Step 5: Create Initial Admin User

Since you're using MongoDB, you need to create an initial user. You can do this by:

### Option A: Using MongoDB Compass or Atlas UI
1. Connect to your MongoDB database
2. Insert a document in the `users` collection:
   ```json
   {
     "email": "admin@example.com",
     "password": "$2a$10$HASHED_PASSWORD_HERE",
     "role": "superadmin",
     "name": "Admin User",
     "team": "Management"
   }
   ```

### Option B: Add a signup endpoint temporarily
Or you can add a temporary signup route to create your first admin user, then remove it.

## Step 6: Test Your Application

1. Visit your Vercel URL
2. Try logging in with your admin credentials
3. Test the main features:
   - Login/Authentication
   - Dashboard
   - Time tracking
   - User management (if admin)

## Troubleshooting

### Backend Issues

1. **500 Error**: Check Render logs
   - Go to Render dashboard → Your service → Logs
   - Look for MongoDB connection errors

2. **MongoDB Connection Failed**: 
   - Verify `MONGO_URI` is correct
   - Check if IP whitelist includes 0.0.0.0/0
   - Ensure password doesn't have special characters that need encoding

3. **CORS Errors**:
   - Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
   - No trailing slash

### Frontend Issues

1. **API Connection Failed**:
   - Verify `VITE_API_URL` in Vercel settings
   - Check if backend is running (visit backend URL in browser)
   - Open browser console for error details

2. **Build Failed**:
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Try building locally: `npm run build`

### MongoDB Issues

1. **Authentication Failed**:
   - Verify username/password in connection string
   - Check database user permissions

2. **Network Error**:
   - Verify network access settings (0.0.0.0/0)
   - Try pinging the cluster URL

## Updating Your Application

### Frontend Updates
```bash
cd "d:\Projects\Attendance Tracker App"
git add .
git commit -m "Your update message"
git push origin main
# Vercel will auto-deploy
```

### Backend Updates
```bash
cd "d:\Projects\Attendance Tracker App\Attendance_Tracker-backend"
git add .
git commit -m "Your update message"
git push origin master
# Render will auto-deploy
```

## Monitoring

### Vercel
- Analytics: Vercel dashboard → Your project → Analytics
- Logs: Vercel dashboard → Your project → Deployments → Click deployment → View Function Logs

### Render
- Logs: Render dashboard → Your service → Logs (live tail)
- Metrics: Render dashboard → Your service → Metrics

### MongoDB Atlas
- Monitoring: Atlas dashboard → Your cluster → Metrics
- Logs: Atlas dashboard → Your cluster → Logs

## Cost Information

- **Vercel Free Tier**: 100GB bandwidth/month, unlimited projects
- **Render Free Tier**: Service spins down after 15 min of inactivity, 750 hours/month
- **MongoDB Atlas Free Tier**: 512MB storage, shared cluster

## Security Best Practices

1. Use strong JWT_SECRET (min 32 characters, random)
2. Enable environment variable encryption on both platforms
3. Regularly rotate credentials
4. Use MongoDB Atlas IP whitelist (restrict to known IPs in production)
5. Enable MongoDB Atlas audit logs
6. Set up monitoring and alerts
7. Keep dependencies updated

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Vercel/Render)
3. Set up monitoring alerts
4. Configure backup strategy for MongoDB
5. Implement logging service (e.g., Papertrail, Logtail)
6. Add error tracking (e.g., Sentry)

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- GitHub Issues: Create issues in respective repositories
