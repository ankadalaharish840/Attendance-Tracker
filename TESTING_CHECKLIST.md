# 🧪 TESTING GUIDE - Attendance Tracker App

## Quick Test Checklist

### 1️⃣ Backend Setup
```powershell
cd "Attendance Tracker App/Attendance_Tracker-backend"
npm install
npm start
```
Expected: Server running on port 5000

### 2️⃣ Create Super Admin (First User)
**Endpoint:** `POST /api/auth/register`
```json
{
  "email": "superadmin@company.com",
  "password": "SuperAdmin@123",
  "name": "Super Admin",
  "role": "superadmin"
}
```

### 3️⃣ Login as Super Admin
**Endpoint:** `POST /api/auth/login`
```json
{
  "email": "superadmin@company.com",
  "password": "SuperAdmin@123"
}
```
Save the `token` from response!

### 4️⃣ Create Admin User
**Endpoint:** `POST /api/create-user`
**Headers:** `Authorization: Bearer YOUR_TOKEN`
```json
{
  "email": "admin@company.com",
  "password": "Admin@123",
  "name": "Admin User",
  "role": "admin",
  "team": "Team A"
}
```

### 5️⃣ Create Agent User
**Endpoint:** `POST /api/create-user`
**Headers:** `Authorization: Bearer YOUR_TOKEN`
```json
{
  "email": "agent@company.com",
  "password": "Agent@123",
  "name": "Agent User",
  "role": "agent",
  "team": "Team A",
  "assignedTo": "ADMIN_USER_ID"
}
```

### 6️⃣ Test Time Tracking (as Agent)

Login as agent, then:

**Clock In:**
```json
POST /api/clock-in
{
  "activity": "Available",
  "deviceName": "Windows PC",
  "deviceType": "Desktop",
  "deviceOS": "Windows"
}
```

**Start Break:**
```json
POST /api/start-break
{
  "breakType": "Lunch Break",
  "activity": "Available"
}
```

**End Break:**
```json
POST /api/end-break
{
  "breakId": "BREAK_ID_FROM_RESPONSE",
  "activity": "Available"
}
```

**Clock Out:**
```json
POST /api/clock-out
{}
```

### 7️⃣ Test Leave Request (as Agent)
```json
POST /api/leave-request
{
  "leaveType": "Sick Leave",
  "startDate": "2026-01-25",
  "endDate": "2026-01-26",
  "reason": "Not feeling well"
}
```

### 8️⃣ Test Time Change Request (as Agent)
```json
POST /api/time-change-request
{
  "type": "login",
  "date": "2026-01-20",
  "originalTime": "2026-01-20T09:30:00Z",
  "requestedTime": "2026-01-20T09:00:00Z",
  "reason": "Forgot to clock in on time"
}
```

### 9️⃣ Test Approval (as Admin/Super Admin)

**Get Pending Requests:**
```
GET /api/pending-requests
```

**Approve Time Change:**
```json
POST /api/approve-time-change
{
  "requestId": "REQUEST_ID",
  "approved": true
}
```

**Approve Leave:**
```json
POST /api/approve-leave
{
  "requestId": "REQUEST_ID",
  "approved": true
}
```

### 🔟 Test Live Dashboard (as Admin)
```
GET /api/admin-live-status
```
Should return today's summary and live agent status

### 1️⃣1️⃣ Test Calendar View
```
GET /api/attendance/USER_ID/2026/01
```
Should return attendance, breaks, and leaves for January 2026

### 1️⃣2️⃣ Test Settings Management (as Admin/Super Admin)

**Add Break Type:**
```json
POST /api/settings/break-types
{
  "breakTypes": ["Lunch Break", "Coffee Break", "Personal Break", "Meeting", "Restroom Break"]
}
```

**Add Activity:**
```json
POST /api/settings/activities
{
  "activities": ["Available", "In Call", "In Meeting", "On Task", "Away", "Training"]
}
```

**Create Schedule:**
```json
POST /api/settings/schedule
{
  "name": "Standard 9-5",
  "workDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "startTime": "09:00",
  "endTime": "17:00",
  "assignedUsers": ["USER_ID_1", "USER_ID_2"]
}
```

### 1️⃣3️⃣ Test Impersonation (as Super Admin)
```json
POST /api/impersonate
{
  "userId": "AGENT_USER_ID"
}
```
Returns new token for impersonated user

