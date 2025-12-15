import { useState, useEffect } from 'react';
import { Student } from '../hooks/useStudents';
import '../styles/StudentDialog.css';

interface StudentDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  student?: Student | null;
  onClose: () => void;
  onSave?: (student: Omit<Student, 'id'>) => void;
}

export const StudentDialog = ({
  isOpen,
  mode,
  student,
  onClose,
  onSave,
}: StudentDialogProps) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    major: '',
    gpa: 0,
    enrollmentDate: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
      onClose();
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

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              {isViewMode ? 'Đóng' : 'Hủy'}
            </button>
            {!isViewMode && (
              <button type="submit" className="btn btn-primary">
                {mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
