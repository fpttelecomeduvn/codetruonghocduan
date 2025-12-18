import { useState, useEffect } from 'react';
import { Subject } from '../hooks/useSubjects';
import '../styles/SubjectDialog.css';

interface SubjectDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  subject?: Subject | null;
  onClose: () => void;
  onSave?: (subject: Omit<Subject, 'id'>) => void;
}

export const SubjectDialog = ({ isOpen, mode, subject, onClose, onSave }: SubjectDialogProps) => {
  const [formData, setFormData] = useState<Omit<Subject, 'id'>>({
    code: '',
    name: '',
    credits: 3,
    semester: '',
    year: '',
    teacherName: '',
    room: '',
    schedule: '',
    description: '',
  });

  useEffect(() => {
    if (subject) {
      const { id, ...rest } = subject;
      setFormData(rest);
    } else {
      setFormData({
        code: '',
        name: '',
        credits: 3,
        semester: '',
        year: '',
        teacherName: '',
        room: '',
        schedule: '',
        description: '',
      });
    }
  }, [subject, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 0 : value,
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
          <h2>{mode === 'create' ? 'Thêm môn học mới' : mode === 'view' ? 'Xem môn học' : 'Chỉnh sửa môn học'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="code">Mã môn *</label>
              <input id="code" name="code" value={formData.code} onChange={handleChange} disabled={isViewMode} required />
            </div>
            <div className="form-group">
              <label htmlFor="name">Tên môn *</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isViewMode} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="credits">Tín chỉ *</label>
              <input id="credits" name="credits" type="number" value={formData.credits} onChange={handleChange} disabled={isViewMode} min={1} max={10} required />
            </div>
            <div className="form-group">
              <label htmlFor="semester">Học kỳ *</label>
              <select id="semester" name="semester" value={formData.semester} onChange={handleChange} disabled={isViewMode} required>
                <option value="">-- Chọn học kỳ --</option>
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
                <option value="Học kỳ hè">Học kỳ hè</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Năm học *</label>
              <input id="year" name="year" value={formData.year} onChange={handleChange} disabled={isViewMode} placeholder="2024-2025" required />
            </div>
            <div className="form-group">
              <label htmlFor="teacherName">Giảng viên *</label>
              <input id="teacherName" name="teacherName" value={formData.teacherName} onChange={handleChange} disabled={isViewMode} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="room">Phòng</label>
              <input id="room" name="room" value={formData.room} onChange={handleChange} disabled={isViewMode} />
            </div>
            <div className="form-group">
              <label htmlFor="schedule">Lịch</label>
              <input id="schedule" name="schedule" value={formData.schedule} onChange={handleChange} disabled={isViewMode} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} disabled={isViewMode} rows={3} />
          </div>

          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{isViewMode ? 'Đóng' : 'Hủy'}</button>
            {!isViewMode && <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Thêm mới' : 'Cập nhật'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};
