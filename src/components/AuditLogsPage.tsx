import React, { useState, useEffect } from 'react';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { logActivityService } from '../services/logService';
import '../styles/AuditLogsPage.css';

interface AuditLogsPageProps {
  currentUser?: {
    id: string;
    username: string;
    role: string;
  };
  onAccessDenied?: () => void;
}

const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ currentUser, onAccessDenied }) => {
  const {
    logs,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    setCurrentPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    refetch,
  } = useActivityLogs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState({
    startDate: '',
    endDate: '',
    actionType: '',
    status: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  // Check access - chỉ Admin mới được xem
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'administrator') {
      onAccessDenied?.();
    }
  }, [currentUser, onAccessDenied]);

  // Deny access nếu không phải admin
  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'administrator') {
    return (
      <div className="alp-access-denied">
        <div className="alp-denied-content">
          <h2>🔒 Truy Cập Bị Từ Chối</h2>
          <p>Chỉ quản trị viên có thể xem trang này.</p>
          <p className="alp-denied-role">Vai trò của bạn: <strong>{currentUser?.role || 'Unknown'}</strong></p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string): string => {
    return status === 'success' ? 'alp-status-success' : 'alp-status-failed';
  };

  // Get action type badge color
  const getActionBadgeClass = (actionType: string): string => {
    const actionColors: Record<string, string> = {
      'LOGIN': 'alp-action-login',
      'LOGOUT': 'alp-action-logout',
      'CREATE': 'alp-action-create',
      'UPDATE': 'alp-action-update',
      'DELETE': 'alp-action-delete',
      'VIEW': 'alp-action-view',
      'EXPORT': 'alp-action-export',
      'IMPORT': 'alp-action-import',
      'ERROR': 'alp-action-error',
    };
    return actionColors[actionType] || 'alp-action-default';
  };

  // Handle delete logs
  const handleDeleteLogs = async () => {
    if (!deleteFilters.startDate && !deleteFilters.endDate && !deleteFilters.actionType && !deleteFilters.status) {
      alert('Vui lòng chọn ít nhất một tiêu chí xóa');
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa logs?\n\n` +
      `Từ: ${deleteFilters.startDate || 'Không giới hạn'}\n` +
      `Đến: ${deleteFilters.endDate || 'Không giới hạn'}\n` +
      `Hành động: ${deleteFilters.actionType || 'Tất cả'}\n` +
      `Trạng thái: ${deleteFilters.status || 'Tất cả'}\n\n` +
      `Hành động này không thể hoàn tác!`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { count, error } = await logActivityService.deleteActivityLogs({
        startDate: deleteFilters.startDate || undefined,
        endDate: deleteFilters.endDate || undefined,
        actionType: deleteFilters.actionType || undefined,
        status: deleteFilters.status || undefined,
      });

      if (error) {
        setDeleteResult({
          success: false,
          count: 0,
          message: `Lỗi: ${error.message || 'Không thể xóa logs'}`,
        });
      } else {
        setDeleteResult({
          success: true,
          count: count || 0,
          message: `✅ Đã xóa thành công ${count} bản ghi`,
        });
        setDeleteMode(false);
        setDeleteFilters({ startDate: '', endDate: '', actionType: '', status: '' });
        // Refetch logs
        await refetch();
      }
    } catch (err: any) {
      setDeleteResult({
        success: false,
        count: 0,
        message: `Lỗi: ${err.message || 'Không thể xóa logs'}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Thời Gian', 'Người Dùng', 'Vai Trò', 'Hành Động', 'Tài Nguyên', 'Trạng Thái', 'IP', 'Location'];
    const rows = filteredLogs.map(log => [
      formatTime(log.timestamp),
      log.username,
      log.user_role,
      log.action_type,
      `${log.resource_type || ''} - ${log.resource_name || ''}`,
      log.status,
      log.ip_address || 'N/A',
      log.location || 'N/A',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="alp-page">
      <div className="alp-container">
        {/* Header */}
        <div className="alp-header">
          <div>
            <h1>🔐 Audit Logs (Administrator Only)</h1>
            <p className="alp-subtitle">Quản lý tất cả hoạt động của hệ thống - Chỉ dành cho quản trị viên</p>
            {currentUser && (
              <p className="alp-current-user">
                👤 Đăng nhập với: <strong>{currentUser.username}</strong> ({currentUser.role})
              </p>
            )}
          </div>
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className={`alp-btn-delete-mode ${deleteMode ? 'active' : ''}`}
          >
            🗑️ {deleteMode ? 'Hủy Xóa' : 'Xóa Logs'}
          </button>
        </div>

        {/* Delete Mode Section */}
        {deleteMode && (
          <div className="alp-delete-section">
            <div className="alp-delete-header">
              <h3>⚠️ Xóa Logs</h3>
              <p>Chọn tiêu chí để xóa logs (Hành động này không thể hoàn tác!)</p>
            </div>

            <div className="alp-delete-filters">
              <div className="alp-delete-group">
                <label>Từ Ngày</label>
                <input
                  type="date"
                  value={deleteFilters.startDate}
                  onChange={(e) => setDeleteFilters({ ...deleteFilters, startDate: e.target.value })}
                  className="alp-input"
                />
              </div>

              <div className="alp-delete-group">
                <label>Đến Ngày</label>
                <input
                  type="date"
                  value={deleteFilters.endDate}
                  onChange={(e) => setDeleteFilters({ ...deleteFilters, endDate: e.target.value })}
                  className="alp-input"
                />
              </div>

              <div className="alp-delete-group">
                <label>Loại Hành Động</label>
                <select
                  value={deleteFilters.actionType}
                  onChange={(e) => setDeleteFilters({ ...deleteFilters, actionType: e.target.value })}
                  className="alp-select"
                >
                  <option value="">Tất Cả</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="VIEW">VIEW</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>

              <div className="alp-delete-group">
                <label>Trạng Thái</label>
                <select
                  value={deleteFilters.status}
                  onChange={(e) => setDeleteFilters({ ...deleteFilters, status: e.target.value })}
                  className="alp-select"
                >
                  <option value="">Tất Cả</option>
                  <option value="success">Thành Công</option>
                  <option value="failed">Thất Bại</option>
                </select>
              </div>

              <button
                onClick={handleDeleteLogs}
                disabled={isDeleting}
                className="alp-btn-confirm-delete"
              >
                {isDeleting ? '⏳ Đang xóa...' : '🗑️ Xác Nhận Xóa'}
              </button>
            </div>

            {deleteResult && (
              <div className={`alp-delete-result ${deleteResult.success ? 'success' : 'error'}`}>
                {deleteResult.message}
              </div>
            )}
          </div>
        )}

        {/* Filters Section */}
        <div className="alp-filters-section">
          <div className="alp-filters-row">
            <div className="alp-search-group">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo tên, sự kiện, tài nguyên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="alp-search-input"
              />
            </div>
          </div>

          <div className="alp-filters-row">
            <div className="alp-filter-group">
              <label>Loại Hành Động</label>
              <select
                value={filters.actionType}
                onChange={(e) => handleFilterChange({ actionType: e.target.value })}
                className="alp-select"
              >
                <option value="">Tất Cả</option>
                <option value="LOGIN">Đăng Nhập</option>
                <option value="CREATE">Tạo Mới</option>
                <option value="UPDATE">Chỉnh Sửa</option>
                <option value="DELETE">Xóa</option>
                <option value="VIEW">Xem</option>
                <option value="ERROR">Lỗi</option>
              </select>
            </div>

            <div className="alp-filter-group">
              <label>Trạng Thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')}
                className="alp-select"
              >
                <option value="all">Tất Cả</option>
                <option value="success">Thành Công</option>
                <option value="failed">Thất Bại</option>
              </select>
            </div>

            <div className="alp-filter-group">
              <label>Từ Ngày</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                className="alp-input"
              />
            </div>

            <div className="alp-filter-group">
              <label>Đến Ngày</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                className="alp-input"
              />
            </div>

            <button onClick={handleClearFilters} className="alp-btn-clear">✕ Xóa Bộ Lọc</button>
            <button onClick={handleExportCSV} className="alp-btn-export">📥 Export CSV</button>
          </div>
        </div>

        {/* Stats */}
        <div className="alp-stats">
          <div className="alp-stat-item">
            <span className="alp-stat-label">Tổng Logs:</span>
            <span className="alp-stat-value">{totalCount}</span>
          </div>
          <div className="alp-stat-item">
            <span className="alp-stat-label">Trang:</span>
            <span className="alp-stat-value">
              {currentPage + 1} / {totalPages}
            </span>
          </div>
          <div className="alp-stat-item">
            <span className="alp-stat-label">Kết Quả:</span>
            <span className="alp-stat-value">{filteredLogs.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="alp-table-container">
          {loading ? (
            <div className="alp-loading">⏳ Đang tải...</div>
          ) : error ? (
            <div className="alp-error">❌ Lỗi: {error}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="alp-empty">📭 Không có logs nào</div>
          ) : (
            <table className="alp-table">
              <thead>
                <tr>
                  <th>Thời Gian</th>
                  <th>Người Dùng</th>
                  <th>Hành Động</th>
                  <th>Tài Nguyên</th>
                  <th>Trạng Thái</th>
                  <th>IP / Vị Trí</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className={`alp-row ${expandedLogId === log.id ? 'expanded' : ''}`}>
                      <td className="alp-cell-time">{formatTime(log.timestamp)}</td>
                      <td className="alp-cell-user">
                        <strong>{log.username}</strong>
                        <small>{log.user_role}</small>
                      </td>
                      <td className="alp-cell-action">
                        <span className={`alp-badge ${getActionBadgeClass(log.action_type)}`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="alp-cell-resource">
                        {log.resource_name ? (
                          <>
                            <strong>{log.resource_name}</strong>
                            <small>{log.resource_type}</small>
                          </>
                        ) : (
                          <small>{log.resource_type || '-'}</small>
                        )}
                      </td>
                      <td className="alp-cell-status">
                        <span className={`alp-status-badge ${getStatusBadgeClass(log.status)}`}>
                          {log.status === 'success' ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="alp-cell-location">
                        <small>{log.location || log.ip_address || 'N/A'}</small>
                      </td>
                      <td className="alp-cell-action-btn">
                        <button
                          className="alp-btn-details"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        >
                          {expandedLogId === log.id ? '▼' : '▶'}
                        </button>
                      </td>
                    </tr>

                    {expandedLogId === log.id && (
                      <tr className="alp-details-row">
                        <td colSpan={7}>
                          <div className="alp-details-content">
                            <div className="alp-details-grid">
                              <div className="alp-detail-item">
                                <label>Mô Tả:</label>
                                <p>{log.description}</p>
                              </div>
                              {log.error_message && (
                                <div className="alp-detail-item alp-detail-error">
                                  <label>Lỗi:</label>
                                  <p>{log.error_message}</p>
                                </div>
                              )}
                              <div className="alp-detail-item">
                                <label>IP Address:</label>
                                <p>{log.ip_address || 'Unknown'}</p>
                              </div>
                              <div className="alp-detail-item">
                                <label>Location:</label>
                                <p>{log.location || 'Unknown'}</p>
                              </div>
                              <div className="alp-detail-item">
                                <label>Thời Gian Thực Thi:</label>
                                <p>{log.duration_ms}ms</p>
                              </div>
                              <div className="alp-detail-item">
                                <label>User Agent:</label>
                                <p className="alp-code">{log.user_agent}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="alp-pagination">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="alp-btn-page"
            >
              ◀ Trước
            </button>
            <div className="alp-page-info">
              Trang {currentPage + 1} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="alp-btn-page"
            >
              Sau ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
