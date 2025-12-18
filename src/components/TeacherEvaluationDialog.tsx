import { useEffect, useState } from 'react';
import { TeacherEvaluation } from '../hooks/useTeacherEvaluations';
import { Student } from '../hooks/useStudents';
import { Teacher } from '../hooks/useTeachers';
import { Class } from '../hooks/useClasses';
import '../styles/TeacherEvaluationDialog.css';

interface TeacherEvaluationDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  data?: TeacherEvaluation;
  students?: Student[];
  teachers?: Teacher[];
  classes?: Class[];
  onClose: () => void;
  onSave: (data: Omit<TeacherEvaluation, 'id'>) => void;
}

export const TeacherEvaluationDialog = ({
  isOpen,
  mode,
  data,
  students = [],
  teachers = [],
  classes = [],
  onClose,
  onSave,
}: TeacherEvaluationDialogProps) => {
  const [formData, setFormData] = useState<Omit<TeacherEvaluation, 'id'>>({
    studentId: '',
    studentName: '',
    teacherName: '',
    classCode: '',
    score: 0,
    attitude: 0,
    participation: 0,
    feedback: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        studentId: '',
        studentName: '',
        teacherName: '',
        classCode: '',
        score: 0,
        attitude: 0,
        participation: 0,
        feedback: '',
        date: new Date().toISOString().split('T')[0],
      });
      setStudentSearch('');
    } else if (data) {
      setFormData(data);
    }
  }, [isOpen, mode, data]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.id.includes(studentSearch)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('score') || name.includes('attitude') || name.includes('participation')
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentName.trim() && formData.score >= 0 && formData.score <= 100) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content teacher-eval-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === 'create' ? 'Thêm đánh giá' : 'Chi tiết đánh giá'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chọn Sinh viên</label>
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên (ID hoặc tên)..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              disabled={mode === 'view'}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
            <select
              name="studentId"
              value={formData.studentId}
              onChange={(e) => {
                const student = students.find(s => s.id === e.target.value);
                if (student) {
                  setFormData(prev => ({
                    ...prev,
                    studentId: student.id,
                    studentName: student.name
                  }));
                }
              }}
              disabled={mode === 'view'}
              required
            >
              <option value="">-- Chọn sinh viên --</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.id} - {student.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Chọn Giảng viên</label>
            <select
              name="teacherName"
              value={formData.teacherName}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  teacherName: e.target.value
                }));
              }}
              disabled={mode === 'view'}
              required
            >
              <option value="">-- Chọn giảng viên --</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Chọn Lớp học</label>
            <select
              name="classCode"
              value={formData.classCode}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  classCode: e.target.value
                }));
              }}
              disabled={mode === 'view'}
              required
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.classCode}>
                  {cls.classCode} - {cls.className}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Điểm học tập (0-100)</label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={mode === 'view'}
                required
              />
            </div>
            <div className="form-group">
              <label>Điểm thái độ (0-100)</label>
              <input
                type="number"
                name="attitude"
                value={formData.attitude}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={mode === 'view'}
                required
              />
            </div>
            <div className="form-group">
              <label>Điểm tham gia (0-100)</label>
              <input
                type="number"
                name="participation"
                value={formData.participation}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={mode === 'view'}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Nhận xét</label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              disabled={mode === 'view'}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Ngày đánh giá</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={mode === 'view'}
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {mode === 'view' ? 'Đóng' : 'Huỷ'}
            </button>
            {mode !== 'view' && (
              <button type="submit" className="btn btn-primary">
                {mode === 'create' ? 'Thêm' : 'Cập nhật'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
