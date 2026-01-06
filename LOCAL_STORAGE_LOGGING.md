# 📝 Hướng Dẫn Sử Dụng localStorage Logging

## Tổng Quan

Thay vì dùng Supabase database, chúng ta sử dụng **localStorage** - một cách lưu trữ dữ liệu cục bộ trên browser.

**Ưu điểm:**
- ✅ Không cần setup database
- ✅ Không phụ thuộc vào Supabase
- ✅ Lưu dữ liệu ngay trên máy client
- ✅ Hỗ trợ export JSON/CSV/TXT
- ✅ Đơn giản và dễ dùng

**Nhược điểm:**
- ⚠️ Dữ liệu chỉ lưu trên máy client (nếu user xóa browser cache sẽ mất)
- ⚠️ Giới hạn dung lượng (~5-10MB)
- ⚠️ Không lưu trữ trên server (để lâu dài)

---

## Cấu Trúc Thư Mục

```
src/
├── services/
│   ├── fileLogService.ts          ✅ Service logging chính
│   └── logHelpers.ts              ✅ Helper functions
├── hooks/
│   └── useFileActivityLogs.ts      ✅ React hooks
├── components/
│   └── FileActivityLogsPanel.tsx   ✅ UI component
└── styles/
    └── FileActivityLogsPanel.css   ✅ CSS styling
```

---

## 1. Sử Dụng FileLogService

### 1.1 Log Activity (Hành Động)

```typescript
import { fileLogService } from '../services/fileLogService';

// Khi user tạo student
fileLogService.logActivity({
  userId: 'user-123',
  username: 'admin',
  userRole: 'admin',
  actionType: 'CREATE',
  resourceType: 'student',
  resourceId: 'std-001',
  resourceName: 'Trần Văn A',
  description: 'Tạo mới học sinh Trần Văn A',
  status: 'success',
});

// Khi user update class
fileLogService.logActivity({
  userId: 'user-456',
  username: 'teacher',
  userRole: 'teacher',
  actionType: 'UPDATE',
  resourceType: 'class',
  resourceId: 'cls-001',
  resourceName: 'Lớp 12A1',
  description: 'Cập nhật thông tin lớp 12A1',
  status: 'success',
});

// Khi user xóa subject
fileLogService.logActivity({
  userId: 'user-789',
  username: 'admin',
  userRole: 'admin',
  actionType: 'DELETE',
  resourceType: 'subject',
  resourceId: 'subj-001',
  resourceName: 'Toán',
  description: 'Xóa môn học Toán',
  status: 'success',
});
```

### 1.2 Log Login

```typescript
import { fileLoginLogService } from '../services/fileLogService';

// Khi user login thành công
fileLoginLogService.logLogin({
  userId: 'user-123',
  username: 'admin',
  email: 'admin@school.com',
  userRole: 'admin',
});

// Khi user logout
fileLoginLogService.logLogout('user-123');
```

### 1.3 Lấy Logs

```typescript
// Lấy tất cả activity logs
const allLogs = fileLogService.getAllActivityLogs();

// Lấy logs với filter
const { data, count } = fileLogService.getActivityLogs({
  userId: 'user-123',
  actionType: 'CREATE',
  resourceType: 'student',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  limit: 100,
});

// Lấy login logs
const loginLogs = fileLoginLogService.getAllLoginLogs();

// Lấy login logs với filter
const { data: logins, count: totalLogins } = fileLoginLogService.getLoginLogs({
  userId: 'user-123',
  startDate: '2024-01-01T00:00:00Z',
});
```

### 1.4 Thống Kê

```typescript
// Lấy thống kê
const stats = fileLogService.getStats();
console.log(stats);
// Output:
// {
//   totalActivities: 1250,
//   todayActivities: 45,
//   failedActions: 3,
//   actionsByType: {
//     CREATE: 500,
//     UPDATE: 600,
//     DELETE: 100,
//     VIEW: 50
//   }
// }
```

### 1.5 Export Logs

