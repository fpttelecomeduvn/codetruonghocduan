import { useState } from 'react';
import { useUsers, User } from '../hooks/useUsers';
import { UserRole } from '../hooks/useAuth';
import '../styles/AdminPanel.css';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'teacher' as UserRole,
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username.trim() && formData.password.trim() && formData.name.trim()) {
      addUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'teacher',
      });
      setShowAddForm(false);
    }
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && formData.username.trim() && formData.name.trim()) {
      updateUser(selectedUser.id, {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      setSelectedUser(null);
      setEditMode(false);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'teacher',
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      deleteUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setEditMode(false);
      }
    }
  };

  const openEditForm = (user: User) => {
    setSelectedUser(user);
    setEditMode(true);
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>⚙️ Bảng Quản Lý Tài Khoản</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-content">
          <div className="users-list">
            <div className="list-header">
              <h3>Danh Sách Người Dùng ({users.length})</h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditMode(false);
                  setSelectedUser(null);
                }}
              >
                {showAddForm ? 'Huỷ' : '➕ Thêm Người Dùng'}
              </button>
            </div>

            {users.length === 0 ? (
              <div className="no-users">Chưa có người dùng nào (ngoài admin)</div>
            ) : (
              <div className="users-table">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`user-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (!editMode) {
                        setSelectedUser(selectedUser?.id === user.id ? null : user);
                      }
                    }}
                  >
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-username">@{user.username}</div>
                      <div className="user-role">
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'teacher' ? '👨‍🏫 Giáo Viên' : '👁️ Người Xem'}
                        </span>
                      </div>
                    </div>
                    {selectedUser?.id === user.id && !editMode && (
                      <div className="user-actions">
                        <button className="btn btn-sm btn-warning" onClick={() => openEditForm(user)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user.id)}>
                          🗑️ Xóa
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(showAddForm || editMode) && (
            <div className="form-section">
              <h3>{editMode ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}</h3>
              <form onSubmit={editMode ? handleEditUser : handleAddUser}>
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tên đầy đủ</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên đầy đủ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label>Quyền</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="teacher">👨‍🏫 Giáo Viên</option>
                    <option value="viewer">👁️ Người Xem</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Cập Nhật' : 'Thêm'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditMode(false);
                      setSelectedUser(null);
                    }}
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="permissions-info">
          <h4>📋 Quyền Hạn Theo Vai Trò</h4>
          <div className="permission-box">
            <strong>👨‍🏫 Giáo Viên:</strong>
            <ul>
              <li>✓ Thêm sinh viên mới</li>
              <li>✓ Chỉnh sửa thông tin sinh viên</li>
              <li>✓ Xem danh sách sinh viên</li>
              <li>✓ Thêm/sửa đánh giá</li>
            </ul>
          </div>
          <div className="permission-box">
            <strong>👁️ Người Xem:</strong>
            <ul>
              <li>✓ Xem danh sách sinh viên</li>
              <li>✓ Xem danh sách giáo viên</li>
              <li>✓ Xem danh sách lớp</li>
              <li>✓ Xem danh sách môn học</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
