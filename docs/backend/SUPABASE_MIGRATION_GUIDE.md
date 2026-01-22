# Supabase Migration Guide for Attendance Tracker App

## Overview
This guide documents the migration from MongoDB to Supabase PostgreSQL database.

## Important Changes

### 1. Environment Variables (.env)
**OLD (MongoDB):**
```
MONGO_URI=mongodb+srv://...
```

**NEW (Supabase):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
LOG_LEVEL=info
```

### 2. Database Setup
Run the SQL schema in `schema.sql` in your Supabase SQL Editor to create all required tables.

### 3. Field Name Changes (Snake Case in Database)
MongoDB fields used camelCase, Supabase PostgreSQL uses snake_case:

| MongoDB Field | Supabase Field |
|---------------|----------------|
| userId | user_id |
| loginTime | login_time |
| logoutTime | logout_time |
| deviceName | device_name |
| deviceType | device_type |
| deviceOS | device_os |
| ipAddress | ip_address |
| assignedTo | assigned_to |
| isActive | is_active |
| createdAt | created_at |
| updatedAt | updated_at |
| attendanceId | attendance_id |
| startTime | start_time |
| endTime | end_time |
| breakType | break_type |
| leaveType | leave_type |
| startDate | start_date |
| endDate | end_date |
| reviewedBy | reviewed_by |
| reviewedAt | reviewed_at |
| changeType | change_type |
| originalTime | original_time |
| requestedTime | requested_time |

### 4. ID Format Changes
- MongoDB uses: `_id` with ObjectId format
- Supabase uses: `id` with UUID format

### 5. Error Handling
New error tracking system implemented:
- All errors logged to `error_logs` table
- Winston logger for file-based logging
- Error IDs returned in API responses for debugging

### 6. Dependencies Changed
**Removed:**
- `mongoose`

**Added:**
- `@supabase/supabase-js` - Supabase client
- `winston` - Advanced logging

### 7. Key Files Modified
- `server.js` - Replaced MongoDB connection with Supabase
- `config/supabase.js` - New Supabase configuration
- `middleware/errorTracking.js` - New error tracking middleware
- `utils/supabaseHelpers.js` - Helper functions for database operations
- `routes/auth.js` - Updated to use Supabase
- `routes/attendance.js` - Updated to use Supabase

### 8. Model Files (Deprecated)
The following Mongoose model files are no longer used:
- `models/user.js`
- `models/attendance.js`
- `models/break.js`
- `models/leaveRequest.js`
- `models/timeChangeRequest.js`
- `models/settings.js`

All database operations now use Supabase client directly or through helper functions.

## Migration Steps

### Step 1: Set Up Supabase Project
1. Create a Supabase project at https://supabase.com
2. Get your project URL and service role key from Settings > API
3. Update `.env` file with Supabase credentials

### Step 2: Run Database Schema
1. Open Supabase SQL Editor
2. Copy contents from `schema.sql`
3. Execute the SQL script

### Step 3: Install Dependencies
```bash
cd Attendance_Tracker-backend
npm install
```

### Step 4: Test the Backend
```bash
npm run dev
```

### Step 5: Verify Health Check
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Attendance Tracker Backend API",
  "timestamp": "...",
  "database": "connected"
}
```

## Error Tracking Features

### Backend Error Logging
1. **Console Logging**: Errors printed to console with color coding
2. **File Logging**: Errors saved to `logs/error.log` and `logs/combined.log`
3. **Database Logging**: Errors saved to `error_logs` table in Supabase

### Error Response Format
```json
{
  "error": "Error message",
  "errorId": "1234567890",
  "stack": "..." // Only in development mode
}
```

### Accessing Error Logs
Query the `error_logs` table in Supabase:
```sql
SELECT * FROM error_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

## Troubleshooting

### Issue: "SUPABASE_URL environment variable is not set"
**Solution**: Ensure `.env` file has proper Supabase credentials

### Issue: "Failed to log error to database"
**Solution**: Check that `error_logs` table exists in Supabase

### Issue: "User not found" after migration
**Solution**: Default superadmin created by schema.sql
- Email: admin@attendance.com
- Password: Admin@123 (CHANGE IMMEDIATELY!)

### Issue: Database connection errors
**Solution**: 
1. Verify Supabase project is not paused
2. Check service role key is correct
3. Ensure IP is allowlisted in Supabase settings

## API Changes

Most API endpoints remain the same, but response formats have changed slightly:

### User Object (Before)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "isActive": true,
  "assignedTo": "507f191e810c19729de860ea"
}
```

### User Object (After)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_active": true,
  "assigned_to": "550e8400-e29b-41d4-a716-446655440001"
}
```

## Frontend Updates Required

The frontend needs minor updates to handle the new field names. Update `src/utils/api.ts` to transform responses as needed.

## Performance Improvements

Supabase offers several advantages:
1. **Built-in connection pooling**
2. **PostgreSQL performance**
3. **Real-time subscriptions** (can be enabled)
4. **Row Level Security** (can be configured)
5. **Automatic backups**

## Next Steps

1. ✅ Migrate backend to Supabase
2. ⏳ Update frontend to handle new response formats
3. ⏳ Add frontend error tracking
4. ⏳ Test all features thoroughly
5. ⏳ Update frontend to use error tracking

## Support

For issues with this migration:
1. Check the `error_logs` table in Supabase
2. Check `logs/error.log` file
3. Review this migration guide
