# Attendance Tracker App - Supabase Migration & Error Tracking

## 🎯 Summary of Changes

This update includes:
1. **Complete migration from MongoDB to Supabase (PostgreSQL)**
2. **Advanced error tracking and troubleshooting system** for both frontend and backend
3. **Comprehensive logging infrastructure** for debugging production issues

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 16+ installed
- A Supabase account (free tier works)

### Step 1: Set Up Supabase

1. **Create a Supabase project** at https://supabase.com
2. **Get your credentials**:
   - Go to Project Settings > API
   - Copy your `Project URL`
   - Copy your `service_role` key (NOT the anon key for backend)
   - Copy your `anon` key (for potential frontend use)

3. **Run the database schema**:
   - Open Supabase SQL Editor
   - Copy contents from `Attendance_Tracker-backend/schema.sql`
   - Execute the SQL script
   - Verify tables are created in Table Editor

### Step 2: Update Environment Variables

Edit `Attendance_Tracker-backend/.env`:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=a1f24a795d234439feefb4f5f0ff7951
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=info
```

**⚠️ IMPORTANT**: Replace the placeholder values with your actual Supabase credentials.

### Step 3: Install Backend Dependencies

```bash
cd "Attendance Tracker App/Attendance_Tracker-backend"
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client
- `winston` - Advanced logging
- All other existing dependencies (except mongoose which is removed)

### Step 4: Start the Backend

```bash
npm run dev
```

You should see:
```
Supabase connected successfully
Server running on port 5000 in development mode
```

### Step 5: Test Backend Health

Open a browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Attendance Tracker Backend API",
  "timestamp": "2026-01-21T...",
  "database": "connected"
}
```

### Step 6: Start the Frontend

```bash
cd "Attendance Tracker App"
npm install
npm run dev
```

### Step 7: Test Login

Default superadmin credentials (created by schema.sql):
- **Email**: admin@attendance.com
- **Password**: Admin@123

**⚠️ CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

## 📊 New Error Tracking Features

### Backend Error Tracking

#### 1. **Database Logging**
All errors are logged to the `error_logs` table in Supabase:

```sql
SELECT * FROM error_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

Fields logged:
- `error_message` - The error message
- `error_stack` - Full stack trace
- `error_type` - Type of error (APIError, ValidationError, etc.)
- `http_method` - HTTP method or "FRONTEND" for frontend errors
- `endpoint` - The API endpoint that failed
- `user_id` - User who encountered the error (if logged in)
- `ip_address` - Client IP address
- `user_agent` - Browser/client information
- `request_body` - Request payload (for debugging)
- `created_at` - Timestamp

#### 2. **File Logging**
Errors are also logged to files in `logs/` directory:
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs (info, warn, error)

Logs are automatically rotated (max 5 files, 5MB each).

#### 3. **Console Logging**
In development mode, errors are printed to console with color coding.

### Frontend Error Tracking

#### 1. **Global Error Handler**
Automatically catches:
- Uncaught JavaScript errors
- Unhandled promise rejections
- React component errors (via Error Boundary)

#### 2. **Error Boundary Component**
Wraps the entire app to catch React errors gracefully:
- Shows user-friendly error message
- Displays error details in development mode
- Provides "Try Again", "Reload Page", and "Download Logs" buttons
- Logs errors to backend automatically

#### 3. **Local Error Storage**
Errors are saved to browser localStorage:
- Last 100 errors kept
- Can be downloaded as JSON file
- Useful for debugging user-reported issues

#### 4. **API Error Tracking**
All API calls are automatically tracked:
- Failed requests logged with full context
- Network errors captured
- Sent to backend for centralized tracking

---

## 🔍 How to Troubleshoot Errors

### View Backend Errors

#### Option 1: Supabase Dashboard
1. Open Supabase Dashboard
2. Go to Table Editor
3. Select `error_logs` table
4. Sort by `created_at` descending

#### Option 2: SQL Query
```sql
-- Get recent errors
SELECT 
  error_message,
  error_type,
  endpoint,
  user_id,
  created_at
FROM error_logs
ORDER BY created_at DESC
LIMIT 50;

-- Get errors by user
SELECT *
FROM error_logs
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- Get errors by endpoint
SELECT *
FROM error_logs
WHERE endpoint LIKE '%/api/clock-in%'
ORDER BY created_at DESC;
```

#### Option 3: Log Files
```bash
# View error logs
tail -f Attendance_Tracker-backend/logs/error.log

# View all logs
tail -f Attendance_Tracker-backend/logs/combined.log
```

### View Frontend Errors

#### Option 1: Browser Console
Open DevTools Console to see errors in real-time (development mode).

#### Option 2: Download Error Logs
1. When an error occurs, click "Download Error Logs" button
2. This downloads a JSON file with all captured errors

#### Option 3: LocalStorage
Open DevTools Console:
```javascript
// View all errors
JSON.parse(localStorage.getItem('app_error_logs'))

// Clear error logs
localStorage.removeItem('app_error_logs')
```

---

## 🔄 Database Schema Changes

### Field Name Conventions
Supabase uses `snake_case` instead of `camelCase`:

