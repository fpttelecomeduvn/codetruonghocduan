import { TeacherEvaluation } from '../hooks/useTeacherEvaluations';
import '../styles/TeacherEvaluationList.css';

interface TeacherEvaluationListProps {
  evaluations: TeacherEvaluation[];
  onView: (evaluation: TeacherEvaluation) => void;
  onEdit: (evaluation: TeacherEvaluation) => void;
  onDelete: (evaluation: TeacherEvaluation) => void;
}

export const TeacherEvaluationList = ({
  evaluations,
  onView,
  onEdit,
  onDelete,
}: TeacherEvaluationListProps) => {
  const getAverageScore = (e: TeacherEvaluation) => {
    return Math.round(((e.score + e.attitude + e.participation) / 3) * 10) / 10;
  };

  return (
    <div className="teacher-eval-list-container">
      <table className="teacher-eval-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Sinh viên</th>
            <th>Giảng viên</th>
            <th>Lớp</th>
            <th>Học tập</th>
            <th>Thái độ</th>
            <th>Tham gia</th>
            <th>Điểm trung bình</th>
            <th>Ngày</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.length === 0 ? (
            <tr>
              <td colSpan={10} className="empty-message">
                Chưa có đánh giá nào
              </td>
            </tr>
          ) : (
            evaluations.map((e, idx) => (
              <tr key={e.id}>
                <td>{idx + 1}</td>
                <td>{e.studentName}</td>
                <td>{e.teacherName}</td>
                <td>{e.classCode}</td>
                <td>{e.score}</td>
                <td>{e.attitude}</td>
                <td>{e.participation}</td>
                <td className="average-score">{getAverageScore(e)}</td>
                <td>{e.date}</td>
                <td className="action-buttons">
                  <button className="btn btn-sm btn-info" onClick={() => onView(e)}>
                    👁️
                  </button>
                  <button className="btn btn-sm btn-warning" onClick={() => onEdit(e)}>
                    ✏️
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(e)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
