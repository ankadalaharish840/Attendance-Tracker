# 📚 API REFERENCE - Attendance Tracker

## Base URL
```
http://localhost:5000/api
```

## Authentication Header
All protected endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### 1. Login
**POST** `/auth/login`
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "...", "name": "...", "role": "..." }
}
```

### 2. Register
**POST** `/auth/register`
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "name": "John Doe",
  "role": "agent",
  "team": "Team A",
  "assignedTo": "admin_user_id"
}
```

### 3. Get Current User
**GET** `/auth/me`

### 4. Refresh Token
**POST** `/auth/refresh`

---

## 👥 User Management Endpoints

### 5. List Users
**GET** `/users`
- **Auth:** Admin, Super Admin
- **Admin:** Sees only assigned users
- **Super Admin:** Sees all users

### 6. Create User
**POST** `/create-user`
- **Auth:** Admin (agents only), Super Admin (any role)
```json
{
  "email": "newuser@example.com",
  "password": "Password@123",
  "name": "Jane Doe",
  "role": "agent",
  "team": "Team B",
  "assignedTo": "admin_id"
}
```

### 7. Reset Password
**POST** `/reset-password`
- **Auth:** Super Admin only
```json
{
  "userId": "user_id_here",
  "newPassword": "NewPassword@123"
}
```

### 8. Impersonate User
**POST** `/impersonate`
- **Auth:** Super Admin only
```json
{
  "userId": "user_id_to_impersonate"
}
```
**Response:** New token for impersonated user

### 9. Get Teams
**GET** `/teams`
**Response:**
```json
{
  "teams": ["Team A", "Team B", "Sales", "Support"]
}
```

---

## ⏰ Time Tracking Endpoints

### 10. Clock In
**POST** `/clock-in`
```json
{
  "activity": "Available",
  "deviceName": "Windows PC",
  "deviceType": "Desktop",
  "deviceOS": "Windows"
}
```

### 11. Clock Out
**POST** `/clock-out`
```json
{}
```

### 12. Update Activity
**POST** `/update-activity`
```json
{
  "activity": "In Call"
}
```

### 13. Get Current Attendance
**GET** `/current-attendance/:userId`
**Response:**
```json
{
  "attendance": {
    "id": "...",
    "loginTime": "2026-01-20T09:00:00Z",
    "logoutTime": null,
    "activity": "Available",
    "deviceName": "Windows PC",
    "deviceType": "Desktop",
    "deviceOS": "Windows",
    "ipAddress": "192.168.1.100"
  }
}
```

---

## ☕ Break Management Endpoints

### 14. Start Break
**POST** `/start-break`
```json
{
  "breakType": "Lunch Break",
  "activity": "Available"
}
```

### 15. End Break
**POST** `/end-break`
```json
{
  "breakId": "break_id_from_start_response",
  "activity": "Available"
}
```

### 16. Get Current Break
**GET** `/current-break/:userId`
**Response:**
```json
{
  "activeBreak": {
    "id": "...",
    "breakType": "Coffee Break",
    "startTime": "2026-01-20T10:30:00Z"
  }
}
```

---

## 📅 Attendance & Calendar Endpoints

### 17. Get Monthly Attendance
**GET** `/attendance/:userId/:year/:month`
**Example:** `/attendance/user123/2026/01`

**Response:**
```json
{
  "attendance": [
    {
      "id": "...",
      "date": "2026-01-20",
      "loginTime": "2026-01-20T09:00:00Z",
      "logoutTime": "2026-01-20T17:00:00Z",
      "activity": "Available",
      "deviceName": "Windows PC",
      "deviceType": "Desktop",
      "deviceOS": "Windows",
      "ipAddress": "192.168.1.100"
    }
  ],
  "breaks": [
    {
      "id": "...",
      "date": "2026-01-20",
      "breakType": "Lunch Break",
      "startTime": "2026-01-20T12:00:00Z",
      "endTime": "2026-01-20T13:00:00Z"
    }
  ],
  "leaves": [
    {
      "id": "...",
      "leaveType": "Sick Leave",
      "startDate": "2026-01-25",
      "endDate": "2026-01-26",
      "reason": "Not feeling well"
    }
  ]
}
```

---

## 📝 Request Management Endpoints

### 18. Submit Time Change Request
**POST** `/time-change-request`
```json
{
  "type": "login",
  "date": "2026-01-20",
  "originalTime": "2026-01-20T09:30:00Z",
  "requestedTime": "2026-01-20T09:00:00Z",
  "reason": "Forgot to clock in on time",
  "attendanceId": "attendance_id",
  "breakId": null
}
```
**Types:** `login`, `logout`, `break`

### 19. Submit Leave Request
**POST** `/leave-request`
```json
{
  "leaveType": "Sick Leave",
  "startDate": "2026-01-25",
  "endDate": "2026-01-26",
  "reason": "Medical appointment"
}
```

### 20. Get Pending Requests
**GET** `/pending-requests`
- **Auth:** Admin, Super Admin
**Response:**
```json
{
  "timeRequests": [
    {
      "id": "...",
      "userId": "...",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "type": "login",
      "date": "2026-01-20",
      "originalTime": "2026-01-20T09:30:00Z",
      "requestedTime": "2026-01-20T09:00:00Z",
      "reason": "...",
      "createdAt": "..."
    }
  ],
  "leaveRequests": [
    {
      "id": "...",
      "userId": "...",
      "userName": "Jane Doe",
      "userEmail": "jane@example.com",
      "leaveType": "Vacation",
      "startDate": "2026-02-01",
      "endDate": "2026-02-05",
      "reason": "...",
      "createdAt": "..."
    }
  ]
}
```

