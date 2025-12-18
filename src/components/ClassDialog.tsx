import { useState, useEffect } from 'react';
import { Class } from '../hooks/useClasses';
import '../styles/ClassDialog.css';

interface ClassDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  classData?: Class | null;
  onClose: () => void;
  onSave?: (classData: Omit<Class, 'id'>) => void;
}

export const ClassDialog = ({
  isOpen,
  mode,
  classData,
  onClose,
  onSave,
}: ClassDialogProps) => {
  const [formData, setFormData] = useState<Omit<Class, 'id'>>({
    className: '',
    classCode: '',
    major: '',
    semester: '',
    year: '',
    maxStudents: 0,
    currentStudents: 0,
    teacherName: '',
    room: '',
    schedule: '',
    description: '',
  });

  useEffect(() => {
    if (classData) {
      const { id, ...rest } = classData;
      setFormData(rest);
    } else {
      setFormData({
        className: '',
        classCode: '',
        major: '',
        semester: '',
        year: '',
        maxStudents: 0,
        currentStudents: 0,
        teacherName: '',
        room: '',
        schedule: '',
        description: '',
      });
    }
  }, [classData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'maxStudents' || name === 'currentStudents'
          ? parseInt(value) || 0
          : value,
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
              ? 'Thêm lớp học mới'
              : mode === 'view'
              ? 'Xem thông tin lớp học'
              : 'Chỉnh sửa thông tin lớp học'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="className">Tên lớp *</label>
              <input
                id="className"
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="classCode">Mã lớp *</label>
              <input
                id="classCode"
                type="text"
                name="classCode"
                value={formData.classCode}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
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
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="room">Phòng học *</label>
              <input
                id="room"
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="semester">Học kỳ *</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                disabled={isViewMode}
                required
              >
                <option value="">-- Chọn học kỳ --</option>
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
                <option value="Học kỳ hè">Học kỳ hè</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="year">Năm học *</label>
              <input
                id="year"
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="2024-2025"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxStudents">Số lượng tối đa *</label>
              <input
                id="maxStudents"
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                disabled={isViewMode}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentStudents">Số lượng hiện tại *</label>
              <input
                id="currentStudents"
                type="number"
                name="currentStudents"
                value={formData.currentStudents}
                onChange={handleChange}
                disabled={isViewMode}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="teacherName">Giáo viên hướng dẫn *</label>
            <input
              id="teacherName"
              type="text"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleChange}
              disabled={isViewMode}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="schedule">Lịch học *</label>
            <input
              id="schedule"
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="Thứ 2, 4 - 7h - 9h"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isViewMode}
              rows={3}
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
              <button type="submit" className="btn btn-primary btn-class">
                {mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
