# 📊 Hướng Dẫn Tính Năng Logs Tác Động (Activity Logging)

## 📋 Tổng Quan

Hệ thống đã được nâng cấp với tính năng **Kiểm Soát Logs Tác Động** toàn diện. Tất cả hoạt động của người dùng sẽ được ghi lại với các thông tin chi tiết:

- **Thời gian**: Thời điểm thực hiện hành động
- **Người dùng**: Tên user và vai trò
- **Hành động**: Loại thao tác (CREATE, UPDATE, DELETE, VIEW, EXPORT, IMPORT)
- **Tài nguyên**: Loại dữ liệu bị tác động (Student, Teacher, Class, Subject, Evaluation)
- **Kết quả**: Thành công hay thất bại
- **IP Address**: Địa chỉ IP của máy tính
- **Location**: Vị trí địa lý (Country, City, Region)
- **User Agent**: Thông tin browser và device
- **Metadata**: Dữ liệu chi tiết về thay đổi

---

## 🚀 Cách Sử Dụng

### 1. **Trang Quản Lý Logs** (LogsManagementPanel)

Import component vào App.tsx:

```tsx
import LogsManagementPanel from './components/LogsManagementPanel';

// Trong App component
<LogsManagementPanel />
```

**Tính năng:**
- 🔍 **Tìm kiếm nâng cao**: Theo tên user, mô tả, tài nguyên, hành động
- 🎯 **Lọc theo**:
  - Loại hành động (LOGIN, CREATE, UPDATE, DELETE, etc.)
  - Loại tài nguyên (Student, Teacher, Class, Subject)
  - Trạng thái (Thành công / Thất bại)
  - Khoảng thời gian (Từ ngày - Đến ngày)
- 📄 **Phân trang**: Xem 50 bản ghi trên mỗi trang
- 📖 **Chi tiết**: Mở rộng từng log để xem full metadata

---

### 2. **Ghi Logs Tự Động**

#### **Cách 1: Sử dụng logCrudAction (Recommended)**

```typescript
import { logCrudAction, logCreate, logUpdate, logDelete } from '../services/logActionService';

// CREATE
const result = await logCrudAction(
  logCreate(
    userId,
    username,
    userRole,
    'student',
    studentName,
    { gpa: 3.5, major: 'IT' }
  ),
  () => supabase.from('students').insert([newStudent])
);

// UPDATE
await logCrudAction(
  logUpdate(
    userId,
    username,
    userRole,
    'student',
    studentId,
    studentName,
    { email: 'old@email.com', phone: '0123456789' }
  ),
  () => supabase.from('students').update(updatedData).eq('id', studentId)
);

// DELETE
await logCrudAction(
  logDelete(
    userId,
    username,
    userRole,
    'student',
    studentId,
    studentName
  ),
  () => supabase.from('students').delete().eq('id', studentId)
);
```

#### **Cách 2: Sử dụng logAction (Simple)**

```typescript
import { logAction } from '../services/logActionService';

await logAction({
  userId: user.id,
  username: user.username,
  userRole: user.role,
  actionType: 'VIEW',
  resourceType: 'student',
  resourceName: studentName,
  description: 'Xem danh sách sinh viên',
  metadata: { count: 100 }
});
```

#### **Cách 3: Sử dụng withLogging**

```typescript
import { withLogging, logCreate } from '../services/logActionService';

const result = await withLogging(
  logCreate(userId, username, userRole, 'teacher', teacherName),
  () => supabase.from('teachers').insert([newTeacher])
);
```

---

### 3. **Tích Hợp Vào Components**

#### **Ví dụ: StudentDialog**

