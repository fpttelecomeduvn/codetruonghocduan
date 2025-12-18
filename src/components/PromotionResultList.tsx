import { PromotionResult } from '../hooks/usePromotionResults';
import '../styles/PromotionResultList.css';

interface PromotionResultListProps {
  results: PromotionResult[];
}

export const PromotionResultList = ({ results }: PromotionResultListProps) => {
  const passedCount = results.filter((r) => r.finalResult === 'đạt').length;
  const failedCount = results.filter((r) => r.finalResult === 'không đạt').length;

  return (
    <div className="promotion-result-container">
      <div className="result-summary">
        <div className="summary-card passed">
          <h3>Đạt</h3>
          <p className="count">{passedCount}</p>
        </div>
        <div className="summary-card failed">
          <h3>Không đạt</h3>
          <p className="count">{failedCount}</p>
        </div>
        <div className="summary-card total">
          <h3>Tổng cộng</h3>
          <p className="count">{results.length}</p>
        </div>
        <div className="summary-card rate">
          <h3>Tỷ lệ đạt</h3>
          <p className="count">{results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0}%</p>
        </div>
      </div>

      <div className="promotion-result-list">
        <table className="promotion-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Sinh viên</th>
              <th>Điểm GV</th>
              <th>Thái độ</th>
              <th>Tham gia</th>
              <th>GPA</th>
              <th>Tín chỉ</th>
              <th>Trạng thái TN</th>
              <th>Kết quả xét lên lớp</th>
              <th>Lý do</th>
              <th>Ngày xét</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={11} className="empty-message">
                  Chưa có kết quả xét lên lớp nào
                </td>
              </tr>
            ) : (
              results.map((r, idx) => (
                <tr key={`${r.studentId}-${r.evaluationDate}`} className={`result-${r.finalResult === 'đạt' ? 'pass' : 'fail'}`}>
                  <td>{idx + 1}</td>
                  <td className="student-name">{r.studentName}</td>
                  <td className="teacher-score">{r.teacherScore}</td>
                  <td>{r.teacherAttitude}</td>
                  <td>{r.teacherParticipation}</td>
                  <td className="gpa">{r.graduationGPA.toFixed(2)}</td>
                  <td>{r.graduationCredits}</td>
                  <td className="graduation-status">
                    <span className={`status-badge ${r.graduationStatus}`}>
                      {r.graduationStatus === 'passed'
                        ? '✓ Đạt'
                        : r.graduationStatus === 'failed'
                        ? '✗ Không đạt'
                        : '⧗ Chờ xét'}
                    </span>
                  </td>
                  <td className={`final-result ${r.finalResult === 'đạt' ? 'passed' : 'failed'}`}>
                    <strong>{r.finalResult.toUpperCase()}</strong>
                  </td>
                  <td className="reason">{r.reason}</td>
                  <td>{r.evaluationDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