```typescript
// Export thành JSON
const json = fileLogService.exportLogsAsJSON();
// Output: "[{...}, {...}, ...]"

// Export thành CSV
const csv = fileLogService.exportLogsAsCSV();
// Output: "Timestamp,User,Action,..."

// Export thành TXT
const txt = fileLogService.exportLogsAsTXT();
// Output: "========================================\nACTIVITY LOGS REPORT\n..."

// Download file
import { downloadLogs } from '../services/fileLogService';

downloadLogs(
  json,
  'activity-logs-2024-01-15.json',
  'application/json'
);
```

### 1.6 Xóa Logs

```typescript
// Xóa tất cả activity logs
fileLogService.clearActivityLogs();

// Xóa tất cả login logs
fileLoginLogService.clearLoginLogs();
```

---

## 2. Sử Dụng Log Helpers

Để dễ dàng hơn, dùng helpers trong `logHelpers.ts`:

```typescript
import {
  logCreateAction,
  logUpdateAction,
  logDeleteAction,
  logLoginAction,
  logLogoutAction,
  CurrentUser,
} from '../services/logHelpers';

const currentUser: CurrentUser = {
  id: 'user-123',
  username: 'admin',
  email: 'admin@school.com',
  role: 'admin',
};

// Log create
logCreateAction(
  currentUser,
  'student',           // resourceType
  'std-001',           // resourceId
  'Trần Văn A',        // resourceName
  {                    // resourceData
    name: 'Trần Văn A',
    dob: '2005-01-01',
    gender: 'M',
    email: 'tranan@school.com',
  }
);

// Log update
logUpdateAction(
  currentUser,
  'class',
  'cls-001',
  'Lớp 12A1',
  { name: 'Lớp 12A', room: '101' },           // oldValue
  { name: 'Lớp 12A1', room: '102' }           // newValue
);

// Log delete
logDeleteAction(
  currentUser,
  'subject',
  'subj-001',
  'Toán',
  { name: 'Toán', credits: 3 }  // resourceData
);

// Log login
logLoginAction(currentUser);

// Log logout
logLogoutAction('user-123');
```

---

## 3. Dùng React Hook

```typescript
import { useFileActivityLogs, useFileLoginLogs, useFileLogStats } from '../hooks/useFileActivityLogs';

function AdminPanel() {
  // Activity Logs
  const {
    logs,              // Danh sách logs
    loading,           // Đang tải?
    totalCount,        // Tổng số logs
    currentPage,       // Trang hiện tại
    pageSize,          // Kích thước trang
    totalPages,        // Tổng số trang
    setCurrentPage,    // Đổi trang
    filters,           // Bộ lọc hiện tại
    handleFilterChange,// Cập nhật filter
    handleClearFilters,// Xóa filters
  } = useFileActivityLogs();

  // Login Logs
  const {
    logs: loginLogs,
    loading: loginLoading,
    // ... các property khác
  } = useFileLoginLogs();

  // Statistics
  const { stats } = useFileLogStats();

  return (
    <div>
      <h2>Tổng Hành Động: {totalCount}</h2>
      <table>
        <thead>
          <tr>
            <th>Thời Gian</th>
            <th>User</th>
            <th>Hành Động</th>
            <th>Mô Tả</th>
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
    </div>
  );
}
```

---

## 4. Sử Dụng Component UI

```typescript
import FileActivityLogsPanel from '../components/FileActivityLogsPanel';

function AdminDashboard() {
  const currentUser = {
    id: 'user-123',
    role: 'admin',
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Component này sẽ hiển thị:
          - Tab: Activities, Logins, Statistics
          - Bộ lọc theo User, Action, Date
          - Nút export JSON/CSV/TXT
          - Bảng hiển thị logs
          - Thống kê
      */}
      <FileActivityLogsPanel
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role}
      />
    </div>
  );
}
```

---

## 5. Tích Hợp Vào App.tsx

```typescript
import { useEffect, useState } from 'react';
import { logLoginAction, logLogoutAction } from './services/logHelpers';
import FileActivityLogsPanel from './components/FileActivityLogsPanel';

function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Log login khi user đăng nhập
  useEffect(() => {
    if (currentUser) {
      logLoginAction(currentUser);
    }
  }, [currentUser]);

  // Log logout khi user đăng xuất
  const handleLogout = () => {
    if (currentUser) {
      logLogoutAction(currentUser.id);
    }
    setCurrentUser(null);
  };

  return (
    <div className="App">
      {currentUser && (
        <>
          <h1>Xin chào, {currentUser.username}!</h1>
          <button onClick={handleLogout}>Đăng Xuất</button>
          
          {/* Hiển thị logs panel cho admin */}
          {currentUser.role === 'admin' && (
            <FileActivityLogsPanel
              currentUserId={currentUser.id}
              currentUserRole={currentUser.role}
            />
          )}
        </>
      )}
    </div>
  );
}
```

