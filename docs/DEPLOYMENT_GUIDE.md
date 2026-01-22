# Deployment Guide - Attendance Tracker App

This guide will walk you through deploying the Attendance Tracker App with:
- **Frontend** on Vercel
- **Backend** on Render
- **Database** on Supabase (PostgreSQL)

## Prerequisites

1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Render account (sign up at render.com)
4. Supabase account (sign up at supabase.com)

## Step 1: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com)
2. Create a new project:
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., `attendance-tracker`)
   - Enter a strong database password (save this securely!)
   - Select a region close to your users
   - Click "Create new project" (takes 2-3 minutes)

3. Set up database schema:
   - Go to "SQL Editor" in the sidebar
   - Click "New Query"
   - Copy the entire contents of `Attendance_Tracker-backend/schema.sql`
   - Paste into the SQL editor
   - Click "Run" or press F5
   - Verify success: You should see "Success. No rows returned" and 8 tables created

4. Get your API credentials:
   - Go to "Settings" (gear icon) → "API"
   - Copy these values:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: The `anon` key
     - **service_role key**: Click "Reveal" to see the secret key
   - ⚠️ Keep the service_role key secure! Never commit it to Git

Example credentials format:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

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
     SUPABASE_URL=your_supabase_project_url_from_step1
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_step1
     SUPABASE_ANON_KEY=your_anon_key_from_step1
     JWT_SECRET=your_super_secret_jwt_key_min_32_chars
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     LOG_LEVEL=info
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

## Step 5: Verify Default Admin User

The database schema automatically creates a default superadmin user when you run `schema.sql`:

**Default Credentials:**
- **Email**: `admin@attendance.com`
- **Password**: `Admin@123`

**⚠️ IMPORTANT SECURITY STEPS:**

1. **Login immediately** after deployment:
   - Visit your Vercel frontend URL
   - Login with the default credentials

2. **Change the password immediately**:
   - Go to account/profile settings
   - Update to a strong, unique password
   - Save the new credentials securely

3. **Update the default email** (recommended):
   - Use the User Management interface in the app
   - Or update directly in Supabase:
     - Go to Supabase Dashboard → Table Editor
     - Select `users` table
     - Find admin user and update email

4. **Verify user exists** in Supabase:
   - Supabase Dashboard → Table Editor
   - Select `users` table
   - Confirm admin user is present with role = 'superadmin'

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
   - Look for Supabase connection errors

2. **Supabase Connection Failed**: 
   - Verify `SUPABASE_URL` is correct (should start with https://)
   - Check `SUPABASE_SERVICE_ROLE_KEY` is the service_role key, not anon key
   - Ensure your Supabase project is active (not paused)
   - Test connection locally first with same credentials

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

### Supabase Issues

1. **Authentication Failed**:
   - Verify API keys are correct in environment variables
   - Check if you're using service_role key for backend (not anon key)

2. **Tables Not Found**:
   - Verify schema.sql was executed successfully
   - Check Supabase Table Editor to confirm 8 tables exist

3. **Permission Errors**:
   - If Row Level Security (RLS) is enabled, configure policies
   - Service role key bypasses RLS by default

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

### Supabase
- Database Stats: Supabase Dashboard → Home (shows database size, API requests)
- Logs: Supabase Dashboard → Logs Explorer
- Performance: Supabase Dashboard → Reports

## Cost Information

- **Vercel Free Tier**: 100GB bandwidth/month, unlimited projects
- **Render Free Tier**: Service spins down after 15 min of inactivity, 750 hours/month
- **Supabase Free Tier**: 500MB database, 2GB bandwidth/month, 50,000 monthly active users

## Security Best Practices

1. Use strong JWT_SECRET (min 32 characters, random)
2. Enable environment variable encryption on both platforms
3. Regularly rotate credentials
4. Configure Supabase Row Level Security (RLS) policies for production
5. Enable Supabase audit logs
6. Set up monitoring and alerts
7. Never commit .env files or API keys to Git
7. Keep dependencies updated

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Vercel/Render)
3. Set up monitoring alerts
4. Configure backup strategy (Supabase has automatic daily backups)
5. Implement logging service (e.g., Papertrail, Logtail)
6. Add error tracking (built-in with error_logs table)

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create issues in respective repositories
