# 🚀 Quick Examples - localStorage Logging

## Example 1: Basic Login Logging

```typescript
// LoginPage.tsx
import { logLoginAction, logErrorAction } from '../services/logHelpers';

async function handleLogin(email: string, password: string) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = await response.json();

    // ✅ Log successful login
    logLoginAction({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Save user to state
    setCurrentUser(user);
  } catch (error) {
    // ✅ Log error
    logErrorAction(
      { id: 'unknown', username: email, email, role: 'user' },
      'LOGIN',
      'authentication',
      'Invalid credentials'
    );
  }
}
```

---

## Example 2: CRUD Operations with Logging

```typescript
// StudentDialog.tsx
import {
  logCreateAction,
  logUpdateAction,
  logDeleteAction,
} from '../services/logHelpers';

// CREATE
async function createStudent(data: StudentData) {
  const newStudent = await fetch('/api/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => r.json());

  logCreateAction(
    currentUser,
    'student',
    newStudent.id,
    newStudent.name,
    data
  );

  return newStudent;
}

// UPDATE
async function updateStudent(id: string, oldData: StudentData, newData: StudentData) {
  const updated = await fetch(`/api/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(newData),
  }).then(r => r.json());

  logUpdateAction(
    currentUser,
    'student',
    id,
    newData.name,
    oldData,
    newData
  );

  return updated;
}

// DELETE
async function deleteStudent(id: string, student: StudentData) {
  await fetch(`/api/students/${id}`, { method: 'DELETE' });

  logDeleteAction(
    currentUser,
    'student',
    id,
    student.name,
    student
  );
}
```

---

## Example 3: View Actions

```typescript
// StudentList.tsx
import { logViewAction } from '../services/logHelpers';

