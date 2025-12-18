import { GraduationEvaluation } from '../hooks/useGraduationEvaluations';
import '../styles/GraduationEvaluationList.css';

interface GraduationEvaluationListProps {
  evaluations: GraduationEvaluation[];
  onView: (evaluation: GraduationEvaluation) => void;
  onEdit: (evaluation: GraduationEvaluation) => void;
  onDelete: (evaluation: GraduationEvaluation) => void;
}

export const GraduationEvaluationList = ({
  evaluations,
  onView,
  onEdit,
  onDelete,
}: GraduationEvaluationListProps) => {
  const getAvgScore = (e: GraduationEvaluation) => {
    return Math.round(((e.thesisScore + e.finalExamScore) / 2) * 10) / 10;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      passed: '✓ Đạt',
      failed: '✗ Không đạt',
      pending: '⧗ Chờ xét',
    };
    return badges[status] || status;
  };

  return (
    <div className="grad-eval-list-container">
      <table className="grad-eval-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Sinh viên</th>
            <th>GPA</th>
            <th>Tín chỉ</th>
            <th>Khóa luận</th>
            <th>Thi cuối</th>
            <th>Điểm TB</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.length === 0 ? (
            <tr>
              <td colSpan={10} className="empty-message">
                Chưa có đánh giá tốt nghiệp nào
              </td>
            </tr>
          ) : (
            evaluations.map((e, idx) => (
              <tr key={e.id}>
                <td>{idx + 1}</td>
                <td>{e.studentName}</td>
                <td>{e.gpa.toFixed(2)}</td>
                <td>
                  {e.totalCredits}/{e.requiredCredits}
                </td>
                <td>{e.thesisScore}</td>
                <td>{e.finalExamScore}</td>
                <td className="avg-score">{getAvgScore(e)}</td>
                <td className={`status ${e.status}`}>
                  {getStatusBadge(e.status)}
                </td>
                <td>{e.evaluationDate}</td>
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
