import { Student } from '../hooks/useStudents';
import '../styles/StudentList.css';

interface StudentListProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentList = ({
  students,
  onView,
  onEdit,
  onDelete,
}: StudentListProps) => {
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
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={9} className="empty-message">
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
