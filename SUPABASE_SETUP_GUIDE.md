# 🚀 Supabase Setup - Quick Reference

## Step-by-Step Setup Guide

### 1️⃣ Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Sign up/Sign in
3. Create new project
4. Set project name: `attendance-tracker`
5. Set strong database password (save it!)
6. Choose region closest to users
7. Wait 2-3 minutes for initialization

### 2️⃣ Get API Credentials (2 minutes)

Navigate to: **Settings** → **API**

Copy these 3 values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NEVER expose Service Role Key publicly!**

### 3️⃣ Create Database Schema (3 minutes)

1. In Supabase dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy all content from `Attendance_Tracker-backend/schema.sql`
4. Paste into SQL Editor
5. Click **"Run"** (F5)
6. Verify success message

**Verify tables created:**
Go to **Table Editor** → Should see 8 tables:
- ✅ users
- ✅ attendance
- ✅ breaks
- ✅ time_change_requests
- ✅ leave_requests
- ✅ settings
- ✅ error_logs
- ✅ health_checks

### 4️⃣ Configure Backend Environment (2 minutes)

Create/Update `Attendance_Tracker-backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-me

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Replace:**
- `SUPABASE_URL` → Your Project URL
- `SUPABASE_SERVICE_ROLE_KEY` → Your Service Role Key
- `SUPABASE_ANON_KEY` → Your Anon Key
- `JWT_SECRET` → Generate random string (e.g., `openssl rand -base64 32`)

### 5️⃣ Test Local Setup (5 minutes)

**Start Backend:**
```bash
cd "Attendance_Tracker-backend"
npm install
npm run dev
```

Expected output:
```
✓ Supabase connected successfully
✓ Server running on port 5000
```

**Test health check:**
Open: http://localhost:5000/api/health

Should return:
```json
{"status":"ok","database":"connected"}
```

**Start Frontend:**
```bash
cd ..
npm install
npm run dev
```

Open: http://localhost:5173

**Test login:**
- Email: `admin@attendance.com`
- Password: `Admin@123`

---

## 🌐 Production Deployment

### Vercel (Frontend)

**Environment Variables to Add:**
```
SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGci...
```

**Build Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### Render (Backend)

**Environment Variables to Add:**
```
SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci...
SUPABASE_ANON_KEY = eyJhbGci...
JWT_SECRET = your-secret-key
NODE_ENV = production
CLIENT_URL = https://your-app.vercel.app
```

**Service Settings:**
- Environment: Node
- Build Command: `npm install`
- Start Command: `node server.js`
- Root Directory: `Attendance_Tracker-backend`

---

## ✅ Quick Verification

Run these checks to ensure everything works:

1. **Database:** Tables exist in Supabase Table Editor
2. **Backend Health:** `curl http://localhost:5000/api/health`
3. **Frontend:** Opens without errors
4. **Login:** Default credentials work
5. **Dashboard:** Loads after login

---

## 🐛 Common Issues & Solutions

### Issue: "Supabase connection failed"
**Solution:** Check `.env` file has correct credentials, no extra spaces

### Issue: "relation 'users' does not exist"
**Solution:** Run `schema.sql` in Supabase SQL Editor

### Issue: Build fails with JSX errors
**Solution:** 
```bash
npm run build  # Check for syntax errors
# Fix any errors shown
git add .
git commit -m "Fix build errors"
git push
```

### Issue: CORS error in production
**Solution:** Update `CLIENT_URL` in backend environment variables to your Vercel URL

---

## 🔐 Security Checklist

- [ ] Service Role Key is NEVER in frontend code
- [ ] Service Role Key is in `.gitignore`
- [ ] `.env` file is in `.gitignore`
- [ ] Changed default admin password
- [ ] Using HTTPS in production
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables set in Vercel/Render

---

## 📱 Contact & Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check backend logs: Render → Logs
3. Check frontend console: Browser DevTools (F12)
4. Review full documentation: `IMPLEMENTATION_SUMMARY.md`

---

**Setup Time:** ~15-20 minutes
**Last Updated:** January 23, 2026