```tsx
import { logCrudAction, logCreate, logUpdate } from '../services/logActionService';

const handleSave = async (studentData: Student) => {
  try {
    if (mode === 'create') {
      const result = await logCrudAction(
        logCreate(
          currentUser.id,
          currentUser.username,
          currentUser.role,
          'student',
          studentData.name
        ),
        async () => {
          const { data, error } = await supabase
            .from('students')
            .insert([studentData]);
          if (error) throw error;
          return data;
        }
      );
      // Handle result
    } else if (mode === 'edit' && student) {
      const changes = Object.entries(studentData).reduce((acc, [key, value]) => {
        if (student[key as keyof Student] !== value) {
          acc[key] = `${student[key as keyof Student]} -> ${value}`;
        }
        return acc;
      }, {} as Record<string, string>);

      await logCrudAction(
        logUpdate(
          currentUser.id,
          currentUser.username,
          currentUser.role,
          'student',
          student.id,
          student.name,
          changes
        ),
        () => supabase
          .from('students')
          .update(studentData)
          .eq('id', student.id)
      );
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🗄️ Database Schema

### `activity_logs` Table

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(255) NOT NULL,
  user_role VARCHAR(50),
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  resource_name VARCHAR(255),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  ip_address VARCHAR(45),
  location VARCHAR(255),
  user_agent TEXT,
  duration_ms INTEGER,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### `login_logs` Table

```sql
CREATE TABLE login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  user_role VARCHAR(50),
  login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_name VARCHAR(100),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 📱 API Location Detection

Hệ thống sử dụng các APIs miễn phí để lấy thông tin vị trí:

1. **IP Address**: https://api.ipify.org
2. **Geolocation từ IP**: https://ip-api.com
3. **Reverse Geocoding**: https://nominatim.openstreetmap.org

**Lưu ý**: Các APIs này có giới hạn yêu cầu miễn phí. Nếu cần sử dụng production, hãy cân nhắc:
- MaxMind GeoIP2
- IPStack
- Google Maps API

---

## 🎯 Action Types

| Type | Mô Tả |
|------|-------|
| **LOGIN** | Đăng nhập vào hệ thống |
| **LOGOUT** | Đăng xuất khỏi hệ thống |
| **CREATE** | Tạo mới bản ghi |
| **UPDATE** | Chỉnh sửa bản ghi |
| **DELETE** | Xóa bản ghi |
| **VIEW** | Xem danh sách / chi tiết |
| **EXPORT** | Xuất dữ liệu |
| **IMPORT** | Nhập dữ liệu |
| **ERROR** | Lỗi trong quá trình thực thi |

---

## 💡 Best Practices

1. **Luôn ghi log trước khi thực thi action**: Giúp theo dõi khi nào user cố gắng làm gì
2. **Bao gồm metadata chi tiết**: Dữ liệu thay đổi, file uploaded, etc.
3. **Xử lý lỗi cẩn thận**: Ghi log cả lỗi để có thể debug sau này
4. **Giữ description ngắn gọn nhưng đầy đủ**: Dễ hiểu tại sao hành động được thực hiện

---

## 🔍 Queries Thường Dùng

```typescript
// Lấy logs của user cụ thể
const { data } = await logActivityService.getActivityLogs({
  userId: 'user-id',
  limit: 100
});

// Lấy logs CREATE theo ngày
const { data } = await logActivityService.getActivityLogs({
  actionType: 'CREATE',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z'
});

// Lấy logs lỗi
const { data } = await logActivityService.getActivityLogs({
  actionType: 'ERROR'
});
```

---

## 📊 Monitoring & Analytics

Bạn có thể tạo dashboard từ logs:

```typescript
// Dashboard Statistics
- Tổng hành động theo ngày
- Top users (bản ghi tạo/sửa/xóa nhiều nhất)
- Failed actions rate
- Peak usage hours
- Resource modification trends
- Login patterns
```

---

## ⚠️ Security Considerations

1. **IP Address Privacy**: Không lưu IP đầy đủ nếu GDPR sensitive
2. **User Data Masking**: Có thể mask email/phone trong logs
3. **Retention Policy**: Xóa logs cũ theo chính sách công ty
4. **Access Control**: Chỉ Admin/Manager mới có thể xem logs
5. **Encryption**: Lưu logs trong database có encryption

---

## 📝 Tiếp Theo

- [ ] Thêm RLS policies để bảo mật logs
- [ ] Tạo Audit Report component
- [ ] Export logs thành PDF/Excel
- [ ] Real-time log notifications
- [ ] Log visualization dashboard
- [ ] Compliance reports (GDPR, ISO)

---

**Last Updated**: 2025-01-06
**Version**: 1.0
