import { Class } from '../hooks/useClasses';
import '../styles/ClassList.css';

interface ClassListProps {
  classes: Class[];
  onView: (classData: Class) => void;
  onEdit: (classData: Class) => void;
  onDelete: (classData: Class) => void;
}

export const ClassList = ({
  classes,
  onView,
  onEdit,
  onDelete,
}: ClassListProps) => {
  const getCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="class-list-container">
      <table className="class-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên lớp</th>
            <th>Mã lớp</th>
            <th>Chuyên ngành</th>
            <th>Phòng</th>
            <th>Giáo viên</th>
            <th>Học kỳ</th>
            <th>Sĩ số</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {classes.length === 0 ? (
            <tr>
              <td colSpan={9} className="empty-message">
                Chưa có lớp học nào
              </td>
            </tr>
          ) : (
            classes.map((classData, index) => {
              const percentage = getCapacityPercentage(
                classData.currentStudents,
                classData.maxStudents
              );
              return (
                <tr key={classData.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{classData.className}</strong>
                  </td>
                  <td>
                    <span className="class-code">{classData.classCode}</span>
                  </td>
                  <td>{classData.major}</td>
                  <td>{classData.room}</td>
                  <td>{classData.teacherName}</td>
                  <td>{classData.semester}</td>
                  <td>
                    <div className="capacity-info">
                      <div className="capacity-bar">
                        <div
                          className={`capacity-fill capacity-${
                            percentage <= 50
                              ? 'low'
                              : percentage <= 80
                              ? 'medium'
                              : 'high'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="capacity-text">
                        {classData.currentStudents}/{classData.maxStudents}
                      </span>
                    </div>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => onView(classData)}
                      title="Xem thông tin"
                    >
                      👁️
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => onEdit(classData)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(classData)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
