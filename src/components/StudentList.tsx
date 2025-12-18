import { Student } from '../hooks/useStudents';
import '../styles/StudentList.css';

interface StudentListProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onChangeStatus?: (student: Student, newStatus: string) => void;
}

export const StudentList = ({
  students,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}: StudentListProps) => {
  const getStatusBgColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: '#d4edda',
      graduated: '#cce5ff',
      dropped_out: '#f8d7da',
      suspended: '#fff3cd',
      completed: '#d1ecf1',
    };
    return colors[status] || '#f0f0f0';
  };
  return (
    <div className="student-list-container">
      <table className="student-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Chuyên ngành</th>
            <th>GPA</th>
            <th>Ngày nhập học</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={10} className="empty-message">
                Chưa có sinh viên nào
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.address}</td>
                <td>{student.major}</td>
                <td>
                  <span className={`gpa-badge gpa-${Math.floor(student.gpa)}`}>
                    {student.gpa.toFixed(2)}
                  </span>
                </td>
                <td>{new Date(student.enrollmentDate).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <select
                      value={student.status}
                      onChange={(e) => onChangeStatus?.(student, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: getStatusBgColor(student.status),
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                      title="Nhấp để thay đổi trạng thái"
                    >
                      <option value="active">🟢 Đang học</option>
                      <option value="graduated">🎓 Tốt nghiệp</option>
                      <option value="dropped_out">❌ Bỏ học</option>
                      <option value="suspended">⏸️ Tạm dừng</option>
                      <option value="completed">✅ Hoàn thành</option>
                    </select>
                  </div>
                </td>
                <td className="action-buttons">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => onView(student)}
                    title="Xem thông tin"
                  >
                    👁️
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEdit(student)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(student)}
                    title="Xóa"
                  >
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
