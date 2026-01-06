# 🔧 Hướng Dẫn Tích Hợp Logging Vào Các Component

## 1️⃣ Chuẩn Bị Cần Thiết

Thêm logging vào các file component hiện tại của bạn theo các bước sau:

---

## 2️⃣ Tích Hợp Vào LoginPage.tsx

```typescript
import { useEffect, useState } from 'react';
import { logLoginAction, logErrorAction, CurrentUser } from '../services/logHelpers';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const user = await response.json();

      // ✅ LOG LOGIN
      const currentUser: CurrentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      logLoginAction(currentUser);

      // Lưu user vào context/state
      setCurrentUser(currentUser);
    } catch (error) {
      // ✅ LOG ERROR
      const errorUser: CurrentUser = {
        id: 'unknown',
        username: email,
        email: email,
        role: 'unknown',
      };
      logErrorAction(
        errorUser,
        'LOGIN',
        'authentication',
        (error as Error).message
      );

      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>
    </div>
  );
}
```

---

## 3️⃣ Tích Hợp Vào StudentList.tsx

```typescript
import { useState, useEffect } from 'react';
import { logViewAction, logDeleteAction, CurrentUser } from '../services/logHelpers';

interface StudentListProps {
  currentUser: CurrentUser;
}

export function StudentList({ currentUser }: StudentListProps) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOG VIEW WHEN COMPONENT LOADS
  useEffect(() => {
    logViewAction(currentUser, 'student');

    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Xóa học sinh ${studentName}?`)) return;

    try {
      await fetch(`/api/students/${studentId}`, { method: 'DELETE' });

      // ✅ LOG DELETE
      logDeleteAction(
        currentUser,
        'student',
        studentId,
        studentName,
        students.find((s: any) => s.id === studentId)
      );

      setStudents(students.filter((s: any) => s.id !== studentId));
    } catch (error) {
      alert('Error deleting student');
    }
  };

  const handleViewStudent = (student: any) => {
    // ✅ LOG VIEW (individual student)
    logViewAction(currentUser, 'student', student.id, student.name);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Danh Sách Học Sinh</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student: any) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>
                <button onClick={() => handleViewStudent(student)}>Xem</button>
                <button onClick={() => handleDeleteStudent(student.id, student.name)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4️⃣ Tích Hợp Vào StudentDialog.tsx

```typescript
import { useState } from 'react';
import {
  logCreateAction,
  logUpdateAction,
  logErrorAction,
  CurrentUser,
} from '../services/logHelpers';

interface StudentDialogProps {
  student?: any;
  isOpen: boolean;
  currentUser: CurrentUser;
  onClose: () => void;
  onSave: (student: any) => void;
}

export function StudentDialog({
  student,
  isOpen,
  currentUser,
  onClose,
  onSave,
}: StudentDialogProps) {
  const [formData, setFormData] = useState(student || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (student?.id) {
        // ===== UPDATE =====
        const response = await fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Update failed');

        const updatedStudent = await response.json();

        // ✅ LOG UPDATE
        logUpdateAction(
          currentUser,
          'student',
          student.id,
          formData.name,
          student,           // old data
          updatedStudent      // new data
        );

        onSave(updatedStudent);
      } else {
        // ===== CREATE =====
        const response = await fetch('/api/students', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Create failed');

        const newStudent = await response.json();

        // ✅ LOG CREATE
        logCreateAction(
          currentUser,
          'student',
          newStudent.id,
          newStudent.name,
          formData
        );

        onSave(newStudent);
      }

      onClose();
    } catch (error) {
      // ✅ LOG ERROR
      logErrorAction(
        currentUser,
        student?.id ? 'UPDATE' : 'CREATE',
        'student',
        (error as Error).message
      );

      alert('Error saving student: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open={isOpen}>
      <div>
        <h2>{student?.id ? 'Sửa' : 'Tạo'} Học Sinh</h2>

        <div>
          <label>Tên</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label>Số Điện Thoại</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button onClick={onClose} disabled={loading}>
            Hủy
          </button>
        </div>
      </div>
    </dialog>
  );
}
```

---

## 5️⃣ Tích Hợp Vào ClassList.tsx

```typescript
import { useState, useEffect } from 'react';
import { logViewAction, logDeleteAction, CurrentUser } from '../services/logHelpers';

interface ClassListProps {
  currentUser: CurrentUser;
}

export function ClassList({ currentUser }: ClassListProps) {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // ✅ LOG VIEW
    logViewAction(currentUser, 'class');

    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const response = await fetch('/api/classes');
    const data = await response.json();
    setClasses(data);
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Xóa lớp ${className}?`)) return;

    await fetch(`/api/classes/${classId}`, { method: 'DELETE' });

    // ✅ LOG DELETE
    logDeleteAction(
      currentUser,
      'class',
      classId,
      className,
      classes.find((c: any) => c.id === classId)
    );

    setClasses(classes.filter((c: any) => c.id !== classId));
  };

  return (
    <div>
      <h2>Danh Sách Lớp Học</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Phòng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls: any) => (
            <tr key={cls.id}>
              <td>{cls.id}</td>
              <td>{cls.name}</td>
              <td>{cls.room}</td>
              <td>
                <button onClick={() => handleDeleteClass(cls.id, cls.name)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 6️⃣ Tích Hợp Vào TeacherEvaluationDialog.tsx

```typescript
import { useState } from 'react';
import {
  logCreateAction,
  logUpdateAction,
  logErrorAction,
  CurrentUser,
} from '../services/logHelpers';

interface TeacherEvaluationDialogProps {
  evaluation?: any;
  isOpen: boolean;
  currentUser: CurrentUser;
  onClose: () => void;
  onSave: (evaluation: any) => void;
}

export function TeacherEvaluationDialog({
  evaluation,
  isOpen,
  currentUser,
  onClose,
  onSave,
}: TeacherEvaluationDialogProps) {
  const [formData, setFormData] = useState(evaluation || {});

  const handleSave = async () => {
    try {
      if (evaluation?.id) {
        // UPDATE
        const response = await fetch(`/api/teacher-evaluations/${evaluation.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });

        const updated = await response.json();

        // ✅ LOG UPDATE
        logUpdateAction(
          currentUser,
          'teacher_evaluation',
          evaluation.id,
          `Đánh giá giáo viên ${formData.teacher_name}`,
          evaluation,
          updated
        );

        onSave(updated);
      } else {
        // CREATE
        const response = await fetch('/api/teacher-evaluations', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        const created = await response.json();

        // ✅ LOG CREATE
        logCreateAction(
          currentUser,
          'teacher_evaluation',
          created.id,
          `Đánh giá giáo viên ${formData.teacher_name}`,
          formData
        );

        onSave(created);
      }

      onClose();
    } catch (error) {
      // ✅ LOG ERROR
      logErrorAction(
        currentUser,
        evaluation?.id ? 'UPDATE' : 'CREATE',
        'teacher_evaluation',
        (error as Error).message
      );
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open={isOpen}>
      <h2>{evaluation?.id ? 'Sửa' : 'Tạo'} Đánh Giá Giáo Viên</h2>
      {/* Form content */}
      <button onClick={handleSave}>Lưu</button>
      <button onClick={onClose}>Hủy</button>
    </dialog>
  );
}
```

---

## 7️⃣ Tích Hợp Vào AdminPanel.tsx

```typescript
import { useState } from 'react';
import FileActivityLogsPanel from './FileActivityLogsPanel';
import { CurrentUser } from '../services/logHelpers';

