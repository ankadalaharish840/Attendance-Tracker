import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to generate ID
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize super admin on first run
async function initializeSuperAdmin() {
  const users = await kv.getByPrefix("user:");
  if (users.length === 0) {
    const superAdminId = generateId();
    const hashedPassword = await hashPassword("admin123");
    await kv.set(`user:${superAdminId}`, {
      id: superAdminId,
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "superadmin",
      name: "Super Admin",
      assignedTo: null,
    });
    console.log("Super admin created with email: superadmin@example.com, password: admin123");
    
    // Initialize default break types and activities
    await initializeDefaults();
    
    // Create dummy data
    await createDummyData(superAdminId);
  }
}

// Initialize default break types and activities
async function initializeDefaults() {
  const defaultBreakTypes = [
    "Coffee Break",
    "Lunch Break",
    "Rest Break",
    "Personal",
    "Bio Break",
  ];
  
  const defaultActivities = [
    "Available",
    "On Call",
    "Email Support",
    "Chat Support",
    "Documentation",
    "Training",
    "Meeting",
  ];
  
  await kv.set("settings:breakTypes", defaultBreakTypes);
  await kv.set("settings:activities", defaultActivities);
  console.log("Default break types and activities initialized");
}

// Create dummy data for demonstration
async function createDummyData(superAdminId: string) {
  console.log("Creating dummy data...");
  
  // Create 4 admins across different teams
  const admin1Id = generateId();
  const admin2Id = generateId();
  const admin3Id = generateId();
  const admin4Id = generateId();
  const hashedPassword = await hashPassword("admin123");
  
  await kv.set(`user:${admin1Id}`, {
    id: admin1Id,
    email: "admin1@example.com",
    password: hashedPassword,
    role: "admin",
    name: "John Admin",
    team: "Sales",
    assignedTo: null,
  });
  
  await kv.set(`user:${admin2Id}`, {
    id: admin2Id,
    email: "admin2@example.com",
    password: hashedPassword,
    role: "admin",
    name: "Sarah Admin",
    team: "Support",
    assignedTo: null,
  });
  
  await kv.set(`user:${admin3Id}`, {
    id: admin3Id,
    email: "admin3@example.com",
    password: hashedPassword,
    role: "admin",
    name: "Michael Chen",
    team: "Technical",
    assignedTo: null,
  });
  
  await kv.set(`user:${admin4Id}`, {
    id: admin4Id,
    email: "admin4@example.com",
    password: hashedPassword,
    role: "admin",
    name: "Emma Wilson",
    team: "Sales",
    assignedTo: null,
  });
  
  // Create 15 agents across different teams
  const agentNames = [
    // Sales Team
    { name: "Alice Johnson", email: "alice@example.com", assignedTo: admin1Id, team: "Sales" },
    { name: "Bob Smith", email: "bob@example.com", assignedTo: admin1Id, team: "Sales" },
    { name: "Carol Davis", email: "carol@example.com", assignedTo: admin4Id, team: "Sales" },
    { name: "David Miller", email: "david@example.com", assignedTo: admin4Id, team: "Sales" },
    
    // Support Team
    { name: "Charlie Brown", email: "charlie@example.com", assignedTo: admin2Id, team: "Support" },
    { name: "Diana Ross", email: "diana@example.com", assignedTo: admin2Id, team: "Support" },
    { name: "Eve Williams", email: "eve@example.com", assignedTo: admin2Id, team: "Support" },
    { name: "Frank Garcia", email: "frank@example.com", assignedTo: admin2Id, team: "Support" },
    
    // Technical Team
    { name: "Grace Lee", email: "grace@example.com", assignedTo: admin3Id, team: "Technical" },
    { name: "Henry Martinez", email: "henry@example.com", assignedTo: admin3Id, team: "Technical" },
    { name: "Ivy Anderson", email: "ivy@example.com", assignedTo: admin3Id, team: "Technical" },
    { name: "Jack Taylor", email: "jack@example.com", assignedTo: admin3Id, team: "Technical" },
    { name: "Kelly White", email: "kelly@example.com", assignedTo: admin3Id, team: "Technical" },
    { name: "Liam Harris", email: "liam@example.com", assignedTo: admin3Id, team: "Technical" },
    { name: "Mia Clark", email: "mia@example.com", assignedTo: admin3Id, team: "Technical" },
  ];
  
  const agentIds: string[] = [];
  
  for (const agent of agentNames) {
    const agentId = generateId();
    agentIds.push(agentId);
    await kv.set(`user:${agentId}`, {
      id: agentId,
      email: agent.email,
      password: hashedPassword,
      role: "agent",
      name: agent.name,
      team: agent.team,
      assignedTo: agent.assignedTo,
    });
  }
  
  // Create dummy attendance data for the past 60 days (more data)
  const activities = ["Available", "On Call", "Email Support", "Chat Support", "Documentation"];
  const breakTypes = ["Coffee Break", "Lunch Break", "Rest Break", "Personal", "Bio Break"];
  const devices = [
    { name: "Windows PC", type: "Desktop", os: "Windows 11" },
    { name: "MacBook Pro", type: "Laptop", os: "macOS" },
    { name: "iPhone 14", type: "Mobile", os: "iOS 17" },
    { name: "Samsung Galaxy", type: "Mobile", os: "Android 14" },
    { name: "iPad Pro", type: "Tablet", os: "iPadOS 17" },
    { name: "Dell Laptop", type: "Laptop", os: "Windows 11" },
    { name: "ThinkPad", type: "Laptop", os: "Windows 10" },
    { name: "iMac", type: "Desktop", os: "macOS" },
  ];
  
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateKey = date.toISOString().split("T")[0];
    
    // Skip weekends for some realism
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    for (const agentId of agentIds) {
      // 85% attendance rate
      if (Math.random() > 0.85) continue;
      
      const device = devices[Math.floor(Math.random() * devices.length)];
      const loginHour = 8 + Math.floor(Math.random() * 2); // 8-10 AM
      const loginMinute = Math.floor(Math.random() * 60);
      const logoutHour = 17 + Math.floor(Math.random() * 2); // 5-7 PM
      const logoutMinute = Math.floor(Math.random() * 60);
      
      const loginTime = new Date(date);
      loginTime.setHours(loginHour, loginMinute, 0, 0);
      
      const logoutTime = new Date(date);
      logoutTime.setHours(logoutHour, logoutMinute, 0, 0);
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      // Create attendance record
      await kv.set(`attendance:${agentId}:${dateKey}`, {
        id: generateId(),
        userId: agentId,
        date: dateKey,
        loginTime: loginTime.toISOString(),
        logoutTime: logoutTime.toISOString(),
        activity,
        status: "completed",
        deviceName: device.name,
        deviceType: device.type,
        deviceOS: device.os,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      });
      
      // Create 2-4 breaks per day
      const numBreaks = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numBreaks; i++) {
        const breakStartHour = 10 + Math.floor(Math.random() * 6); // 10 AM - 4 PM
        const breakStartMinute = Math.floor(Math.random() * 60);
        const breakDuration = 15 + Math.floor(Math.random() * 45); // 15-60 minutes
        
        const breakStart = new Date(date);
        breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
        
        const breakEnd = new Date(breakStart);
        breakEnd.setMinutes(breakEnd.getMinutes() + breakDuration);
        
        const breakType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
        const breakId = generateId();
        
        await kv.set(`break:${agentId}:${breakId}`, {
          id: breakId,
          userId: agentId,
          breakType,
          activity,
          startTime: breakStart.toISOString(),
          endTime: breakEnd.toISOString(),
          status: "completed",
          resumeActivity: activity,
        });
      }
    }
  }
  
  // Create some pending leave requests
  const futureDate1 = new Date(now);
  futureDate1.setDate(futureDate1.getDate() + 7);
  
  const futureDate2 = new Date(now);
  futureDate2.setDate(futureDate2.getDate() + 14);
  
  await kv.set(`request:leave:${generateId()}`, {
    id: generateId(),
    userId: agentIds[0],
    userName: "Alice Johnson",
    startDate: futureDate1.toISOString().split("T")[0],
    endDate: new Date(futureDate1.setDate(futureDate1.getDate() + 2)).toISOString().split("T")[0],
    reason: "Family vacation",
    status: "pending",
    assignedTo: admin1Id,
    createdAt: now.toISOString(),
  });
  
  await kv.set(`request:leave:${generateId()}`, {
    id: generateId(),
    userId: agentIds[4],
    userName: "Charlie Brown",
    startDate: futureDate2.toISOString().split("T")[0],
    endDate: new Date(futureDate2.setDate(futureDate2.getDate() + 1)).toISOString().split("T")[0],
    reason: "Medical appointment",
    status: "pending",
    assignedTo: admin2Id,
    createdAt: now.toISOString(),
  });
  
  // Create some pending time change requests
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];
  
  const originalTime = new Date(yesterday);
  originalTime.setHours(9, 15, 0, 0);
  
  const requestedTime = new Date(yesterday);
  requestedTime.setHours(9, 0, 0, 0);
  
  await kv.set(`request:time:${generateId()}`, {
    id: generateId(),
    userId: agentIds[1],
    userName: "Bob Smith",
    type: "login",
    date: yesterdayKey,
    originalTime: originalTime.toISOString(),
    requestedTime: requestedTime.toISOString(),
    reason: "Traffic delay, arrived late but need to log correct time",
    status: "pending",
    assignedTo: admin1Id,
    createdAt: now.toISOString(),
  });
  
  console.log("Dummy data created successfully!");
}

