import React, { useState, useEffect } from 'react';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { ActivityLog } from '../services/logService';
import '../styles/LogsManagementPanel.css';

// ============================================
// COMPONENT: LogsManagementPanel
// ============================================

const LogsManagementPanel: React.FC = () => {
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
  } = useActivityLogs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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

  // Format location
  const formatLocation = (ip?: string, location?: string): string => {
    if (location && location !== 'Unknown') {
      return `${location} (${ip || 'N/A'})`;
    }
    return ip || 'Unknown';
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string): string => {
    return status === 'success' ? 'lmp-status-success' : 'lmp-status-failed';
  };

  // Get action type badge color
  const getActionBadgeClass = (actionType: string): string => {
    const actionColors: Record<string, string> = {
      'LOGIN': 'lmp-action-login',
      'LOGOUT': 'lmp-action-logout',
      'CREATE': 'lmp-action-create',
      'UPDATE': 'lmp-action-update',
      'DELETE': 'lmp-action-delete',
      'VIEW': 'lmp-action-view',
      'EXPORT': 'lmp-action-export',
      'IMPORT': 'lmp-action-import',
      'ERROR': 'lmp-action-error',
    };
    return actionColors[actionType] || 'lmp-action-default';
  };

  return (
    <div className="lmp-container">
      <div className="lmp-header">
        <h2>📊 Quản Lý Logs Tác Động</h2>
        <p className="lmp-subtitle">Theo dõi tất cả hoạt động của người dùng trong hệ thống</p>
      </div>

      {/* Search & Filter Section */}
      <div className="lmp-filters-section">
        <div className="lmp-filters-row">
          <div className="lmp-search-group">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên, sự kiện, tài nguyên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lmp-search-input"
            />
          </div>
        </div>

        <div className="lmp-filters-row">
          <div className="lmp-filter-group">
            <label>Loại Hành Động</label>
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange({ actionType: e.target.value })}
              className="lmp-select"
            >
              <option value="">Tất Cả</option>
              <option value="LOGIN">Đăng Nhập</option>
              <option value="LOGOUT">Đăng Xuất</option>
              <option value="CREATE">Tạo Mới</option>
              <option value="UPDATE">Chỉnh Sửa</option>
              <option value="DELETE">Xóa</option>
              <option value="VIEW">Xem</option>
              <option value="EXPORT">Xuất Dữ Liệu</option>
              <option value="IMPORT">Nhập Dữ Liệu</option>
              <option value="ERROR">Lỗi</option>
            </select>
          </div>

          <div className="lmp-filter-group">
            <label>Loại Tài Nguyên</label>
            <select
              value={filters.resourceType}
              onChange={(e) => handleFilterChange({ resourceType: e.target.value })}
              className="lmp-select"
            >
              <option value="">Tất Cả</option>
              <option value="student">Sinh Viên</option>
              <option value="teacher">Giáo Viên</option>
              <option value="class">Lớp Học</option>
              <option value="subject">Môn Học</option>
              <option value="evaluation">Đánh Giá</option>
              <option value="user">Người Dùng</option>
            </select>
          </div>

          <div className="lmp-filter-group">
            <label>Trạng Thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')}
              className="lmp-select"
            >
              <option value="all">Tất Cả</option>
              <option value="success">Thành Công</option>
              <option value="failed">Thất Bại</option>
            </select>
          </div>

          <div className="lmp-filter-group">
            <label>Từ Ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange({ startDate: e.target.value })}
              className="lmp-input"
            />
          </div>

          <div className="lmp-filter-group">
            <label>Đến Ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange({ endDate: e.target.value })}
              className="lmp-input"
            />
          </div>

          <button onClick={handleClearFilters} className="lmp-btn-clear">
            ✕ Xóa Bộ Lọc
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="lmp-stats">
        <div className="lmp-stat-item">
          <span className="lmp-stat-label">Tổng Logs:</span>
          <span className="lmp-stat-value">{totalCount}</span>
        </div>
        <div className="lmp-stat-item">
          <span className="lmp-stat-label">Trang:</span>
          <span className="lmp-stat-value">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
        <div className="lmp-stat-item">
          <span className="lmp-stat-label">Kết Quả:</span>
          <span className="lmp-stat-value">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="lmp-table-container">
        {loading ? (
          <div className="lmp-loading">⏳ Đang tải...</div>
        ) : error ? (
          <div className="lmp-error">❌ Lỗi: {error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="lmp-empty">📭 Không có logs nào phù hợp</div>
        ) : (
          <table className="lmp-table">
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
                  <tr className={`lmp-row ${expandedLogId === log.id ? 'expanded' : ''}`}>
                    <td className="lmp-cell-time">
                      {formatTime(log.timestamp)}
                    </td>
                    <td className="lmp-cell-user">
                      <div className="lmp-user-info">
                        <strong>{log.username}</strong>
                        <small>{log.user_role}</small>
                      </div>
                    </td>
                    <td className="lmp-cell-action">
                      <span className={`lmp-badge ${getActionBadgeClass(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="lmp-cell-resource">
                      <div className="lmp-resource-info">
                        {log.resource_name ? (
                          <>
                            <strong>{log.resource_name}</strong>
                            <small>{log.resource_type}</small>
                          </>
                        ) : (
                          <small>{log.resource_type || '-'}</small>
                        )}
                      </div>
                    </td>
                    <td className="lmp-cell-status">
                      <span className={`lmp-status-badge ${getStatusBadgeClass(log.status)}`}>
                        {log.status === 'success' ? '✓ Thành Công' : '✗ Thất Bại'}
                      </span>
                    </td>
                    <td className="lmp-cell-location">
                      <small>{formatLocation(log.ip_address, log.location)}</small>
                    </td>
                    <td className="lmp-cell-action-btn">
                      <button
                        className="lmp-btn-details"
                        onClick={() =>
                          setExpandedLogId(expandedLogId === log.id ? null : log.id)
                        }
                      >
                        {expandedLogId === log.id ? '▼ Ẩn' : '▶ Chi Tiết'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {expandedLogId === log.id && (
                    <tr className="lmp-details-row">
                      <td colSpan={7}>
                        <div className="lmp-details-content">
                          <div className="lmp-details-grid">
                            <div className="lmp-detail-item">
                              <label>Mô Tả:</label>
                              <p>{log.description}</p>
                            </div>
                            {log.error_message && (
                              <div className="lmp-detail-item lmp-detail-error">
                                <label>Thông Báo Lỗi:</label>
                                <p>{log.error_message}</p>
                              </div>
                            )}
                            <div className="lmp-detail-item">
                              <label>User Agent:</label>
                              <p className="lmp-code">{log.user_agent}</p>
                            </div>
                            <div className="lmp-detail-item">
                              <label>Thời Gian Thực Thi:</label>
                              <p>{log.duration_ms}ms</p>
                            </div>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="lmp-detail-item">
                                <label>Metadata:</label>
                                <pre className="lmp-code">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
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
        <div className="lmp-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="lmp-btn-page"
          >
            ◀ Trước
          </button>

          <div className="lmp-page-info">
            Trang {currentPage + 1} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="lmp-btn-page"
          >
            Sau ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsManagementPanel;
