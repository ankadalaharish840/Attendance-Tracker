# 🚀 QUICK SETUP GUIDE

## 1️⃣ Create Supabase Project (5 minutes)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Name: `attendance-tracker`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for project creation

## 2️⃣ Get Your Credentials (2 minutes)

1. In Supabase Dashboard, go to **Settings** (gear icon)
2. Click **API** in left sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **service_role key** (secret) - Click "Reveal" and copy

## 3️⃣ Run Database Schema (3 minutes)

1. In Supabase Dashboard, click **SQL Editor** (icon in left sidebar)
2. Click **"New Query"**
3. Open file: `d:\Projects\Attendance Tracker App\Attendance_Tracker-backend\schema.sql`
4. Copy ALL content (Ctrl+A, Ctrl+C)
5. Paste into SQL Editor (Ctrl+V)
6. Click **RUN** button (or F5)
7. You should see: `Success. No rows returned`
8. Click **Table Editor** - verify 8 tables created

## 4️⃣ Update Environment File (1 minute)

1. Open: `d:\Projects\Attendance Tracker App\Attendance_Tracker-backend\.env`
2. Replace these lines:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
   With YOUR values from Step 2
3. Save file (Ctrl+S)

## 5️⃣ Start Backend (1 minute)

Open terminal:
```powershell
cd "d:\Projects\Attendance Tracker App\Attendance_Tracker-backend"
npm run dev
```

✅ Success looks like:
```
Supabase connected successfully
Server running on port 5000 in development mode
```

❌ Error? Check:
- Is .env file updated?
- Are credentials correct?
- Is Supabase project active?

## 6️⃣ Start Frontend (1 minute)

Open NEW terminal:
```powershell
cd "d:\Projects\Attendance Tracker App"
npm run dev
```

✅ Success looks like:
```
VITE ready in xxx ms
➜ Local: http://localhost:5173/
```

## 7️⃣ Login & Test (2 minutes)

1. Open browser: http://localhost:5173
2. Login with:
   - **Email**: `admin@attendance.com`
   - **Password**: `Admin@123`
3. You should see Super Admin Dashboard
4. **IMPORTANT**: Change password immediately!

## ✅ Verification

Test these quickly:
- [ ] Backend running (http://localhost:5000/api/health)
- [ ] Frontend running (http://localhost:5173)
- [ ] Can login
- [ ] Can see dashboard
- [ ] Can create a test user
- [ ] Can clock in/out

## 🚨 Common Issues

### "SUPABASE_URL environment variable is not set"
➜ Update .env file in `Attendance_Tracker-backend/` folder

### "Failed to fetch" or "Network error"
➜ Backend not running. Start it first (Step 5)

### "Database error" or "PGRST"
➜ Schema not run. Go back to Step 3

### "Invalid credentials" at login
➜ Schema not run OR wrong password. Default is `Admin@123`

## 📱 Quick Commands

```powershell
# Backend
cd "d:\Projects\Attendance Tracker App\Attendance_Tracker-backend"
npm run dev

# Frontend (new terminal)
cd "d:\Projects\Attendance Tracker App"
npm run dev

# View backend logs
tail -f "d:\Projects\Attendance Tracker App\Attendance_Tracker-backend\logs\combined.log"

# View errors
tail -f "d:\Projects\Attendance Tracker App\Attendance_Tracker-backend\logs\error.log"
```

## 🔍 Test Error Tracking

1. **Trigger an error**: Try creating user with invalid email
2. **Check backend logs**: Look in `logs/error.log`
3. **Check Supabase**:
   - Go to Table Editor → `error_logs`
   - See error logged
4. **Check frontend**: Open DevTools Console

## 📚 Full Documentation

- **Main Guide**: `MIGRATION_AND_ERROR_TRACKING_README.md`
- **Technical Guide**: `Attendance_Tracker-backend/SUPABASE_MIGRATION_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

## ⏱️ Total Time: ~15 minutes

Steps 1-4: One-time setup (11 minutes)
Steps 5-7: Every time you start the app (4 minutes)

## 🎉 Done!

Your app is now running with:
✅ Supabase (PostgreSQL) database
✅ Error tracking & logging
✅ Production-ready monitoring

---

**Need Help?** Check the full guides or Supabase dashboard error logs!