// Initialize on startup
initializeSuperAdmin();

// Health check endpoint
app.get("/make-server-9d5286ad/health", (c) => {
  return c.json({ status: "ok" });
});

// Login endpoint
app.post("/make-server-9d5286ad/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const users = await kv.getByPrefix("user:");
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    // Create session
    const sessionId = generateId();
    await kv.set(`session:${sessionId}`, {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      assignedTo: user.assignedTo,
    });
    
    return c.json({
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        assignedTo: user.assignedTo,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Logout endpoint
app.post("/make-server-9d5286ad/logout-session", async (c) => {
  try {
    const { sessionId } = await c.req.json();
    await kv.del(`session:${sessionId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

// Verify session middleware
async function verifySession(sessionId: string) {
  if (!sessionId) return null;
  const session = await kv.get(`session:${sessionId}`);
  return session;
}

// Create user endpoint (admin/superadmin only)
app.post("/make-server-9d5286ad/create-user", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { email, password, role, name, assignedTo } = await c.req.json();
    
    // Check permissions
    if (session.role === "admin" && role !== "agent") {
      return c.json({ error: "Admins can only create agents" }, 403);
    }
    
    if (session.role === "agent") {
      return c.json({ error: "Agents cannot create users" }, 403);
    }
    
    // Check if user exists
    const users = await kv.getByPrefix("user:");
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }
    
    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      password: hashedPassword,
      role,
      name,
      assignedTo: role === "agent" ? assignedTo : null,
    });
    
    return c.json({
      success: true,
      user: { id: userId, email, role, name, assignedTo },
    });
  } catch (error) {
    console.log("Create user error:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Get all users
app.get("/make-server-9d5286ad/users", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const users = await kv.getByPrefix("user:");
    
    // Filter based on role
    let filteredUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      assignedTo: u.assignedTo,
    }));
    
    if (session.role === "admin") {
      // Admin sees only their assigned agents
      filteredUsers = filteredUsers.filter(
        (u: any) => u.assignedTo === session.userId || u.id === session.userId
      );
    }
    
    return c.json({ users: filteredUsers });
  } catch (error) {
    console.log("Get users error:", error);
    return c.json({ error: "Failed to get users" }, 500);
  }
});

// Reset password
app.post("/make-server-9d5286ad/reset-password", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { userId, newPassword } = await c.req.json();
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const hashedPassword = await hashPassword(newPassword);
    await kv.set(`user:${userId}`, {
      ...user,
      password: hashedPassword,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Reset password error:", error);
    return c.json({ error: "Failed to reset password" }, 500);
  }
});

// Clock in
app.post("/make-server-9d5286ad/clock-in", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { activity, deviceName, deviceType, deviceOS } = await c.req.json();
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const attendanceId = generateId();
    
    // Get IP address from request
    const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "Unknown";
    
    await kv.set(`attendance:${session.userId}:${dateKey}`, {
      id: attendanceId,
      userId: session.userId,
      date: dateKey,
      loginTime: now.toISOString(),
      logoutTime: null,
      activity,
      status: "active",
      deviceName: deviceName || "Unknown Device",
      deviceType: deviceType || "Unknown",
      deviceOS: deviceOS || "Unknown",
      ipAddress,
    });
    
    return c.json({ success: true, attendanceId });
  } catch (error) {
    console.log("Clock in error:", error);
    return c.json({ error: "Failed to clock in" }, 500);
  }
});

// Clock out
app.post("/make-server-9d5286ad/clock-out", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const attendance = await kv.get(`attendance:${session.userId}:${dateKey}`);
    
    if (!attendance) {
      return c.json({ error: "No active attendance found" }, 404);
    }
    
    await kv.set(`attendance:${session.userId}:${dateKey}`, {
      ...attendance,
      logoutTime: now.toISOString(),
      status: "completed",
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Clock out error:", error);
    return c.json({ error: "Failed to clock out" }, 500);
  }
});

// Start break
app.post("/make-server-9d5286ad/start-break", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { breakType, activity } = await c.req.json();
    const now = new Date();
    const breakId = generateId();
    
    await kv.set(`break:${session.userId}:${breakId}`, {
      id: breakId,
      userId: session.userId,
      breakType,
      activity,
      startTime: now.toISOString(),
      endTime: null,
      status: "active",
    });
    
    return c.json({ success: true, breakId });
  } catch (error) {
    console.log("Start break error:", error);
    return c.json({ error: "Failed to start break" }, 500);
  }
});

// End break
app.post("/make-server-9d5286ad/end-break", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { breakId, activity } = await c.req.json();
    const breakRecord = await kv.get(`break:${session.userId}:${breakId}`);
    
    if (!breakRecord) {
      return c.json({ error: "Break not found" }, 404);
    }
    
    const now = new Date();
    await kv.set(`break:${session.userId}:${breakId}`, {
      ...breakRecord,
      endTime: now.toISOString(),
      status: "completed",
      resumeActivity: activity,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("End break error:", error);
    return c.json({ error: "Failed to end break" }, 500);
  }
});

// Request time change
app.post("/make-server-9d5286ad/request-time-change", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { type, date, originalTime, requestedTime, reason } = await c.req.json();
    const requestId = generateId();
    
    // Get user to find assigned admin/superadmin
    const user = await kv.get(`user:${session.userId}`);
    
    await kv.set(`request:time:${requestId}`, {
      id: requestId,
      userId: session.userId,
      userName: session.name,
      type, // "login", "logout", "break-start", "break-end"
      date,
      originalTime,
      requestedTime,
      reason,
      status: "pending",
      assignedTo: user.assignedTo,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, requestId });
  } catch (error) {
    console.log("Request time change error:", error);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

// Approve/reject time change
app.post("/make-server-9d5286ad/approve-time-change", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { requestId, approved } = await c.req.json();
    const request = await kv.get(`request:time:${requestId}`);
    
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }
    
    await kv.set(`request:time:${requestId}`, {
      ...request,
      status: approved ? "approved" : "rejected",
      approvedBy: session.userId,
      approvedAt: new Date().toISOString(),
    });
    
    // If approved, update the attendance record
    if (approved) {
      const dateKey = request.date;
      if (request.type === "login" || request.type === "logout") {
        const attendance = await kv.get(`attendance:${request.userId}:${dateKey}`);
        if (attendance) {
          await kv.set(`attendance:${request.userId}:${dateKey}`, {
            ...attendance,
            [request.type === "login" ? "loginTime" : "logoutTime"]: request.requestedTime,
          });
        }
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Approve time change error:", error);
    return c.json({ error: "Failed to approve request" }, 500);
  }
});

// Request leave
app.post("/make-server-9d5286ad/request-leave", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { startDate, endDate, reason } = await c.req.json();
    const requestId = generateId();
    
    const user = await kv.get(`user:${session.userId}`);
    
    await kv.set(`request:leave:${requestId}`, {
      id: requestId,
      userId: session.userId,
      userName: session.name,
      startDate,
      endDate,
      reason,
      status: "pending",
      assignedTo: user.assignedTo,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, requestId });
  } catch (error) {
    console.log("Request leave error:", error);
    return c.json({ error: "Failed to create leave request" }, 500);
  }
});

// Approve/reject leave
app.post("/make-server-9d5286ad/approve-leave", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { requestId, approved } = await c.req.json();
    const request = await kv.get(`request:leave:${requestId}`);
    
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }
    
    await kv.set(`request:leave:${requestId}`, {
      ...request,
      status: approved ? "approved" : "rejected",
      approvedBy: session.userId,
      approvedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Approve leave error:", error);
    return c.json({ error: "Failed to approve leave request" }, 500);
  }
});

// Get attendance for a user and month
app.get("/make-server-9d5286ad/attendance/:userId/:year/:month", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userId = c.req.param("userId");
    const year = c.req.param("year");
    const month = c.req.param("month");
    
    // Check permissions
    if (session.role === "agent" && session.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    
    // Get all attendance records for the user
    const allAttendance = await kv.getByPrefix(`attendance:${userId}:`);
    
    // Filter by month
    const monthPrefix = `${year}-${month.padStart(2, "0")}`;
    const monthAttendance = allAttendance.filter((a: any) => 
      a.date.startsWith(monthPrefix)
    );
    
    // Get all breaks for the user
    const allBreaks = await kv.getByPrefix(`break:${userId}:`);
    
    // Get approved leaves
    const allLeaves = await kv.getByPrefix(`request:leave:`);
    const approvedLeaves = allLeaves.filter(
      (l: any) => l.userId === userId && l.status === "approved"
    );
    
    return c.json({
      attendance: monthAttendance,
      breaks: allBreaks,
      leaves: approvedLeaves,
    });
  } catch (error) {
    console.log("Get attendance error:", error);
    return c.json({ error: "Failed to get attendance" }, 500);
  }
});

// Get pending requests
app.get("/make-server-9d5286ad/pending-requests", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const allTimeRequests = await kv.getByPrefix(`request:time:`);
    const allLeaveRequests = await kv.getByPrefix(`request:leave:`);
    
    let timeRequests = allTimeRequests.filter((r: any) => r.status === "pending");
    let leaveRequests = allLeaveRequests.filter((r: any) => r.status === "pending");
    
    // Filter based on role
    if (session.role === "admin") {
      timeRequests = timeRequests.filter((r: any) => r.assignedTo === session.userId);
      leaveRequests = leaveRequests.filter((r: any) => r.assignedTo === session.userId);
    } else if (session.role === "agent") {
      timeRequests = timeRequests.filter((r: any) => r.userId === session.userId);
      leaveRequests = leaveRequests.filter((r: any) => r.userId === session.userId);
    }
    
    return c.json({
      timeRequests,
      leaveRequests,
    });
  } catch (error) {
    console.log("Get pending requests error:", error);
    return c.json({ error: "Failed to get requests" }, 500);
  }
});

// Get current break status
app.get("/make-server-9d5286ad/current-break/:userId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userId = c.req.param("userId");
    const allBreaks = await kv.getByPrefix(`break:${userId}:`);
    const activeBreak = allBreaks.find((b: any) => b.status === "active");
    
    return c.json({ activeBreak: activeBreak || null });
  } catch (error) {
    console.log("Get current break error:", error);
    return c.json({ error: "Failed to get break status" }, 500);
  }
});

// Get current attendance status
app.get("/make-server-9d5286ad/current-attendance/:userId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userId = c.req.param("userId");
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const attendance = await kv.get(`attendance:${userId}:${dateKey}`);
    
    return c.json({ attendance: attendance || null });
  } catch (error) {
    console.log("Get current attendance error:", error);
    return c.json({ error: "Failed to get attendance status" }, 500);
  }
});

// Get break types and activities
app.get("/make-server-9d5286ad/settings", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const breakTypes = await kv.get("settings:breakTypes") || [];
    const activities = await kv.get("settings:activities") || [];
    
    return c.json({ breakTypes, activities });
  } catch (error) {
    console.log("Get settings error:", error);
    return c.json({ error: "Failed to get settings" }, 500);
  }
});

// Update break types (superadmin only)
app.post("/make-server-9d5286ad/settings/break-types", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { breakTypes } = await c.req.json();
    await kv.set("settings:breakTypes", breakTypes);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Update break types error:", error);
    return c.json({ error: "Failed to update break types" }, 500);
  }
});

// Update activities (superadmin only)
app.post("/make-server-9d5286ad/settings/activities", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { activities } = await c.req.json();
    await kv.set("settings:activities", activities);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Update activities error:", error);
    return c.json({ error: "Failed to update activities" }, 500);
  }
});

// Update current activity
app.post("/make-server-9d5286ad/update-activity", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { activity } = await c.req.json();
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const attendance = await kv.get(`attendance:${session.userId}:${dateKey}`);
    
    if (!attendance) {
      return c.json({ error: "No active attendance found. Please clock in first." }, 404);
    }
    
    await kv.set(`attendance:${session.userId}:${dateKey}`, {
      ...attendance,
      activity,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Update activity error:", error);
    return c.json({ error: "Failed to update activity" }, 500);
  }
});

// Impersonate user (superadmin only)
app.post("/make-server-9d5286ad/impersonate", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized - Only super admin can impersonate" }, 401);
    }
    
    const { userId } = await c.req.json();
    const targetUser = await kv.get(`user:${userId}`);
    
    if (!targetUser) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Create impersonation session
    const impersonationSessionId = generateId();
    await kv.set(`session:${impersonationSessionId}`, {
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      name: targetUser.name,
      assignedTo: targetUser.assignedTo,
      team: targetUser.team,
      isImpersonating: true,
      originalSessionId: sessionId,
      originalUserId: session.userId,
    });
    
    return c.json({
      sessionId: impersonationSessionId,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        name: targetUser.name,
        team: targetUser.team,
        assignedTo: targetUser.assignedTo,
        isImpersonating: true,
      },
    });
  } catch (error) {
    console.log("Impersonate error:", error);
    return c.json({ error: "Failed to impersonate user" }, 500);
  }
});

// Exit impersonation
app.post("/make-server-9d5286ad/exit-impersonation", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || !session.isImpersonating) {
      return c.json({ error: "Not impersonating" }, 400);
    }
    
    // Get original session
    const originalSession = await kv.get(`session:${session.originalSessionId}`);
    
    if (!originalSession) {
      return c.json({ error: "Original session not found" }, 404);
    }
    
    // Delete impersonation session
    await kv.del(`session:${sessionId}`);
    
    // Get original user
    const originalUser = await kv.get(`user:${originalSession.userId}`);
    
    return c.json({
      sessionId: session.originalSessionId,
      user: {
        id: originalUser.id,
        email: originalUser.email,
        role: originalUser.role,
        name: originalUser.name,
        team: originalUser.team,
        assignedTo: originalUser.assignedTo,
      },
    });
  } catch (error) {
    console.log("Exit impersonation error:", error);
    return c.json({ error: "Failed to exit impersonation" }, 500);
  }
});

// Get teams list
app.get("/make-server-9d5286ad/teams", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const users = await kv.getByPrefix("user:");
    const teams = [...new Set(users.map((u: any) => u.team).filter(Boolean))];
    
    return c.json({ teams });
  } catch (error) {
    console.log("Get teams error:", error);
    return c.json({ error: "Failed to get teams" }, 500);
  }
});

// Register new user (self-registration)
app.post("/make-server-9d5286ad/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    // Check if user exists
    const users = await kv.getByPrefix("user:");
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }
    
    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    
    // Default role is agent with no assigned admin
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      password: hashedPassword,
      role: "agent",
      name,
      assignedTo: null, // Will be assigned by admin later
      team: null,
    });
    
    // Create session
    const sessionId = generateId();
    await kv.set(`session:${sessionId}`, {
      userId,
      email,
      role: "agent",
      name,
      assignedTo: null,
    });
    
    return c.json({
      success: true,
      sessionId,
      user: {
        id: userId,
        email,
        role: "agent",
        name,
        assignedTo: null,
      },
    });
  } catch (error) {
    console.log("Register error:", error);
    return c.json({ error: "Failed to register user" }, 500);
  }
});

// Get expense categories
app.get("/make-server-9d5286ad/categories", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const allCategories = await kv.getByPrefix("category:");
    
    // Get super admin ID
    const users = await kv.getByPrefix("user:");
    const superAdmin = users.find((u: any) => u.role === "superadmin");
    
    // Get user info for agents
    const user = await kv.get(`user:${session.userId}`);
    
    // Filter categories based on role
    let categories = allCategories;
    
    if (session.role === "agent") {
      // Agents see super admin categories + their assigned admin's categories
      categories = allCategories.filter((cat: any) => {
        return cat.owner === superAdmin?.id || cat.owner === user.assignedTo;
      });
    } else if (session.role === "admin") {
      // Admins see super admin categories + their own categories
      categories = allCategories.filter((cat: any) => {
        return cat.owner === superAdmin?.id || cat.owner === session.userId;
      });
    }
    // Superadmin sees all categories
    
    return c.json({ categories });
  } catch (error) {
    console.log("Get categories error:", error);
    return c.json({ error: "Failed to get categories" }, 500);
  }
});

// Create expense category (admin and superadmin)
app.post("/make-server-9d5286ad/categories", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return c.json({ error: "Unauthorized - Only admins can create categories" }, 401);
    }
    
    const { name, subcategories } = await c.req.json();
    
    // Check if category already exists for this owner
    const allCategories = await kv.getByPrefix("category:");
    const existingCategory = allCategories.find(
      (cat: any) => cat.name === name && cat.owner === session.userId
    );
    
    if (existingCategory) {
      return c.json({ error: "Category already exists" }, 400);
    }
    
    const categoryId = generateId();
    await kv.set(`category:${categoryId}`, {
      id: categoryId,
      name,
      subcategories: subcategories || [],
      owner: session.userId,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, categoryId });
  } catch (error) {
    console.log("Create category error:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

// Update expense category (only owner)
app.put("/make-server-9d5286ad/categories/:categoryId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const categoryId = c.req.param("categoryId");
    const category = await kv.get(`category:${categoryId}`);
    
    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }
    
    // Only owner can update
    if (category.owner !== session.userId) {
      return c.json({ error: "Only the owner can update this category" }, 403);
    }
    
    const { name, subcategories } = await c.req.json();
    
    await kv.set(`category:${categoryId}`, {
      ...category,
      name: name || category.name,
      subcategories: subcategories || category.subcategories,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Update category error:", error);
    return c.json({ error: "Failed to update category" }, 500);
  }
});

// Delete expense category (only owner)
app.delete("/make-server-9d5286ad/categories/:categoryId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const categoryId = c.req.param("categoryId");
    const category = await kv.get(`category:${categoryId}`);
    
    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }
    
    // Only owner can delete
    if (category.owner !== session.userId) {
      return c.json({ error: "Only the owner can delete this category" }, 403);
    }
    
    await kv.del(`category:${categoryId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete category error:", error);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

// Get live status for super admin dashboard
app.get("/make-server-9d5286ad/live-status", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
    
    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    const agents = allUsers.filter((u: any) => u.role === "agent");
    
    // Get today's attendance for all agents
    const todayAttendance = await kv.getByPrefix(`attendance:`);
    const todayAgentAttendance = todayAttendance.filter((a: any) => a.date === dateKey);
    
    // Get all active breaks
    const allBreaks = await kv.getByPrefix("break:");
    const activeBreaks = allBreaks.filter((b: any) => b.status === "active");
    
    // Calculate today's summary
    const loggedInToday = todayAgentAttendance.filter((a: any) => 
      a.loginTime && !a.logoutTime
    ).length;
    
    const onBreak = activeBreaks.length;
    
    const totalHoursToday = todayAgentAttendance.reduce((sum: number, a: any) => {
      if (a.loginTime) {
        const login = new Date(a.loginTime);
        const logout = a.logoutTime ? new Date(a.logoutTime) : now;
        const hours = (logout.getTime() - login.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const avgHours = todayAgentAttendance.length > 0 
      ? (totalHoursToday / todayAgentAttendance.length).toFixed(1)
      : "0.0";
    
    // Calculate month summary
    const monthAttendance = todayAttendance.filter((a: any) => 
      a.date.startsWith(currentMonth)
    );
    
    const totalDays = new Set(monthAttendance.map((a: any) => a.date)).size;
    const totalMonthHours = monthAttendance.reduce((sum: number, a: any) => {
      if (a.loginTime && a.logoutTime) {
        const login = new Date(a.loginTime);
        const logout = new Date(a.logoutTime);
        const hours = (logout.getTime() - login.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const avgHoursPerDay = totalDays > 0 
      ? (totalMonthHours / monthAttendance.length).toFixed(1)
      : "0.0";
    
    const avgAttendance = agents.length > 0 && totalDays > 0
      ? Math.round((monthAttendance.length / (agents.length * totalDays)) * 100)
      : 0;
    
    // Build live status for each agent
    const liveStatus = agents.map((agent: any) => {
      const attendance = todayAgentAttendance.find((a: any) => a.userId === agent.id);
      const activeBreak = activeBreaks.find((b: any) => b.userId === agent.id);
      
      let status = "offline";
      let hoursToday = "0.0";
      
      if (attendance) {
        if (activeBreak) {
          status = "on-break";
        } else if (attendance.loginTime && !attendance.logoutTime) {
          status = "logged-in";
        } else if (attendance.logoutTime) {
          status = "offline";
        }
        
        if (attendance.loginTime) {
          const login = new Date(attendance.loginTime);
          const logout = attendance.logoutTime ? new Date(attendance.logoutTime) : now;
          hoursToday = ((logout.getTime() - login.getTime()) / (1000 * 60 * 60)).toFixed(1);
        }
      }
      
      return {
        userId: agent.id,
        name: agent.name,
        team: agent.team,
        status,
        activity: attendance?.activity || null,
        loginTime: attendance?.loginTime ? new Date(attendance.loginTime).toLocaleTimeString() : null,
        hoursToday,
      };
    });
    
    return c.json({
      todaySummary: {
        totalAgents: agents.length,
        loggedIn: loggedInToday,
        onBreak,
        avgHours,
      },
      monthSummary: {
        totalDays,
        avgAttendance,
        totalHours: totalMonthHours.toFixed(0),
        avgHoursPerDay,
      },
      liveStatus,
      teams: [...new Set(agents.map((a: any) => a.team).filter(Boolean))],
    });
  } catch (error) {
    console.log("Get live status error:", error);
    return c.json({ error: "Failed to get live status" }, 500);
  }
});

// Get live status for admin dashboard
app.get("/make-server-9d5286ad/admin-live-status", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
    
    // Get all users assigned to this admin (or all if superadmin)
    const allUsers = await kv.getByPrefix("user:");
    const agents = session.role === "superadmin" 
      ? allUsers.filter((u: any) => u.role === "agent")
      : allUsers.filter((u: any) => u.role === "agent" && u.assignedTo === session.userId);
    
    // Get today's attendance for these agents
    const todayAttendance = await kv.getByPrefix(`attendance:`);
    const todayAgentAttendance = todayAttendance.filter((a: any) => 
      a.date === dateKey && agents.some((agent: any) => agent.id === a.userId)
    );
    
    // Get all active breaks for these agents
    const allBreaks = await kv.getByPrefix("break:");
    const activeBreaks = allBreaks.filter((b: any) => 
      b.status === "active" && agents.some((agent: any) => agent.id === b.userId)
    );
    
    // Calculate today's summary
    const loggedInToday = todayAgentAttendance.filter((a: any) => 
      a.loginTime && !a.logoutTime
    ).length;
    
    const onBreak = activeBreaks.length;
    
    const totalHoursToday = todayAgentAttendance.reduce((sum: number, a: any) => {
      if (a.loginTime) {
        const login = new Date(a.loginTime);
        const logout = a.logoutTime ? new Date(a.logoutTime) : now;
        const hours = (logout.getTime() - login.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const avgHours = todayAgentAttendance.length > 0 
      ? (totalHoursToday / todayAgentAttendance.length).toFixed(1)
      : "0.0";
    
    // Calculate month summary
    const monthAttendance = todayAttendance.filter((a: any) => 
      a.date.startsWith(currentMonth) && agents.some((agent: any) => agent.id === a.userId)
    );
    
    const totalDays = new Set(monthAttendance.map((a: any) => a.date)).size;
    const totalMonthHours = monthAttendance.reduce((sum: number, a: any) => {
      if (a.loginTime && a.logoutTime) {
        const login = new Date(a.loginTime);
        const logout = new Date(a.logoutTime);
        const hours = (logout.getTime() - login.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const avgHoursPerDay = totalDays > 0 && monthAttendance.length > 0
      ? (totalMonthHours / monthAttendance.length).toFixed(1)
      : "0.0";
    
    const avgAttendance = agents.length > 0 && totalDays > 0
      ? Math.round((monthAttendance.length / (agents.length * totalDays)) * 100)
      : 0;
    
    // Build live status for each agent
    const liveStatus = agents.map((agent: any) => {
      const attendance = todayAgentAttendance.find((a: any) => a.userId === agent.id);
      const activeBreak = activeBreaks.find((b: any) => b.userId === agent.id);
      
      let status = "offline";
      let hoursToday = "0.0";
      
      if (attendance) {
        if (activeBreak) {
          status = "on-break";
        } else if (attendance.loginTime && !attendance.logoutTime) {
          status = "logged-in";
        } else if (attendance.logoutTime) {
          status = "offline";
        }
        
        if (attendance.loginTime) {
          const login = new Date(attendance.loginTime);
          const logout = attendance.logoutTime ? new Date(attendance.logoutTime) : now;
          hoursToday = ((logout.getTime() - login.getTime()) / (1000 * 60 * 60)).toFixed(1);
        }
      }
      
      return {
        userId: agent.id,
        name: agent.name,
        status,
        activity: attendance?.activity || null,
        loginTime: attendance?.loginTime ? new Date(attendance.loginTime).toLocaleTimeString() : null,
        hoursToday,
      };
    });
    
    return c.json({
      todaySummary: {
        totalAgents: agents.length,
        loggedIn: loggedInToday,
        onBreak,
        avgHours,
      },
      monthSummary: {
        totalDays,
        avgAttendance,
        totalHours: totalMonthHours.toFixed(0),
        avgHoursPerDay,
      },
      liveStatus,
    });
  } catch (error) {
    console.log("Get admin live status error:", error);
    return c.json({ error: "Failed to get live status" }, 500);
  }
});

// Get schedules
app.get("/make-server-9d5286ad/settings/schedules", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const schedules = await kv.getByPrefix("schedule:");
    
    return c.json({ schedules });
  } catch (error) {
    console.log("Get schedules error:", error);
    return c.json({ error: "Failed to get schedules" }, 500);
  }
});

// Create schedule
app.post("/make-server-9d5286ad/settings/schedules", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { schedule } = await c.req.json();
    const scheduleId = generateId();
    
    const newSchedule = {
      id: scheduleId,
      ...schedule,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`schedule:${scheduleId}`, newSchedule);
    
    return c.json({ schedule: newSchedule });
  } catch (error) {
    console.log("Create schedule error:", error);
    return c.json({ error: "Failed to create schedule" }, 500);
  }
});

// Update schedule
app.put("/make-server-9d5286ad/settings/schedules/:scheduleId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const scheduleId = c.req.param("scheduleId");
    const { schedule } = await c.req.json();
    
    const existingSchedule = await kv.get(`schedule:${scheduleId}`);
    
    if (!existingSchedule) {
      return c.json({ error: "Schedule not found" }, 404);
    }
    
    const updatedSchedule = {
      ...existingSchedule,
      ...schedule,
      id: scheduleId,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`schedule:${scheduleId}`, updatedSchedule);
    
    return c.json({ schedule: updatedSchedule });
  } catch (error) {
    console.log("Update schedule error:", error);
    return c.json({ error: "Failed to update schedule" }, 500);
  }
});

// Delete schedule
app.delete("/make-server-9d5286ad/settings/schedules/:scheduleId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionId = authHeader?.split(" ")[1];
    const session = await verifySession(sessionId);
    
    if (!session || session.role !== "superadmin") {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const scheduleId = c.req.param("scheduleId");
    await kv.del(`schedule:${scheduleId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete schedule error:", error);
    return c.json({ error: "Failed to delete schedule" }, 500);
  }
});

Deno.serve(app.fetch);