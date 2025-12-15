import { useState, useEffect } from 'react';
import { Teacher } from '../hooks/useTeachers';
import '../styles/TeacherDialog.css';

interface TeacherDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  teacher?: Teacher | null;
  onClose: () => void;
  onSave?: (teacher: Omit<Teacher, 'id'>) => void;
}

export const TeacherDialog = ({
  isOpen,
  mode,
  teacher,
  onClose,
  onSave,
}: TeacherDialogProps) => {
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    specialization: '',
    yearsOfExperience: 0,
    hireDate: '',
  });

  useEffect(() => {
    if (teacher) {
      const { id, ...rest } = teacher;
      setFormData(rest);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        department: '',
        specialization: '',
        yearsOfExperience: 0,
        hireDate: '',
      });
    }
  }, [teacher, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value,
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
              ? 'Thêm giáo viên mới'
              : mode === 'view'
              ? 'Xem thông tin giáo viên'
              : 'Chỉnh sửa thông tin giáo viên'}
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
              <label htmlFor="department">Bộ môn *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isViewMode}
                required
              >
                <option value="">-- Chọn bộ môn --</option>
                <option value="Khoa Công Nghệ Thông Tin">Khoa Công Nghệ Thông Tin</option>
                <option value="Khoa Kỹ Thuật">Khoa Kỹ Thuật</option>
                <option value="Khoa Quản Lý">Khoa Quản Lý</option>
                <option value="Khoa Kinh Tế">Khoa Kinh Tế</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="specialization">Chuyên môn *</label>
              <input
                id="specialization"
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yearsOfExperience">Năm kinh nghiệm *</label>
              <input
                id="yearsOfExperience"
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                disabled={isViewMode}
                min="0"
                max="50"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hireDate">Ngày ký hợp đồng *</label>
              <input
                id="hireDate"
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
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
