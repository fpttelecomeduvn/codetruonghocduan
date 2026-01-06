# ⚡ Quick Start: Activity Logging

## 🎯 Bước 1: Thực thi SQL Schema

1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Vào **SQL Editor**
3. Mở file `database_setup.sql` từ project
4. Copy toàn bộ nội dung
5. Dán vào SQL Editor và chạy
6. ✅ Các bảng `activity_logs` và `login_logs` sẽ được tạo

---

## 🎯 Bước 2: Sử dụng Logs Management Panel

### Thêm vào App.tsx:

```tsx
import LogsManagementPanel from './components/LogsManagementPanel';

function App() {
  return (
    <div>
      {/* Existing components */}
      
      {/* Thêm dòng này */}
      <LogsManagementPanel />
    </div>
  );
}
```

### Hoặc thêm vào Admin Panel:

```tsx
import LogsManagementPanel from './components/LogsManagementPanel';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('logs');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('logs')}>Logs</button>
        {/* Tabs khác */}
      </nav>
      
      {activeTab === 'logs' && <LogsManagementPanel />}
    </div>
  );
};
```

---

## 🎯 Bước 3: Tích Hợp Logging vào Components

### Ví dụ: StudentList Component

```tsx
import { logView } from '../services/logActionService';
import LogsManagementPanel from '../components/LogsManagementPanel';

export const StudentList = () => {
  const { students, loading } = useStudents();
  const [currentUser] = useState({
    id: 'user-123',
    username: 'john_doe',
    role: 'admin'
  });

  useEffect(() => {
    // Log view action
    logView(
      currentUser.id,
      currentUser.username,
      currentUser.role,
      'student',
      'Danh sách sinh viên'
    );
  }, []);

  const handleCreateStudent = (newStudent) => {
    // onSave sẽ tự động log CREATE action
    // vì StudentDialog đã được cập nhật
  };

  return (
    <div>
      <StudentDialog 
        currentUser={currentUser}
        onSave={handleCreateStudent}
      />
      
      {/* Logs panel */}
      <LogsManagementPanel />
    </div>
  );
};
```

---

## 🔍 Xem Logs

1. **Truy cập trang Logs Management**
2. **Tìm kiếm**:
   - Nhập tên user, tài nguyên, hành động
3. **Lọc**:
   - Chọn loại hành động (CREATE, UPDATE, DELETE)
   - Chọn loại tài nguyên (Student, Teacher, Class)
   - Chọn trạng thái (Thành công / Thất bại)
   - Chọn khoảng thời gian
4. **Chi tiết**:
   - Nhấn "Chi Tiết" để xem metadata, IP, location, user agent

---

## 📊 Thông Tin Ghi Lại

Mỗi log bao gồm:

```json
{
  "timestamp": "2025-01-06 14:30:45",
  "username": "admin_user",
  "action_type": "CREATE",
  "resource_type": "student",
  "resource_name": "Nguyễn Văn A",
  "status": "success",
  "ip_address": "192.168.1.1",
  "location": "Hanoi, Vietnam",
  "user_agent": "Mozilla/5.0...",
  "duration_ms": 245,
  "metadata": {
    "gpa": 3.5,
    "major": "IT",
    "status": "active",
    "device": "Windows",
    "browser": "Chrome"
  }
}
```

---

## 💻 API Usage Examples

### Lấy logs của một user:

```typescript
const { data } = await logActivityService.getActivityLogs({
  userId: 'user-123',
  limit: 50
});
```

### Lấy logs lỗi:

```typescript
const { data } = await logActivityService.getActivityLogs({
  actionType: 'ERROR'
});
```

### Lấy logs tạo sinh viên trong 7 ngày:

```typescript
const 7DaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const { data } = await logActivityService.getActivityLogs({
  actionType: 'CREATE',
  resourceType: 'student',
  startDate: sevenDaysAgo.toISOString(),
  endDate: new Date().toISOString()
});
```

---

## ✅ Checklist Tích Hợp

- [ ] Cập nhật SQL schema từ `database_setup.sql`
- [ ] Import `LogsManagementPanel` vào App/AdminPanel
- [ ] Cập nhật `StudentDialog` với logging
- [ ] Cập nhật `TeacherDialog` với logging
- [ ] Cập nhật `ClassDialog` với logging
- [ ] Thêm logging vào các hook (useStudents, useTeachers, etc.)
- [ ] Test: Tạo, sửa, xóa một bản ghi và kiểm tra logs
- [ ] Kiểm tra location detection hoạt động
- [ ] Test search và filter trong logs panel

---

## 🚀 Next Steps

Sau khi tích hợp xong:

1. **Tạo Audit Report**: Component để export logs thành PDF/Excel
2. **Real-time Notifications**: Alert khi có lỗi hoặc hành động nghi vấn
3. **Activity Dashboard**: Hiển thị thống kê hoạt động theo thời gian
4. **Data Retention**: Xóa logs cũ theo chính sách (e.g., 1 năm)
5. **Compliance Reports**: Để audit và compliance (GDPR, ISO)

---

**Created**: 2025-01-06
**Status**: ✅ Ready to Use
