import { useEffect, useState } from 'react';
import { GraduationEvaluation } from '../hooks/useGraduationEvaluations';
import { Student } from '../hooks/useStudents';
import '../styles/GraduationEvaluationDialog.css';

interface GraduationEvaluationDialogProps {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit';
  data?: GraduationEvaluation;
  students?: Student[];
  onClose: () => void;
  onSave: (data: Omit<GraduationEvaluation, 'id'>) => void;
}

export const GraduationEvaluationDialog = ({
  isOpen,
  mode,
  data,
  students = [],
  onClose,
  onSave,
}: GraduationEvaluationDialogProps) => {
  const [formData, setFormData] = useState<Omit<GraduationEvaluation, 'id'>>({
    studentId: '',
    studentName: '',
    gpa: 0,
    totalCredits: 0,
    requiredCredits: 120,
    thesisScore: 0,
    finalExamScore: 0,
    status: 'pending',
    evaluationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        studentId: '',
        studentName: '',
        gpa: 0,
        totalCredits: 0,
        requiredCredits: 120,
        thesisScore: 0,
        finalExamScore: 0,
        status: 'pending',
        evaluationDate: new Date().toISOString().split('T')[0],
        notes: '',
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'studentName' || name === 'status' || name === 'notes'
          ? value
          : Number(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentName.trim() && formData.gpa >= 0) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-content grad-eval-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{mode === 'create' ? 'Thêm đánh giá tốt nghiệp' : 'Chi tiết đánh giá tốt nghiệp'}</h2>
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
          <div className="form-row">
            <div className="form-group">
              <label>GPA (0-4.0)</label>
              <input
                type="number"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                min="0"
                max="4"
                step="0.01"
                disabled={mode === 'view'}
                required
              />
            </div>
            <div className="form-group">
              <label>Tín chỉ hoàn thành</label>
              <input
                type="number"
                name="totalCredits"
                value={formData.totalCredits}
                onChange={handleChange}
                min="0"
                disabled={mode === 'view'}
                required
              />
            </div>
            <div className="form-group">
              <label>Tín chỉ yêu cầu</label>
              <input
                type="number"
                name="requiredCredits"
                value={formData.requiredCredits}
                onChange={handleChange}
                min="0"
                disabled={mode === 'view'}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Điểm khóa luận (0-100)</label>
              <input
                type="number"
                name="thesisScore"
                value={formData.thesisScore}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={mode === 'view'}
                required
              />
            </div>
            <div className="form-group">
              <label>Điểm thi cuối kỳ (0-100)</label>
              <input
                type="number"
                name="finalExamScore"
                value={formData.finalExamScore}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={mode === 'view'}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={mode === 'view'}
            >
              <option value="pending">Chờ xét</option>
              <option value="passed">Đạt</option>
              <option value="failed">Không đạt</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ngày đánh giá</label>
            <input
              type="date"
              name="evaluationDate"
              value={formData.evaluationDate}
              onChange={handleChange}
              disabled={mode === 'view'}
            />
          </div>
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={mode === 'view'}
              rows={3}
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
