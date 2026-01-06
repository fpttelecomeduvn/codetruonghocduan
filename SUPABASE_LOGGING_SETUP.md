# 🚀 Supabase Activity Logging - Complete Setup Guide

## Tóm Tắt

Hệ thống logging của bạn đã được cấu hình để sử dụng **Supabase Database**!

- ✅ Logs lưu trữ trên Supabase (persistent)
- ✅ Hỗ trợ async/await
- ✅ Row-level security (RLS) 
- ✅ Admin/user role-based access
- ✅ Real-time updates
- ✅ Beautiful UI component

---

## 📋 Các File Đã Được Cập Nhật

### Services
- **src/services/logService.ts** - Supabase logging methods
  - `logActivityService` - Log activities
  - `loginLogService` - Log login/logout

- **src/services/logHelpers.ts** (CẬP NHẬT) - Helper functions
  - `logCreateAction()` - async
  - `logUpdateAction()` - async
  - `logDeleteAction()` - async
  - `logViewAction()` - async
  - `logLoginAction()` - async
  - `logLogoutAction()` - async

### Hooks
- **src/hooks/useActivityLogs.ts** - React hooks for Supabase
  - `useActivityLogs()` - Fetch activity logs
  - `useLoginLogs()` - Fetch login logs
  - `useLogStats()` - Fetch statistics

### Components
- **src/components/ActivityLogsPanel.tsx** - Complete UI
- **src/styles/ActivityLogsPanel.css** - Beautiful styling

### Database
- **database_logging.sql** - Schema file (tables, indexes, RLS)

---

## 🔧 Setup Steps

### Step 1: Chạy SQL Schema Trên Supabase

1. Mở [Supabase Dashboard](https://app.supabase.com)
2. Vào project của bạn
3. Vào **SQL Editor** → **New Query**
4. Copy toàn bộ nội dung từ `database_logging.sql`
5. Paste vào SQL Editor
6. Click **Run**

**SQL Schema tạo:**
- `activity_logs` table
- `login_logs` table
- Indexes for performance
- RLS policies for security

### Step 2: Kiểm Tra Database Tables

Vào **Table Editor** → xem 2 tables:
- ✅ `activity_logs` (9 columns)
- ✅ `login_logs` (10 columns)

### Step 3: Thêm Environment Variables

Vào `.env.local` hoặc `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Bạn có thể lấy từ **Settings → API** trong Supabase Dashboard.

### Step 4: Start Dev Server

```bash
npm run dev
```

---

## 📝 Cách Sử Dụng

### Import Functions

```typescript
import { 
  logCreateAction, 
  logUpdateAction, 
  logDeleteAction,
  logLoginAction,
  logLogoutAction,
  CurrentUser 
} from '../services/logHelpers';
```

### Define Current User

```typescript
const currentUser: CurrentUser = {
  id: 'user-123',
  username: 'admin',
  email: 'admin@school.com',
  role: 'admin',
};
```

### Log Actions (All Async!)

```typescript
// Log CREATE
await logCreateAction(
  currentUser,
  'student',        // resourceType
  'std-001',        // resourceId
  'Trần Văn A',     // resourceName
  { name: 'Trần Văn A' }  // resourceData
);

// Log UPDATE
await logUpdateAction(
  currentUser,
  'student',
  'std-001',
  'Trần Văn A',
  oldData,     // before
  newData      // after
);

// Log DELETE
await logDeleteAction(
  currentUser,
  'student',
  'std-001',
  'Trần Văn A',
  oldData
);

// Log VIEW
await logViewAction(currentUser, 'student');

// Log LOGIN
await logLoginAction(currentUser);

// Log LOGOUT
await logLogoutAction('user-123');
```

### View Logs in Admin Panel

```typescript
import ActivityLogsPanel from './components/ActivityLogsPanel';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ActivityLogsPanel />  {/* 3 tabs: Activities, Logins, Stats */}
    </div>
  );
}
```

---

## 🧪 Test Logging

### Test 1: Browser Console

```javascript
// Check Supabase connection
console.log('Supabase:', supabase);
```

### Test 2: Create Log Entry

```typescript
// In any component
await logCreateAction(
  { id: 'test', username: 'test', role: 'admin' },
  'student',
  'std-001',
  'Test Student',
  {}
);
```

### Test 3: Check Supabase Dashboard

1. Mở Supabase Dashboard
2. Vào **Table Editor**
3. Click `activity_logs` table
4. Xem log entry bạn vừa tạo

### Test 4: View in UI

1. Vào Admin Panel
2. Click **Activities** tab
3. Xem logs bạn vừa tạo

---

## 🔐 Security: Row-Level Security (RLS)

Database đã được setup với RLS policies:

### Cho Admin
```sql
-- Admin xem TẤT CẢ logs
SELECT * FROM activity_logs WHERE user_role = 'admin'
```

### Cho User
```sql
-- User chỉ xem logs của chính họ
SELECT * FROM activity_logs WHERE user_id = auth.uid()
```

### Qui Tắc
- ✅ Admin: Xem all
- ✅ User: Xem own logs
- ✅ Insert: App (via service role key)
- ❌ Update: Không cho phép
- ❌ Delete: Admin only

---

## 📊 Data Structure

### activity_logs Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique ID |
| user_id | UUID | User who performed action |
| username | VARCHAR | Username |
| user_role | VARCHAR | admin/teacher/viewer |
| action_type | VARCHAR | CREATE/UPDATE/DELETE/VIEW/LOGIN |
| resource_type | VARCHAR | student/teacher/class/subject |
| resource_id | UUID | Which resource |
| resource_name | VARCHAR | Name of resource |
| description | TEXT | What happened |
| status | VARCHAR | success/failed |
| error_message | TEXT | Error if failed |
| timestamp | TIMESTAMP | When happened |
| duration_ms | INTEGER | How long (ms) |
| metadata | JSONB | Extra data |

### login_logs Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique ID |
| user_id | UUID | User ID |
| username | VARCHAR | Username |
| email | VARCHAR | Email |
| user_role | VARCHAR | Role |
| login_time | TIMESTAMP | When logged in |
| logout_time | TIMESTAMP | When logged out |
| device_name | VARCHAR | Device (Windows/Mac/etc) |
| status | VARCHAR | active/logged_out |
| session_duration_seconds | INTEGER | How long session |

---

## 🎯 Integration Example: StudentDialog

```typescript
import { logCreateAction, logUpdateAction, CurrentUser } from '../services/logHelpers';