| Old (MongoDB) | New (Supabase) |
|---------------|----------------|
| userId | user_id |
| loginTime | login_time |
| logoutTime | logout_time |
| assignedTo | assigned_to |
| isActive | is_active |

### ID Format
- **MongoDB**: `_id` with ObjectId format (e.g., `507f1f77bcf86cd799439011`)
- **Supabase**: `id` with UUID format (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### New Tables
1. `error_logs` - Stores all application errors
2. `health_checks` - Logs API health check status

---

## 📁 New Files Created

### Backend
```
Attendance_Tracker-backend/
├── config/
│   └── supabase.js                    # Supabase client configuration
├── middleware/
│   └── errorTracking.js               # Error tracking middleware
├── utils/
│   └── supabaseHelpers.js             # Database helper functions
├── logs/                               # Log files directory
│   ├── error.log
│   └── combined.log
├── schema.sql                          # Complete database schema
└── SUPABASE_MIGRATION_GUIDE.md        # Detailed migration guide
```

### Frontend
```
src/
├── utils/
│   └── errorTracker.ts                # Frontend error tracking utility
└── app/
    └── components/
        └── ErrorBoundary.tsx           # React error boundary
```

---

## 🔐 Security Improvements

1. **Environment Variables**: All sensitive data in `.env` file
2. **Service Role Key**: Used only on backend (never exposed to frontend)
3. **JWT Tokens**: Secure authentication maintained
4. **Input Validation**: Enhanced validation on all endpoints
5. **Error Messages**: Sanitized in production (no sensitive data exposed)
6. **CORS**: Restricted to specified frontend URL
7. **Helmet**: HTTP security headers enabled

---

## 🚨 Common Issues & Solutions

### Issue: "SUPABASE_URL environment variable is not set"
**Solution**: Ensure `.env` file exists in `Attendance_Tracker-backend/` with correct values.

### Issue: "Database connection failed"
**Solutions**:
1. Verify Supabase project is not paused (free tier auto-pauses after inactivity)
2. Check service role key is correct
3. Ensure project URL is correct
4. Check Supabase dashboard for service status

### Issue: "User not found" after migration
**Solution**: Run the schema.sql again to create default superadmin user.

### Issue: Frontend shows "Network error"
**Solutions**:
1. Verify backend is running (`npm run dev`)
2. Check backend is accessible at `http://localhost:5000`
3. Check browser console for CORS errors
4. Verify `FRONTEND_URL` in `.env` is set correctly

### Issue: Errors not appearing in error_logs table
**Solutions**:
1. Verify `error_logs` table exists in Supabase
2. Check table permissions (service role should have full access)
3. Check backend logs for "Failed to log error to database"

---

## 📈 Performance Benefits

### Supabase Advantages
1. **Connection Pooling**: Built-in, no configuration needed
2. **PostgreSQL Performance**: Superior to MongoDB for relational data
3. **Real-time**: Can enable real-time subscriptions (optional)
4. **Automatic Backups**: Point-in-time recovery available
5. **Row Level Security**: Can be configured for additional security
6. **PostgREST API**: Auto-generated REST API available

### Error Tracking Benefits
1. **Centralized Logging**: All errors in one place
2. **Historical Data**: Track error patterns over time
3. **User Context**: See which users encounter issues
4. **Quick Debugging**: Download frontend logs instantly
5. **Production Monitoring**: Track issues in production safely

---

## 🧪 Testing Checklist

After migration, test these features:

- [ ] Login with superadmin account
- [ ] Create new users (admin, agent)
- [ ] Clock in/out functionality
- [ ] Break start/end functionality
- [ ] Attendance calendar view
- [ ] User management (CRUD operations)
- [ ] Impersonation (superadmin only)
- [ ] Password reset
- [ ] Error tracking (trigger an error and check logs)
- [ ] Frontend error boundary (cause a React error)
- [ ] Health check endpoint
- [ ] Leave requests (if implemented)
- [ ] Time change requests (if implemented)

---

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Winston Logging**: https://github.com/winstonjs/winston
- **React Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

---

## 🆘 Getting Help

If you encounter issues:

1. **Check error logs** (database, files, or frontend console)
2. **Review this README** for common issues
3. **Check the migration guide**: `SUPABASE_MIGRATION_GUIDE.md`
4. **Verify environment variables** are set correctly
5. **Test backend health** endpoint first

---

## 📝 Next Steps

1. ✅ Backend migrated to Supabase
2. ✅ Error tracking implemented
3. ⏳ Change default superadmin password
4. ⏳ Test all features thoroughly
5. ⏳ Configure Supabase Row Level Security (optional)
6. ⏳ Set up email notifications for critical errors (optional)
7. ⏳ Configure backup strategy
8. ⏳ Deploy to production

---

## 🎉 Success!

You've successfully migrated to Supabase with comprehensive error tracking! 

The application now has:
- ✅ Modern PostgreSQL database
- ✅ Centralized error logging
- ✅ Frontend & backend error tracking
- ✅ Production-ready monitoring
- ✅ Better debugging capabilities

Happy tracking! 🚀
