import { useState } from 'react';
import '../styles/LoginPage.css';

interface LoginPageProps {
  onLogin: (username: string, password: string) => { success: boolean; error?: string };
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = onLogin(username, password);
      if (!result.success) {
        setError(result.error || 'Đăng nhập thất bại');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>📚 Hệ Thống Quản Lý Giáo Dục</h1>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="login-demo">
          <p>💡 <strong>Tài khoản Admin mặc định:</strong></p>
          <p>Username: <code>administrator</code></p>
          <p>Password: <code>administratormatkhau</code></p>
        </div>
      </div>
    </div>
  );
};