### 1️⃣4️⃣ Test Password Reset (as Super Admin)
```json
POST /api/reset-password
{
  "userId": "USER_ID",
  "newPassword": "NewPassword@123"
}
```

---

## 🎯 Frontend Testing

### Start Frontend
```powershell
cd "Attendance Tracker App"
npm install
npm run dev
```

### Test Flow:
1. **Login as Super Admin**
   - Go to login page
   - Enter credentials
   - Should see Super Admin Dashboard

2. **Create Users**
   - Go to "User Management" tab
   - Click "Add User"
   - Create admin and agents
   - Verify they appear in list

3. **Impersonate Agent**
   - Click "Login as User" for an agent
   - Should switch to Agent Dashboard

4. **Test Time Tracking (as Agent)**
   - Click first circle (Login)
   - Select activity from second circle
   - Start break from third circle
   - End break
   - Logout

5. **Submit Requests (as Agent)**
   - Click "Request Time Change"
   - Fill form and submit
   - Click "Request Leave"
   - Fill form and submit

6. **View Calendar (as Agent)**
   - Go to "My Attendance" tab
   - Should see calendar with today's entry
   - Click on a day to see details

7. **Switch Back to Super Admin**
   - Logout
   - Login as superadmin

8. **Approve Requests (as Super Admin)**
   - Go to "Requests" tab
   - Should see pending requests
   - Click approve/reject

9. **View Live Dashboard (as Super Admin)**
   - Go to "Dashboard" tab
   - Should see:
     - Today's summary (logged in, on break, offline)
     - Month summary
     - Live status of all agents

10. **Manage Settings (as Super Admin)**
    - Go to "Settings" tab
    - Add break types
    - Add activities
    - Create schedules
    - Assign schedules to users

11. **View Agent Calendar (as Super Admin)**
    - Go to "Attendance" tab
    - Select agent from dropdown
    - Select team from dropdown
    - View their attendance history

---

## ✅ Expected Results

### After Full Test Flow:
- ✅ Users created with different roles
- ✅ Agent has attendance record for today
- ✅ Break records stored
- ✅ Time change request in pending state → approved
- ✅ Leave request in pending state → approved
- ✅ Live dashboard shows real-time status
- ✅ Calendar shows full attendance history
- ✅ Settings updated with new break types and activities
- ✅ Password reset successful
- ✅ Impersonation working

---

## 🐛 Common Issues & Solutions

### Issue 1: "No token provided"
**Solution:** Include Authorization header: `Bearer YOUR_TOKEN`

### Issue 2: "Not clocked in"
**Solution:** Call `/api/clock-in` first before starting break or updating activity

### Issue 3: "Forbidden - Insufficient permissions"
**Solution:** Check user role matches endpoint requirements

### Issue 4: "Already clocked in"
**Solution:** User already has active attendance for today. Clock out first.

### Issue 5: "Please end your break before clocking out"
**Solution:** Call `/api/end-break` before `/api/clock-out`

### Issue 6: "User already exists"
**Solution:** Use a different email address

### Issue 7: MongoDB connection error
**Solution:** 
- Check `MONGO_URI` in `.env`
- Ensure MongoDB is running
- Check network connectivity

### Issue 8: JWT token expired
**Solution:** Login again to get new token

---

## 📊 Database Verification

### Check Collections in MongoDB:
```javascript
// In MongoDB shell or Compass
db.users.find().pretty()
db.attendances.find().pretty()
db.breaks.find().pretty()
db.timechangerequests.find().pretty()
db.leaverequests.find().pretty()
db.settings.find().pretty()
```

### Expected Data After Testing:
- **users:** 3+ documents (superadmin, admin, agents)
- **attendances:** 1+ documents per clock-in
- **breaks:** 1+ documents per break taken
- **timechangerequests:** 1+ pending/approved requests
- **leaverequests:** 1+ pending/approved leaves
- **settings:** 1 document (singleton)

---

## 🎉 Success Criteria

All tests pass if:
- [x] All API endpoints respond correctly
- [x] Authorization works as expected
- [x] Data is stored in MongoDB
- [x] Frontend displays data correctly
- [x] Role-based features work
- [x] Approval workflows function
- [x] Live dashboard updates
- [x] Calendar shows correct data
- [x] Settings can be modified
- [x] Impersonation works
- [x] Password reset works

**If all checks pass: Your app is fully functional! 🎉**
