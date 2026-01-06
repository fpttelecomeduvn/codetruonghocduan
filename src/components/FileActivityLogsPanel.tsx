import React, { useState, useCallback } from 'react';
import {
  fileLogService,
  fileLoginLogService,
  downloadLogs,
} from '../services/fileLogService';
import { useFileActivityLogs, useFileLoginLogs, useFileLogStats } from '../hooks/useFileActivityLogs';
import '../styles/FileActivityLogsPanel.css';

/**
 * FILE-BASED ACTIVITY LOGS PANEL
 * 
 * Features:
 * ✅ View all activity logs with filtering
 * ✅ View login/logout history
 * ✅ Export logs to JSON/CSV/TXT
 * ✅ Download logs as files
 * ✅ Real-time statistics
 * ✅ Clear logs (admin only)
 */

interface Props {
  currentUserId?: string;
  currentUserRole?: string;
}

type TabType = 'activities' | 'logins' | 'statistics';

export const FileActivityLogsPanel: React.FC<Props> = ({
  currentUserRole = 'user',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Activity Logs
  const {
    logs: activityLogs,
    loading: activityLoading,
    totalCount: activityCount,
    currentPage: activityPage,
    totalPages: activityPages,
    setCurrentPage: setActivityPage,
    filters: activityFilters,
    handleFilterChange: handleActivityFilterChange,
    handleClearFilters: handleActivityClearFilters,
  } = useFileActivityLogs();

  // Login Logs
  const {
    logs: loginLogs,
    loading: loginLoading,
    totalCount: loginCount,
    currentPage: loginPage,
    totalPages: loginPages,
    setCurrentPage: setLoginPage,
    filters: loginFilters,
    handleFilterChange: handleLoginFilterChange,
    handleClearFilters: handleLoginClearFilters,
  } = useFileLoginLogs();

  // Statistics
  const { stats } = useFileLogStats();

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  const handleExportActivityLogsJSON = useCallback(() => {
    const json = fileLogService.exportLogsAsJSON();
    downloadLogs(
      json,
      `activity-logs-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  }, []);

  const handleExportActivityLogsCSV = useCallback(() => {
    const csv = fileLogService.exportLogsAsCSV();
    downloadLogs(
      csv,
      `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv'
    );
  }, []);

  const handleExportActivityLogsTXT = useCallback(() => {
    const txt = fileLogService.exportLogsAsTXT();
    downloadLogs(
      txt,
      `activity-logs-${new Date().toISOString().slice(0, 10)}.txt`,
      'text/plain'
    );
  }, []);

  // ============================================
  // CLEAR LOGS (ADMIN ONLY)
  // ============================================

  const handleClearAllLogs = useCallback(() => {
    if (currentUserRole !== 'admin') {
      alert('Chỉ admin mới có quyền xóa logs');
      return;
    }

    if (window.confirm('Bạn chắc chắn muốn xóa tất cả logs? Hành động này không thể hoàn tác!')) {
      fileLogService.clearActivityLogs();
      fileLoginLogService.clearLoginLogs();
      setShowConfirmClear(false);
      alert('Đã xóa tất cả logs');
      window.location.reload();
    }
  }, [currentUserRole]);

  // ============================================
  // RENDER: ACTIVITIES TAB
  // ============================================

  const renderActivitiesTab = () => (
    <div className="logs-tab-content">
      {/* Filters */}
      <div className="logs-filters">
        <h3>Bộ Lọc</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label>User ID</label>
            <input
              type="text"
              placeholder="Nhập user ID"
              value={activityFilters.userId}
              onChange={(e) =>
                handleActivityFilterChange({ userId: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Loại Hành Động</label>
            <select
              value={activityFilters.actionType}
              onChange={(e) =>
                handleActivityFilterChange({ actionType: e.target.value })
              }
            >
              <option value="">-- Tất Cả --</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="VIEW">VIEW</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Loại Resource</label>
            <input
              type="text"
              placeholder="Nhập loại resource"
              value={activityFilters.resourceType}
              onChange={(e) =>
                handleActivityFilterChange({ resourceType: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Từ Ngày</label>
            <input
              type="date"
              value={activityFilters.startDate}
              onChange={(e) =>
                handleActivityFilterChange({ startDate: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Đến Ngày</label>
            <input
              type="date"
              value={activityFilters.endDate}
              onChange={(e) =>
                handleActivityFilterChange({ endDate: e.target.value })
              }
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleActivityClearFilters}
          >
            Xóa Bộ Lọc
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="logs-export">
        <h3>Xuất Dữ Liệu</h3>
        <div className="export-buttons">
          <button
            className="btn btn-primary"
            onClick={handleExportActivityLogsJSON}
          >
            📥 Xuất JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExportActivityLogsCSV}
          >
            📥 Xuất CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExportActivityLogsTXT}
          >
            📥 Xuất TXT
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table-container">
        <h3>
          Danh Sách Hành Động ({activityCount} tổng cộng)
        </h3>

        {activityLoading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : activityLogs.length === 0 ? (
          <div className="no-data">Không có dữ liệu</div>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Thời Gian</th>
                  <th>User</th>
                  <th>Hành Động</th>
                  <th>Resource</th>
                  <th>Trạng Thái</th>
                  <th>Mô Tả</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="timestamp">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td>
                      <div className="user-info">
                        <span className="username">{log.username}</span>
                        <span className="role">{log.user_role}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`action-badge action-${log.action_type.toLowerCase()}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td>
                      {log.resource_type ? (
                        <div>
                          <div className="resource-type">{log.resource_type}</div>
                          {log.resource_name && (
                            <div className="resource-name">{log.resource_name}</div>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${log.status.toLowerCase()}`}
                      >
                        {log.status === 'success' ? '✓ Thành Công' : '✗ Lỗi'}
                      </span>
                    </td>
                    <td className="description">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {activityPages > 1 && (
              <div className="pagination">
                <button
                  disabled={activityPage === 0}
                  onClick={() => setActivityPage(activityPage - 1)}
                >
                  ← Trước
                </button>
                <span>
                  Trang {activityPage + 1} / {activityPages}
                </span>
                <button
                  disabled={activityPage === activityPages - 1}
                  onClick={() => setActivityPage(activityPage + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER: LOGINS TAB
  // ============================================

  const renderLoginsTab = () => (
    <div className="logs-tab-content">
      {/* Filters */}
      <div className="logs-filters">
        <h3>Bộ Lọc</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label>User ID</label>
            <input
              type="text"
              placeholder="Nhập user ID"
              value={loginFilters.userId}
              onChange={(e) =>
                handleLoginFilterChange({ userId: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Từ Ngày</label>
            <input
              type="date"
              value={loginFilters.startDate}
              onChange={(e) =>
                handleLoginFilterChange({ startDate: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Đến Ngày</label>
            <input
              type="date"
              value={loginFilters.endDate}
              onChange={(e) =>
                handleLoginFilterChange({ endDate: e.target.value })
              }
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleLoginClearFilters}
          >
            Xóa Bộ Lọc
          </button>
        </div>
      </div>

      {/* Logins Table */}
      <div className="logs-table-container">
        <h3>Danh Sách Đăng Nhập ({loginCount} tổng cộng)</h3>

        {loginLoading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : loginLogs.length === 0 ? (
          <div className="no-data">Không có dữ liệu</div>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Thời Gian Đăng Nhập</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Thiết Bị</th>
                  <th>Trạng Thái</th>
                  <th>Thời Lượng (giây)</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.login_time).toLocaleString('vi-VN')}
                    </td>
                    <td>
                      <div className="user-info">
                        <span className="username">{log.username}</span>
                        <span className="role">{log.user_role}</span>
                      </div>
                    </td>
                    <td>{log.email}</td>
                    <td>{log.device_name}</td>
                    <td>
                      <span
                        className={`status-badge status-${log.status.toLowerCase()}`}
                      >
                        {log.status === 'active' ? '🟢 Hoạt Động' : '🔴 Đã Thoát'}
                      </span>
                    </td>
                    <td>
                      {log.session_duration_seconds
                        ? log.session_duration_seconds
                        : 'Đang chạy'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {loginPages > 1 && (
              <div className="pagination">
                <button
                  disabled={loginPage === 0}
                  onClick={() => setLoginPage(loginPage - 1)}
                >
                  ← Trước
                </button>
                <span>
                  Trang {loginPage + 1} / {loginPages}
                </span>
                <button
                  disabled={loginPage === loginPages - 1}
                  onClick={() => setLoginPage(loginPage + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER: STATISTICS TAB
  // ============================================

  const renderStatisticsTab = () => (
    <div className="logs-tab-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalActivities}</div>
          <div className="stat-label">Tổng Hành Động</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.todayActivities}</div>
          <div className="stat-label">Hôm Nay</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.failedActions}</div>
          <div className="stat-label">Lỗi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-label">Người Dùng Hoạt Động</div>
        </div>
      </div>

      {/* Action Statistics */}
      {Object.keys(stats || {}).length > 0 && (
        <div className="action-stats">
          <h3>Thống Kê Theo Loại Hành Động</h3>
          <div className="chart">
            {Object.entries(stats || {})
              .filter(([key]) => key !== 'totalActivities' && key !== 'todayActivities' && key !== 'failedActions' && key !== 'activeUsers')
              .map(([action, count]) => (
                <div key={action} className="chart-bar">
                  <div className="bar-label">{action}</div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {currentUserRole === 'admin' && (
        <div className="admin-actions">
          <h3>Hành Động Quản Trị</h3>
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirmClear(true)}
          >
            🗑️ Xóa Tất Cả Logs
          </button>

          {showConfirmClear && (
            <div className="confirm-dialog">
              <p>⚠️ Bạn chắc chắn muốn xóa tất cả logs?</p>
              <p>Hành động này không thể hoàn tác!</p>
              <div className="confirm-buttons">
                <button
                  className="btn btn-danger"
                  onClick={handleClearAllLogs}
                >
                  Xóa
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="file-activity-logs-panel">
      <div className="panel-header">
        <h2>📋 Quản Lý Logs (Lưu Trữ Cục Bộ)</h2>
        <p className="subtitle">
          Tất cả logs được lưu trữ trên máy client sử dụng localStorage
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          Hành Động ({activityCount})
        </button>
        <button
          className={`tab ${activeTab === 'logins' ? 'active' : ''}`}
          onClick={() => setActiveTab('logins')}
        >
          Đăng Nhập ({loginCount})
        </button>
        <button
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Thống Kê
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'activities' && renderActivitiesTab()}
        {activeTab === 'logins' && renderLoginsTab()}
        {activeTab === 'statistics' && renderStatisticsTab()}
      </div>
    </div>
  );
};

export default FileActivityLogsPanel;