### 21. Approve/Reject Time Change
**POST** `/approve-time-change`
- **Auth:** Admin, Super Admin
```json
{
  "requestId": "request_id_here",
  "approved": true
}
```

### 22. Approve/Reject Leave
**POST** `/approve-leave`
- **Auth:** Admin, Super Admin
```json
{
  "requestId": "request_id_here",
  "approved": true
}
```

---

## ⚙️ Settings Endpoints

### 23. Get Settings
**GET** `/settings`
**Response:**
```json
{
  "breakTypes": ["Lunch Break", "Coffee Break", "Personal Break", "Meeting"],
  "activities": ["Available", "In Call", "In Meeting", "On Task", "Away"],
  "leaveTypes": ["Sick Leave", "Vacation", "Personal Leave", "Emergency Leave"]
}
```

### 24. Update Break Types
**POST** `/settings/break-types`
- **Auth:** Admin, Super Admin
```json
{
  "breakTypes": ["Lunch Break", "Coffee Break", "Personal Break", "Meeting", "Restroom Break"]
}
```

### 25. Update Activities
**POST** `/settings/activities`
- **Auth:** Admin, Super Admin
```json
{
  "activities": ["Available", "In Call", "In Meeting", "On Task", "Away", "Training"]
}
```

### 26. Get Schedules
**GET** `/settings/schedules`
- **Auth:** Admin, Super Admin
**Response:**
```json
{
  "schedules": [
    {
      "_id": "...",
      "name": "Standard 9-5",
      "workDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "startTime": "09:00",
      "endTime": "17:00",
      "assignedUsers": ["user_id_1", "user_id_2"]
    }
  ]
}
```

### 27. Create/Update Schedule
**POST** `/settings/schedule`
- **Auth:** Admin, Super Admin
```json
{
  "scheduleId": null,
  "name": "Night Shift",
  "workDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "startTime": "22:00",
  "endTime": "06:00",
  "assignedUsers": ["user_id_1"]
}
```
**Note:** Leave `scheduleId` null to create new, provide ID to update

### 28. Delete Schedule
**DELETE** `/settings/schedule/:scheduleId`
- **Auth:** Admin, Super Admin

---

## 📊 Live Dashboard Endpoints

### 29. Admin Live Dashboard
**GET** `/admin-live-status`
- **Auth:** Admin, Super Admin
- **Admin:** Sees assigned agents only
- **Super Admin:** Can use this or superadmin endpoint

**Response:**
```json
{
  "todaySummary": {
    "totalAgents": 10,
    "loggedIn": 7,
    "onBreak": 2,
    "offline": 3
  },
  "monthSummary": {
    "totalWorkHours": 1250.5,
    "totalBreakHours": 85.3,
    "totalDays": 180
  },
  "liveStatus": [
    {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "Active",
      "activity": "In Call",
      "loginTime": "2026-01-20T09:00:00Z",
      "currentBreak": null
    },
    {
      "id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "status": "On Break",
      "activity": "Available",
      "loginTime": "2026-01-20T08:45:00Z",
      "currentBreak": "Lunch Break"
    }
  ]
}
```

### 30. Super Admin Live Dashboard
**GET** `/superadmin-live-status`
- **Auth:** Super Admin only
- Shows ALL agents with device info

**Response:** Same as admin-live-status but includes:
```json
{
  "liveStatus": [
    {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "team": "Team A",
      "status": "Active",
      "activity": "In Call",
      "loginTime": "2026-01-20T09:00:00Z",
      "currentBreak": null,
      "deviceName": "Windows PC",
      "deviceType": "Desktop",
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

---

## 🔒 Authorization Summary

| Endpoint | Agent | Admin | Super Admin |
|----------|-------|-------|-------------|
| Auth endpoints | ✅ | ✅ | ✅ |
| Time tracking | ✅ | ✅ | ✅ |
| Break management | ✅ | ✅ | ✅ |
| Submit requests | ✅ | ✅ | ✅ |
| View own data | ✅ | ✅ | ✅ |
| `/users` | ❌ | ✅ (assigned) | ✅ (all) |
| `/create-user` | ❌ | ✅ (agents) | ✅ (any) |
| `/reset-password` | ❌ | ❌ | ✅ |
| `/impersonate` | ❌ | ❌ | ✅ |
| Approve requests | ❌ | ✅ (assigned) | ✅ (all) |
| Settings management | ❌ | ✅ | ✅ |
| Live dashboards | ❌ | ✅ (assigned) | ✅ (all) |

---

## 📝 Notes

### Date Formats:
- **Date:** `YYYY-MM-DD` (e.g., "2026-01-20")
- **DateTime:** ISO 8601 (e.g., "2026-01-20T09:00:00Z")
- **Time:** `HH:MM` (e.g., "09:00")

### Status Values:
- **Attendance:** Active (logged in), Offline (logged out)
- **Break:** On Break, Not on break
- **Request:** pending, approved, rejected

### Error Responses:
```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

---

## 🚀 Quick Start Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password@123'
  })
});
const { token } = await loginResponse.json();

// 2. Clock In
const clockInResponse = await fetch('http://localhost:5000/api/clock-in', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    activity: 'Available',
    deviceName: 'Windows PC',
    deviceType: 'Desktop',
    deviceOS: 'Windows'
  })
});

// 3. Get Current Status
const statusResponse = await fetch('http://localhost:5000/api/current-attendance/user_id', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const status = await statusResponse.json();
```

---

**For more details, see:**
- [Backend Implementation Report](./BACKEND_IMPLEMENTATION_REPORT.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