---

## 6. Ví Dụ Thực Tế: StudentDialog

```typescript
import { logCreateAction, logUpdateAction } from '../services/logHelpers';
import { CurrentUser } from '../services/logHelpers';

interface StudentDialogProps {
  student: Student | null;
  isOpen: boolean;
  currentUser: CurrentUser;
  onClose: () => void;
}

export function StudentDialog({
  student,
  isOpen,
  currentUser,
  onClose,
}: StudentDialogProps) {
  const [formData, setFormData] = useState<Student>(student || {});

  const handleSave = async () => {
    try {
      if (student?.id) {
        // Update
        await updateStudent(student.id, formData);

        // Log update
        logUpdateAction(
          currentUser,
          'student',
          student.id,
          formData.name,
          student,        // old data
          formData         // new data
        );
      } else {
        // Create
        const newStudent = await createStudent(formData);

        // Log create
        logCreateAction(
          currentUser,
          'student',
          newStudent.id,
          newStudent.name,
          formData
        );
      }

      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  return (
    <dialog open={isOpen}>
      {/* Form fields */}
      <button onClick={handleSave}>Lưu</button>
      <button onClick={onClose}>Hủy</button>
    </dialog>
  );
}
```

---

## 7. Truy Cập Browser Storage

Để xem logs đã lưu:

1. **Mở DevTools** (F12)
2. Vào tab **Application**
3. Chọn **LocalStorage**
4. Tìm **app_activity_logs** hoặc **app_login_logs**
5. Xem dữ liệu JSON

---

## 8. Xóa Tất Cả Logs (Admin)

```typescript
// Xóa từ AdminPanel
const handleClearAllLogs = () => {
  if (confirm('Bạn chắc chắn muốn xóa tất cả logs?')) {
    fileLogService.clearActivityLogs();
    fileLoginLogService.clearLoginLogs();
    alert('Đã xóa tất cả logs');
  }
};
```

---

## 9. Export & Download

```typescript
// Xuất JSON
const json = fileLogService.exportLogsAsJSON();
downloadLogs(
  json,
  `logs-${new Date().toISOString().slice(0, 10)}.json`,
  'application/json'
);

// Xuất CSV (dùng Excel hoặc Google Sheets)
const csv = fileLogService.exportLogsAsCSV();
downloadLogs(
  csv,
  `logs-${new Date().toISOString().slice(0, 10)}.csv`,
  'text/csv'
);

// Xuất TXT (text file)
const txt = fileLogService.exportLogsAsTXT();
downloadLogs(
  txt,
  `logs-${new Date().toISOString().slice(0, 10)}.txt`,
  'text/plain'
);
```

---

## 🎯 Tóm Tắt

| Chức Năng | Code |
|-----------|------|
| Log activity | `fileLogService.logActivity({...})` |
| Log login | `fileLoginLogService.logLogin({...})` |
| Get logs | `fileLogService.getAllActivityLogs()` |
| Export JSON | `fileLogService.exportLogsAsJSON()` |
| Export CSV | `fileLogService.exportLogsAsCSV()` |
| Export TXT | `fileLogService.exportLogsAsTXT()` |
| Clear logs | `fileLogService.clearActivityLogs()` |

---

## ⚠️ Lưu Ý Quan Trọng

1. **Dữ liệu không persistent**: Nếu user xóa browser cache → dữ liệu logs mất
2. **Giới hạn dung lượng**: localStorage chỉ ~5-10MB
3. **Local only**: Logs không được sync qua các device khác
4. **Bảo mật**: Tất cả dữ liệu lưu ở browser (user có thể xem qua DevTools)

Nếu cần lưu logs lâu dài trên server → cần setup Backend API & Database!
