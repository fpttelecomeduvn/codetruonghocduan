# 🎯 Hướng Dẫn Hoàn Chỉnh: Thêm Activity Logging & Audit Trail

## 📋 Tổng Quan

Bạn vừa được cung cấp hệ thống logging đầy đủ cho ứng dụng với các tính năng:

- ✅ **Activity Logs** - Ghi lại tất cả hành động của user (CREATE, UPDATE, DELETE, VIEW, etc)
- ✅ **Login Logs** - Ghi lại lịch sử đăng nhập chi tiết
- ✅ **Statistics Dashboard** - Thống kê hoạt động theo ngày
- ✅ **Advanced Filters** - Lọc logs theo user, action, resource, date
- ✅ **Admin Panel** - Chỉ admin có thể xem tất cả logs
- ✅ **Beautiful UI** - Giao diện modern, responsive

---

## 🚀 BƯỚC 1: Setup Database

### 1.1 Vào Supabase Dashboard

1. Đăng nhập vào https://supabase.io
2. Chọn project của bạn
3. Vào tab **"SQL Editor"**

### 1.2 Chạy SQL Script

1. Copy toàn bộ nội dung từ file `database_logging.sql`
2. Paste vào SQL Editor
3. Click **"Run"**

✅ Xong! Tables `activity_logs` và `login_logs` được tạo

---

## 📦 BƯỚC 2: Check Các Files Đã Tạo

Các file sau đã được tạo:

```
src/
├── services/
│   ├── logService.ts          ✅ Service chính để handle logs
│   └── logHelpers.ts          ✅ Helper functions để dễ dùng
│
├── hooks/
│   └── useActivityLogs.ts     ✅ Hooks để fetch/manage logs
│
├── components/
│   └── ActivityLogsPanel.tsx  ✅ Component UI hiển thị logs
│
├── styles/
│   └── ActivityLogsPanel.css  ✅ CSS cho component
│
└── [Existing files...]

Database files:
├── database_logging.sql       ✅ SQL schema
└── LOGGING_INTEGRATION_GUIDE.md  ✅ Hướng dẫn integrate
```

---

## 🔧 BƯỚC 3: Integrate Vào App

### 3.1 Sửa `src/hooks/useAuth.ts`

Tìm hàm `login` và sửa:

```typescript
import { loginLogService } from '../services/logService';

// ... trong file useAuth.ts

const login = async (username: string, password: string) => {
  try {
    // Existing login logic
    const user = await authenticateUser(username, password);
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // ✅ THÊM LOGGING
      await loginLogService.logLogin({
        userId: user.id,
        username: user.username,
        email: user.email,
        userRole: user.role
      });
      
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    // ✅ LOG FAILED LOGIN
    await logActivityService.logActivity({
      userId: 'unknown',
      username: username,
      userRole: 'unknown',
      actionType: 'LOGIN',
      description: `Failed login attempt: ${username}`,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Cũng sửa logout function
const logout = async () => {
  if (currentUser) {
    // ✅ LOG LOGOUT
    await loginLogService.logLogout(currentUser.id);
  }
  
  setCurrentUser(null);
  setIsAuthenticated(false);
};
```

### 3.2 Sửa `src/App.tsx`

Thêm imports:

```typescript
import { logActivityService, loginLogService } from './services/logService';
import { logCreateAction, logUpdateAction, logDeleteAction, createLogContext } from './services/logHelpers';
import ActivityLogsPanel from './components/ActivityLogsPanel';
```

### 3.3 Thêm Tab Activity Logs

Tìm `currentTab` state và update:

```typescript
const [currentTab, setCurrentTab] = useState<
  | 'students'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'teacher-eval'
  | 'graduation-eval'
  | 'promotion-result'
  | 'activity-logs'  // ✅ Thêm
>('students');
```

### 3.4 Thêm Logging Cho CRUD Operations

**Ví dụ: Thêm logging cho Student Create**

```typescript
const handleAddStudent = async (studentData: any) => {
  try {
    const success = await addStudent(studentData);
    
    if (success && currentUser) {
      // ✅ LOG SUCCESSFUL CREATE
      await logCreateAction(
        createLogContext(currentUser),
        'student',
        `${studentData.firstName} ${studentData.lastName}`,
        studentData
      );
    }
    
    setDialogMode(null);
    setSelectedStudent(null);
  } catch (error) {
    if (currentUser) {
      // ✅ LOG FAILED CREATE
      await logActivityService.logActivity({
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        actionType: 'CREATE',
        resourceType: 'student',
        description: `Failed to create student: ${studentData.firstName} ${studentData.lastName}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};