interface AdminPanelProps {
  currentUser: CurrentUser;
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Tổng Quan
        </button>
        <button
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          Activity Logs
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Cài Đặt
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && <div>Overview content</div>}

        {activeTab === 'logs' && (
          // ✅ ACTIVITY LOGS PANEL
          <FileActivityLogsPanel
            currentUserId={currentUser.id}
            currentUserRole={currentUser.role}
          />
        )}

        {activeTab === 'settings' && <div>Settings content</div>}
      </div>
    </div>
  );
}
```

---

## 📋 Bảng Tóm Tắt

| Component | Action | Code |
|-----------|--------|------|
| LoginPage | Login | `logLoginAction(currentUser)` |
| StudentList | View list | `logViewAction(currentUser, 'student')` |
| StudentList | Delete | `logDeleteAction(currentUser, 'student', id, name, data)` |
| StudentDialog | Create | `logCreateAction(currentUser, 'student', id, name, data)` |
| StudentDialog | Update | `logUpdateAction(currentUser, 'student', id, name, oldData, newData)` |
| StudentDialog | Error | `logErrorAction(currentUser, 'CREATE', 'student', errorMsg)` |
| ClassList | View list | `logViewAction(currentUser, 'class')` |
| TeacherDialog | Create | `logCreateAction(currentUser, 'teacher', id, name, data)` |
| AdminPanel | View logs | `<FileActivityLogsPanel />` |

---

## ✅ Checklist Tích Hợp

- [ ] Thêm import `logCreateAction`, `logUpdateAction`, `logDeleteAction`, `logViewAction` vào components
- [ ] Thêm `CurrentUser` type interface
- [ ] Gọi log function sau khi action thành công
- [ ] Thêm error logging trong try-catch blocks
- [ ] Thêm `FileActivityLogsPanel` vào AdminPanel
- [ ] Test logging bằng cách mở DevTools → Application → LocalStorage
- [ ] Verify logs được lưu với đầy đủ thông tin
- [ ] Test export logs (JSON/CSV/TXT)

---

## 🧪 Test Logging

```typescript
// Mở browser console (F12 → Console)

// 1. Check nếu localStorage được lưu
console.log(localStorage.getItem('app_activity_logs'));

// 2. Parse và xem
const logs = JSON.parse(localStorage.getItem('app_activity_logs') || '[]');
console.table(logs);

// 3. Count logs
console.log('Total logs:', logs.length);

// 4. Filter logs
const createLogs = logs.filter((l: any) => l.action_type === 'CREATE');
console.log('Create logs:', createLogs);
```

---

## 🚀 Kế Tiếp

1. Test tất cả components với logging
2. Verify logs xuất hiện trong FileActivityLogsPanel
3. Test export JSON/CSV/TXT
4. Deploy lên VPS
5. (Optional) Setup Backend API để lưu logs lâu dài trên server