interface StudentDialogProps {
  student?: Student;
  currentUser: CurrentUser;
  onClose: () => void;
}

export function StudentDialog({ 
  student, 
  currentUser, 
  onClose 
}: StudentDialogProps) {
  const [formData, setFormData] = useState(student || {});

  const handleSave = async () => {
    try {
      if (student?.id) {
        // UPDATE
        const updated = await updateStudentAPI(student.id, formData);

        // 🔥 LOG UPDATE
        await logUpdateAction(
          currentUser,
          'student',
          student.id,
          formData.name,
          student,    // old
          updated     // new
        );
      } else {
        // CREATE
        const newStudent = await createStudentAPI(formData);

        // 🔥 LOG CREATE
        await logCreateAction(
          currentUser,
          'student',
          newStudent.id,
          newStudent.name,
          formData
        );
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <dialog>
      {/* Form */}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </dialog>
  );
}
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "Logs not appearing"
**Solution:**
1. Check Supabase connection
2. Verify environment variables
3. Check RLS policies (might be blocking)
4. Check browser console for errors

### Issue 2: "Permission denied" error
**Solution:**
1. Make sure you're authenticated
2. Check RLS policies in Supabase
3. Use service role key for inserts (if needed)

### Issue 3: "Slow queries"
**Solution:**
1. Check if indexes exist (they should from SQL schema)
2. Add more indexes if needed
3. Use pagination (default: 50 per page)

### Issue 4: "Can't see other users' logs"
**Solution:**
- This is by design (RLS policy)
- Only admin can see all logs
- User only sees their own logs

---

## 📚 API Reference

### logActivityService

```typescript
// Log activity
await logActivityService.logActivity({
  user_id: string;
  username: string;
  user_role: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN';
  resource_type?: string;
  resource_id?: string;
  resource_name?: string;
  description: string;
  status: 'success' | 'failed';
  error_message?: string;
  metadata?: Record<string, any>;
});

// Get all logs
await logActivityService.getAllActivityLogs();

// Get logs with filters
await logActivityService.getActivityLogs({
  userId?: string;
  actionType?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
});

// Get user logs
await logActivityService.getUserActivityLogs(userId);

// Get stats
await logActivityService.getStatistics();

// Clear logs (admin)
await logActivityService.clearActivityLogs();
```

### loginLogService

```typescript
// Log login
await loginLogService.logLogin({
  user_id: string;
  username: string;
  email: string;
  user_role: string;
});

// Log logout
await loginLogService.logLogout(userId);

// Get all login logs
await loginLogService.getAllLoginLogs();

// Get login logs with filters
await loginLogService.getLoginLogs({
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
});

// Get active sessions
await loginLogService.getActiveSessions();

// Clear login logs (admin)
await loginLogService.clearLoginLogs();
```

---

## 🎓 Tutorial: Complete Example

### Step 1: Setup Supabase ✅
```sql
-- Run database_logging.sql in Supabase
CREATE TABLE activity_logs (...)
CREATE TABLE login_logs (...)
```

### Step 2: Add to LoginPage
```typescript
import { logLoginAction } from './services/logHelpers';

async function handleLogin(credentials) {
  const user = await authenticate(credentials);
  
  // 🔥 Log it
  await logLoginAction({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
  
  setCurrentUser(user);
}
```

### Step 3: Add to Student CRUD
```typescript
// Create
await logCreateAction(currentUser, 'student', id, name, data);

// Update
await logUpdateAction(currentUser, 'student', id, name, oldData, newData);

// Delete
await logDeleteAction(currentUser, 'student', id, name, data);
```

### Step 4: Add to Admin Panel
```typescript
<ActivityLogsPanel />
```

### Step 5: Test & Deploy
```bash
npm run build
npm run preview  # Test locally
docker build -t app .
docker run -p 3000:3000 app
```

---

## ✅ Checklist

- [ ] Run `database_logging.sql` in Supabase
- [ ] Add VITE_SUPABASE_URL to .env
- [ ] Add VITE_SUPABASE_ANON_KEY to .env
- [ ] `npm run dev`
- [ ] Add logging to LoginPage
- [ ] Add logging to StudentDialog
- [ ] Add logging to ClassDialog
- [ ] Add logging to TeacherDialog
- [ ] Add ActivityLogsPanel to AdminPanel
- [ ] Test logging works
- [ ] Check Supabase Table Editor
- [ ] Test filtering in UI
- [ ] Test export (JSON/CSV)
- [ ] Deploy to production

---

## 🎉 You're Ready!

Now all your logs are:
- ✅ Stored in Supabase Database
- ✅ Persistent (won't be lost)
- ✅ Secure (RLS policies)
- ✅ Real-time
- ✅ Searchable
- ✅ Viewable in beautiful UI

**Happy logging! 🚀**