function StudentList() {
  useEffect(() => {
    // Log when viewing list
    logViewAction(currentUser, 'student');

    loadStudents();
  }, []);

  const handleViewDetail = (student: Student) => {
    // Log when viewing individual student
    logViewAction(currentUser, 'student', student.id, student.name);
  };

  return (
    <table>
      <tbody>
        {students.map(student => (
          <tr key={student.id}>
            <td>{student.name}</td>
            <td>
              <button onClick={() => handleViewDetail(student)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Example 4: Error Logging

```typescript
import { logErrorAction } from '../services/logHelpers';

async function risky Operation() {
  try {
    // Do something
    await complexOperation();
  } catch (error) {
    logErrorAction(
      currentUser,
      'UPDATE',
      'student',
      'Failed to update student: ' + error.message,
      { originalError: error }
    );

    alert('Operation failed');
  }
}
```

---

## Example 5: View All Logs

```typescript
// AdminPanel.tsx
import { useFileActivityLogs } from '../hooks/useFileActivityLogs';

export function AdminPanel() {
  const {
    logs,
    loading,
    totalCount,
    filters,
    handleFilterChange,
  } = useFileActivityLogs();

  return (
    <div>
      <h1>Total Logs: {totalCount}</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                <td>{log.username}</td>
                <td>{log.action_type}</td>
                <td>{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## Example 6: Export Logs

```typescript
import {
  fileLogService,
  downloadLogs,
} from '../services/fileLogService';

// Export as JSON
function exportAsJSON() {
  const json = fileLogService.exportLogsAsJSON();
  downloadLogs(
    json,
    'logs.json',
    'application/json'
  );
}

// Export as CSV
function exportAsCSV() {
  const csv = fileLogService.exportLogsAsCSV();
  downloadLogs(
    csv,
    'logs.csv',
    'text/csv'
  );
}

// Export as TXT
function exportAsTXT() {
  const txt = fileLogService.exportLogsAsTXT();
  downloadLogs(
    txt,
    'logs.txt',
    'text/plain'
  );
}
```

---

## Example 7: Statistics

```typescript
import { useFileLogStats } from '../hooks/useFileActivityLogs';

export function Dashboard() {
  const { stats } = useFileLogStats();

  return (
    <div>
      <div>Total Activities: {stats.totalActivities}</div>
      <div>Today: {stats.todayActivities}</div>
      <div>Failed: {stats.failedActions}</div>
      <div>Active Users: {stats.activeUsers}</div>
    </div>
  );
}
```

---

## Example 8: Filter Logs

```typescript
import { useFileActivityLogs } from '../hooks/useFileActivityLogs';

export function LogsPage() {
  const {
    logs,
    filters,
    handleFilterChange,
    handleClearFilters,
  } = useFileActivityLogs();

  return (
    <div>
      <input
        placeholder="User ID"
        value={filters.userId}
        onChange={(e) =>
          handleFilterChange({ userId: e.target.value })
        }
      />

      <select
        value={filters.actionType}
        onChange={(e) =>
          handleFilterChange({ actionType: e.target.value })
        }
      >
        <option value="">All Actions</option>
        <option value="CREATE">CREATE</option>
        <option value="UPDATE">UPDATE</option>
        <option value="DELETE">DELETE</option>
        <option value="LOGIN">LOGIN</option>
      </select>

      <button onClick={handleClearFilters}>Clear Filters</button>

      <table>
        {logs.map(log => (
          <tr key={log.id}>
            <td>{log.timestamp}</td>
            <td>{log.username}</td>
            <td>{log.action_type}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

---

## Example 9: Component Integration

```typescript
// App.tsx - Main component setup

import { useState, useEffect } from 'react';
import FileActivityLogsPanel from './components/FileActivityLogsPanel';
import { logLoginAction, logLogoutAction } from './services/logHelpers';
import { CurrentUser } from './services/logHelpers';

export function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Log login when user is set
  useEffect(() => {
    if (currentUser) {
      logLoginAction(currentUser);
    }
  }, [currentUser]);

  // Log logout when user is cleared
  const handleLogout = () => {
    if (currentUser) {
      logLogoutAction(currentUser.id);
    }
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <div className="app">
      <header>
        <h1>Welcome, {currentUser.username}</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main>
        {/* Your app content */}
      </main>

      {/* Admin only - show logs panel */}
      {currentUser.role === 'admin' && (
        <section>
          <FileActivityLogsPanel
            currentUserId={currentUser.id}
            currentUserRole={currentUser.role}
          />
        </section>
      )}
    </div>
  );
}
```

---

## Example 10: Advanced - Get User Summary

```typescript
import {
  getUserActivitySummary,
  getUserLastActivity,
  getActivityTrendToday,
} from '../services/logHelpers';

const userId = 'user-123';

// Get summary of all user's activities
const summary = getUserActivitySummary(userId);
console.log(summary);
// Output: { CREATE_student: 5, UPDATE_class: 3, DELETE_subject: 1 }

// Get last activity
const lastActivity = getUserLastActivity(userId);
console.log(lastActivity);
// Output: "UPDATE - Cập nhật student: Trần Văn A (15/01/2024 10:30)"

// Get activity trend for today (by hour)
const trend = getActivityTrendToday();
console.log(trend);
// Output: { "10:00": 5, "11:00": 3, "14:00": 2 }
```

---

## Example 11: Manual Activity Logging

```typescript
import { fileLogService } from '../services/fileLogService';

// Manual log entry
fileLogService.logActivity({
  userId: 'user-123',
  username: 'admin',
  userRole: 'admin',
  actionType: 'CREATE',
  resourceType: 'student',
  resourceId: 'std-001',
  resourceName: 'Trần Văn A',
  description: 'Created new student Trần Văn A',
  status: 'success',
  metadata: {
    batch: true,
    count: 5,
  },
});
```

---

## Example 12: Check localStorage

```typescript
// Open browser console (F12 → Console)

// 1. Check raw localStorage
console.log(localStorage.getItem('app_activity_logs'));

// 2. Parse and display
const logs = JSON.parse(localStorage.getItem('app_activity_logs') || '[]');
console.table(logs);

// 3. Count entries
console.log('Total logs:', logs.length);

// 4. Filter by type
const creates = logs.filter(l => l.action_type === 'CREATE');
console.log('CREATE logs:', creates);

// 5. Clear all
localStorage.removeItem('app_activity_logs');
localStorage.removeItem('app_login_logs');
```

---

## 🎯 Most Common Use Cases

### 1. Log Create Action
```typescript
logCreateAction(currentUser, 'student', id, name, data);
```

### 2. Log Update Action
```typescript
logUpdateAction(currentUser, 'student', id, name, oldData, newData);
```

### 3. Log Delete Action
```typescript
logDeleteAction(currentUser, 'student', id, name, data);
```

### 4. Log View/Access
```typescript
logViewAction(currentUser, 'student');
logViewAction(currentUser, 'student', id, name);
```

### 5. Log Error
```typescript
logErrorAction(currentUser, 'CREATE', 'student', 'Invalid data');
```

### 6. View Logs in UI
```typescript
<FileActivityLogsPanel currentUserRole="admin" />
```

### 7. Export Logs
```typescript
const json = fileLogService.exportLogsAsJSON();
downloadLogs(json, 'logs.json', 'application/json');
```

---

## ✅ Testing Checklist

- [ ] Create student → Check logs
- [ ] Update student → Check logs
- [ ] Delete student → Check logs
- [ ] Login → Check login logs
- [ ] Logout → Check login logs
- [ ] Filter by user → Verify filtering
- [ ] Filter by action → Verify filtering
- [ ] Export JSON → File downloads
- [ ] Export CSV → File downloads
- [ ] Export TXT → File downloads
- [ ] View in DevTools → localStorage visible
- [ ] Refresh page → Logs persist
- [ ] Clear cache → Logs gone
- [ ] Admin panel → See FileActivityLogsPanel

---

## 🚀 Deployment

```bash
# Build
npm run build

# Docker
docker build -t app .
docker run -p 3000:3000 app

# Logs will be saved in browser localStorage
# Users can export anytime
# Admin can view in admin panel
```

---

**Ready to use! 🎉**

Just copy-paste examples into your components!
