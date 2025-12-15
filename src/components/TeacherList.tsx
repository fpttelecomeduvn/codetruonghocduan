import { Teacher } from '../hooks/useTeachers';
import '../styles/TeacherList.css';

interface TeacherListProps {
  teachers: Teacher[];
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export const TeacherList = ({
  teachers,
  onView,
  onEdit,
  onDelete,
}: TeacherListProps) => {
  return (
    <div className="teacher-list-container">
      <table className="teacher-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Bộ môn</th>
            <th>Chuyên môn</th>
            <th>Kinh nghiệm</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={9} className="empty-message">
                Chưa có giáo viên nào
              </td>
            </tr>
          ) : (
            teachers.map((teacher, index) => (
              <tr key={teacher.id}>
                <td>{index + 1}</td>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.phone}</td>
                <td>{teacher.address}</td>
                <td>{teacher.department}</td>
                <td>{teacher.specialization}</td>
                <td>
                  <span className={`exp-badge exp-${Math.min(Math.floor(teacher.yearsOfExperience / 5), 3)}`}>
                    {teacher.yearsOfExperience} năm
                  </span>
                </td>
                <td className="action-buttons">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => onView(teacher)}
                    title="Xem thông tin"
                  >
                    👁️
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEdit(teacher)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(teacher)}
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