```

**Ví dụ: Thêm logging cho Student Update**

```typescript
const handleUpdateStudent = async (studentData: any) => {
  try {
    const success = await updateStudent(selectedStudent?.id, studentData);
    
    if (success && currentUser && selectedStudent) {
      // ✅ LOG SUCCESSFUL UPDATE
      await logUpdateAction(
        createLogContext(currentUser),
        'student',
        selectedStudent.id,
        `${studentData.firstName} ${studentData.lastName}`,
        selectedStudent,
        studentData
      );
    }
    
    setDialogMode(null);
    setSelectedStudent(null);
  } catch (error) {
    if (currentUser) {
      // ✅ LOG FAILED UPDATE
      await logActivityService.logActivity({
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        actionType: 'UPDATE',
        resourceType: 'student',
        resourceId: selectedStudent?.id,
        description: `Failed to update student: ${selectedStudent?.firstName}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};
```

**Ví dụ: Thêm logging cho Student Delete**

```typescript
const handleConfirmDelete = async () => {
  if (!itemToDelete || !currentUser) return;
  
  try {
    let success = false;
    let resourceName = '';
    
    if (deleteType === 'student' && 'firstName' in itemToDelete) {
      success = await deleteStudent((itemToDelete as Student).id);
      resourceName = `${itemToDelete.firstName} ${itemToDelete.lastName}`;
    }
    // ... handle other delete types
    
    if (success) {
      // ✅ LOG SUCCESSFUL DELETE
      await logDeleteAction(
        createLogContext(currentUser),
        deleteType,
        itemToDelete.id,
        resourceName,
        itemToDelete
      );
    }
    
    setConfirmDialogOpen(false);
    setItemToDelete(null);
  } catch (error) {
    if (currentUser) {
      // ✅ LOG FAILED DELETE
      await logActivityService.logActivity({
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        actionType: 'DELETE',
        resourceType: deleteType,
        description: `Failed to delete ${deleteType}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};
```

### 3.5 Thêm Activity Logs Panel Vào UI

Thêm button trong navbar/menu:

```typescript
{hasPermission('admin') && (
  <button
    className="nav-button"
    onClick={() => setCurrentTab('activity-logs')}
    title="View Activity Logs"
  >
    📊 Activity Logs
  </button>
)}
```

Thêm render logic cho tab:

```typescript
{currentTab === 'activity-logs' && hasPermission('admin') && (
  <ActivityLogsPanel />
)}
```

---

## 🎨 BƯỚC 4: Giao Diện ActivityLogsPanel

### 4.1 Các Tính Năng

**Tab 1: Activities**
- Danh sách tất cả hành động của users
- Filters: Action Type, Resource Type, Date Range
- Pagination: 50 items per page
- Expandable rows: Xem chi tiết mỗi action
- Status badges: Success/Failed

**Tab 2: Login History**
- Lịch sử đăng nhập chi tiết
- Filters: Date Range
- Thông tin: Device, IP, Duration, Status
- Phân biệt: Active/Logged Out/Session Expired

**Tab 3: Statistics**
- Tổng số activities
- Tổng đăng nhập hôm nay
- Số users đang active
- Số actions failed

### 4.2 Chi Tiết Logs Được Hiển Thị

Mỗi activity log chứa:

```typescript
{
  timestamp: "2025-12-18 15:30:45",
  user: "Nguyễn Văn A",
  role: "admin",
  action: "CREATE",
  resource: "student - Trần Thị B",
  status: "✓ success",
  ip: "192.168.1.100",
  
  // Expanded details:
  description: "Created new student: Trần Thị B",
  duration: "45ms",
  userAgent: "Mozilla/5.0...",
  additionalData: {
    firstName: "Trần",
    lastName: "Thị B",
    studentCode: "SV001",
    ...
  }
}
```

---

## 🔒 BƯỚC 5: Permission & Security

### 5.1 Thêm Permissions

Cập nhật hàm `hasPermission` trong `useAuth`:

```typescript
const hasPermission = (permission: string): boolean => {
  if (!currentUser) return false;
  
  const adminPermissions = [
    'view_students',
    'create_students',
    'delete_students',
    'view_teachers',
    'create_teachers',
    'delete_teachers',
    'view_logs',        // ✅ Thêm
    'manage_logs',      // ✅ Thêm
    'admin',
  ];
  
  const teacherPermissions = [
    'view_students',
    'view_teachers',
    'view_logs',        // Teachers có thể xem logs của chính họ
  ];
  
  const viewerPermissions = [
    'view_students',
    'view_teachers',
  ];
  
  if (currentUser.role === 'admin') {
    return adminPermissions.includes(permission);
  } else if (currentUser.role === 'teacher') {
    return teacherPermissions.includes(permission);
  } else {
    return viewerPermissions.includes(permission);
  }
};
```

### 5.2 Row Level Security (RLS) đã được thiết lập

- **Admin**: Có thể xem tất cả logs
- **Teacher**: Chỉ xem logs của chính họ
- **Viewer**: Không có quyền xem logs

---

## 📝 BƯỚC 6: Đồng bộ Tất Cả CRUD Operations

Áp dụng logging cho **tất cả** CRUD operations:

**Students:**
- ✅ handleAddStudent - logCreateAction
- ✅ handleUpdateStudent - logUpdateAction
- ✅ handleDeleteStudent - logDeleteAction

**Teachers:**
- ✅ handleAddTeacher - logCreateAction
- ✅ handleUpdateTeacher - logUpdateAction
- ✅ handleDeleteTeacher - logDeleteAction

**Classes:**
- ✅ handleAddClass - logCreateAction
- ✅ handleUpdateClass - logUpdateAction
- ✅ handleDeleteClass - logDeleteAction

**Subjects:**
- ✅ handleAddSubject - logCreateAction
- ✅ handleUpdateSubject - logUpdateAction
- ✅ handleDeleteSubject - logDeleteAction

**Evaluations:**
- ✅ handleAddEvaluation - logCreateAction
- ✅ handleUpdateEvaluation - logUpdateAction
- ✅ handleDeleteEvaluation - logDeleteAction

---

## 🧪 BƯỚC 7: Test Logging

### 7.1 Test Login Logging

1. Đăng nhập vào app
2. Vào Supabase Dashboard
3. Query table `login_logs`
4. Nên thấy record mới với thông tin login

### 7.2 Test Activity Logging

1. Tạo student mới
2. Update student
3. Delete student
4. Vào Activity Logs Panel
5. Nên thấy tất cả 3 actions

### 7.3 Test Filters

1. Filter by Action Type: CREATE
2. Filter by Date Range: Today
3. Filter by Resource Type: student
4. Nên thấy đúng records

---

## 📊 BƯỚC 8: Xem Reports

### 8.1 Statistics Dashboard

Xem:
- Total activities: Toàn bộ actions
- Total logins today: Đăng nhập hôm nay
- Active users: Users đang active
- Failed actions: Lỗi xảy ra

### 8.2 Exported Data

Thêm tính năng export (tùy chọn):

```typescript
const exportLogs = (logs: ActivityLog[]) => {
  const csv = logs.map(log => ({
    timestamp: log.timestamp,
    user: log.username,
    action: log.action_type,
    resource: log.resource_type,
    status: log.status,
  }));
  
  // Export CSV...
};
```

---

## 🐛 Troubleshooting

### Logs không được save

**Kiểm tra:**
1. Supabase connection hoạt động?
2. RLS policies được enable?
3. Tables được tạo?

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public';

-- Check data
SELECT COUNT(*) FROM activity_logs;
```

### Logs không hiển thị trong UI

**Kiểm tra:**
1. Permissions được set đúng?
2. logActivityService.logActivity() được gọi?
3. currentUser object có data?

```typescript
// Debug
console.log('Current user:', currentUser);
console.log('Has permission:', hasPermission('view_logs'));
```

---

## ✅ Checklist Hoàn Thành

- [ ] Database schema được tạo (database_logging.sql)
- [ ] logService.ts được tạo
- [ ] useActivityLogs.ts hook được tạo
- [ ] ActivityLogsPanel component được tạo
- [ ] CSS styling được tạo
- [ ] logHelpers.ts được tạo
- [ ] useAuth.ts được sửa (login/logout logging)
- [ ] App.tsx được import logging services
- [ ] App.tsx tab 'activity-logs' được thêm
- [ ] Tất cả CRUD operations có logging
- [ ] Permissions được setup
- [ ] Tests để verify logging hoạt động
- [ ] UI được render đúng và đẹp

---

## 🎉 Hoàn Thành!

Bạn giờ có một hệ thống logging đầy đủ với:
- ✅ Ghi lại tất cả hành động của users
- ✅ Lịch sử đăng nhập chi tiết
- ✅ Giao diện admin panel để xem logs
- ✅ Filters & search capabilities
- ✅ Statistics dashboard
- ✅ Beautiful, responsive UI

**Bây giờ bạn có thể:**
- 📊 Track tất cả hoạt động trong system
- 🔍 Audit trail đầy đủ cho compliance
- 📈 Analyze user behavior & patterns
- 🔒 Detect suspicious activities
- 📝 Keep detailed records

---

## 📚 Tài Liệu Thêm

- `database_logging.sql` - SQL schema
- `LOGGING_INTEGRATION_GUIDE.md` - Chi tiết integration
- `src/services/logService.ts` - Service API
- `src/services/logHelpers.ts` - Helper functions
- `src/hooks/useActivityLogs.ts` - React hooks
- `src/components/ActivityLogsPanel.tsx` - UI component
- `src/styles/ActivityLogsPanel.css` - Styling
