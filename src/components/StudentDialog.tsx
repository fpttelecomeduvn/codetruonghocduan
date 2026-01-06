import { useState, useEffect } from 'react';
import { Student } from '../hooks/useStudents';
import { logCrudAction, logCreate, logUpdate, logDelete } from '../services/logActionService';
import '../styles/StudentDialog.css';

interface StudentDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  student?: Student | null;
  onClose: () => void;
  onSave?: (student: Omit<Student, 'id'>) => void;
  currentUser?: {
    id: string;
    username: string;
    role: string;
  };
}

export const StudentDialog = ({
  isOpen,
  mode,
  student,
  onClose,
  onSave,
  currentUser,
}: StudentDialogProps) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    major: '',
    gpa: 0,
    enrollmentDate: '',
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      const { id, ...rest } = student;
      setFormData(rest);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        major: '',
        gpa: 0,
        enrollmentDate: '',
        status: 'active',
      });
    }
  }, [student, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'gpa' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || !currentUser) return;

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        // Log CREATE action
        await logCrudAction(
          logCreate(
            currentUser.id,
            currentUser.username,
            currentUser.role,
            'student',
            formData.name,
            { gpa: formData.gpa, major: formData.major, status: formData.status }
          ),
          async () => {
            onSave(formData);
            return { success: true };
          }
        );
      } else if (mode === 'edit' && student) {
        // Calculate changes for logging
        const changes: Record<string, string> = {};
        Object.entries(formData).forEach(([key, value]) => {
          const oldValue = student[key as keyof Student];
          if (oldValue !== value) {
            changes[key] = `${oldValue} → ${value}`;
          }
        });

        // Log UPDATE action
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
          async () => {
            onSave(formData);
            return { success: true };
          }
        );
      }
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Lỗi khi lưu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>
            {mode === 'create'
              ? 'Thêm sinh viên mới'
              : mode === 'view'
              ? 'Xem thông tin sinh viên'
              : 'Chỉnh sửa thông tin sinh viên'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isViewMode}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isViewMode}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="major">Chuyên ngành *</label>
              <select
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                disabled={isViewMode}
                required
              >
                <option value="">-- Chọn chuyên ngành --</option>
                <option value="Khoa học máy tính">Khoa học máy tính</option>
                <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                <option value="An ninh mạng">An ninh mạng</option>
                <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="gpa">GPA *</label>
              <input
                id="gpa"
                type="number"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                disabled={isViewMode}
                min="0"
                max="4"
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="enrollmentDate">Ngày nhập học *</label>
              <input
                id="enrollmentDate"
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Trạng thái *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
                required
              >
                <option value="active">Đang học</option>
                <option value="graduated">Tốt nghiệp</option>
                <option value="dropped_out">Bỏ học</option>
                <option value="suspended">Tạm dừng</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isViewMode ? 'Đóng' : 'Hủy'}
            </button>
            {!isViewMode && (
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? '⏳ Đang lưu...' : mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
