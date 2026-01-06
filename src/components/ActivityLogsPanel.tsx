import React, { useState } from 'react';
import { useActivityLogs, useLoginLogs, useLogStats } from '../hooks/useActivityLogs';
import { ActivityLog, LoginLog } from '../services/logService';
import '../styles/ActivityLogsPanel.css';

// ============================================
// COMPONENT: ActivityLogsPanel
// ============================================

const ActivityLogsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'logins' | 'stats'>('activities');
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
    handleClearFilters
  } = useActivityLogs();

  const {
    logs: loginLogs,
    loading: loginLoading,
    filters: loginFilters,
    handleFilterChange: handleLoginFilterChange,
    handleClearFilters: handleLoginClearFilters,
    currentPage: loginPage,
    setCurrentPage: setLoginPage,
    totalCount: loginTotal
  } = useLoginLogs();

  const { stats, loading: statsLoading } = useLogStats();

  const totalPages = Math.ceil(totalCount / pageSize);
  const loginTotalPages = Math.ceil(loginTotal / pageSize);

  // ============================================
  // RENDER: Activity Logs Tab
  // ============================================

  const renderActivityLogsTab = () => (
    <div className="alp-tab-content">
      {/* Filters */}
      <div className="alp-filters">
        <div className="alp-filter-row">
          <div className="alp-filter-group">
            <label>Action Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange({ actionType: e.target.value })}
              className="alp-select"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
              <option value="EXPORT">Export</option>
              <option value="IMPORT">Import</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          <div className="alp-filter-group">
            <label>Resource Type</label>
            <select
              value={filters.resourceType}
              onChange={(e) => handleFilterChange({ resourceType: e.target.value })}
              className="alp-select"
            >
              <option value="">All Resources</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="class">Class</option>
              <option value="subject">Subject</option>
              <option value="evaluation">Evaluation</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="alp-filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange({ startDate: e.target.value })}
              className="alp-input"
            />
          </div>

          <div className="alp-filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange({ endDate: e.target.value })}
              className="alp-input"
            />
          </div>

          <button 
            className="alp-btn-clear"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div className="alp-loading">Loading activities...</div>}

      {/* Error State */}
      {error && <div className="alp-error">Error loading activities: {error?.message}</div>}

      {/* Empty State */}
      {!loading && logs.length === 0 && (
        <div className="alp-empty">
          <p>No activities found</p>
        </div>
      )}

      {/* Logs Table */}
      {!loading && logs.length > 0 && (
        <>
          <div className="alp-table-wrapper">
            <table className="alp-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="alp-pagination">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              className="alp-btn-pagination"
            >
              Previous
            </button>
            <span className="alp-pagination-info">
              Page {currentPage + 1} of {totalPages} ({totalCount} total)
            </span>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="alp-btn-pagination"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ============================================
  // RENDER: Login Logs Tab
  // ============================================

  const renderLoginLogsTab = () => (
    <div className="alp-tab-content">
      {/* Filters */}
      <div className="alp-filters">
        <div className="alp-filter-row">
          <div className="alp-filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={loginFilters.startDate}
              onChange={(e) => handleLoginFilterChange({ startDate: e.target.value })}
              className="alp-input"
            />
          </div>

          <div className="alp-filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={loginFilters.endDate}
              onChange={(e) => handleLoginFilterChange({ endDate: e.target.value })}
              className="alp-input"
            />
          </div>

          <button 
            className="alp-btn-clear"
            onClick={handleLoginClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loginLoading && <div className="alp-loading">Loading login logs...</div>}

      {/* Empty State */}
      {!loginLoading && loginLogs.length === 0 && (
        <div className="alp-empty">
          <p>No login logs found</p>
        </div>
      )}

      {/* Logs Table */}
      {!loginLoading && loginLogs.length > 0 && (
        <>
          <div className="alp-table-wrapper">
            <table className="alp-table">
              <thead>
                <tr>
                  <th>Login Time</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Device</th>
                  <th>IP Address</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log) => (
                  <LoginLogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="alp-pagination">
            <button
              disabled={loginPage === 0}
              onClick={() => setLoginPage(Math.max(0, loginPage - 1))}
              className="alp-btn-pagination"
            >
              Previous
            </button>
            <span className="alp-pagination-info">
              Page {loginPage + 1} of {loginTotalPages} ({loginTotal} total)
            </span>
            <button
              disabled={loginPage >= loginTotalPages - 1}
              onClick={() => setLoginPage(loginPage + 1)}
              className="alp-btn-pagination"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ============================================
  // RENDER: Stats Tab
  // ============================================

  const renderStatsTab = () => (
    <div className="alp-tab-content">
      {statsLoading ? (
        <div className="alp-loading">Loading statistics...</div>
      ) : stats ? (
        <div className="alp-stats-grid">
          <div className="alp-stat-card">
            <div className="alp-stat-value">{stats.totalActivities}</div>
            <div className="alp-stat-label">Total Activities</div>
          </div>

          <div className="alp-stat-card">
            <div className="alp-stat-value">{stats.totalLogins}</div>
            <div className="alp-stat-label">Total Logins (Today)</div>
          </div>

          <div className="alp-stat-card">
            <div className="alp-stat-value">{stats.activeUsers}</div>
            <div className="alp-stat-label">Active Users</div>
          </div>

          <div className="alp-stat-card alp-stat-error">
            <div className="alp-stat-value">{stats.failedActions}</div>
            <div className="alp-stat-label">Failed Actions</div>
          </div>
        </div>
      ) : (
        <div className="alp-empty">
          <p>Unable to load statistics</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="activity-logs-panel">
      <div className="alp-header">
        <h2>Activity & Login Logs</h2>
        <p>Monitor all user activities and login history</p>
      </div>

      {/* Tabs */}
      <div className="alp-tabs">
        <button
          className={`alp-tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          📋 Activities
        </button>
        <button
          className={`alp-tab ${activeTab === 'logins' ? 'active' : ''}`}
          onClick={() => setActiveTab('logins')}
        >
          🔐 Login History
        </button>
        <button
          className={`alp-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'activities' && renderActivityLogsTab()}
      {activeTab === 'logins' && renderLoginLogsTab()}
      {activeTab === 'stats' && renderStatsTab()}
    </div>
  );
};

// ============================================
// COMPONENT: LogRow (Activity Log)
// ============================================

const LogRow: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'danger';
      case 'VIEW': return 'primary';
      case 'LOGIN': return 'success';
      case 'LOGOUT': return 'secondary';
      case 'ERROR': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' ? '✓' : '✗';
  };

  return (
    <>
      <tr className={`alp-log-row ${expanded ? 'expanded' : ''}`}>
        <td>{new Date(log.timestamp).toLocaleString()}</td>
        <td>
          <strong>{log.username}</strong>
          <span className="alp-role">{log.user_role}</span>
        </td>
        <td>
          <span className={`alp-badge alp-badge-${getActionColor(log.action_type)}`}>
            {log.action_type}
          </span>
        </td>
        <td>
          {log.resource_type && (
            <>
              <span>{log.resource_type}</span>
              {log.resource_name && <span className="alp-resource-name">{log.resource_name}</span>}
            </>
          )}
        </td>
        <td>
          <span className={`alp-status alp-status-${log.status}`}>
            {getStatusBadge(log.status)} {log.status}
          </span>
        </td>
        <td>
          <button
            className="alp-btn-expand"
            onClick={() => setExpanded(!expanded)}
            title={log.description}
          >
            {expanded ? '▼' : '▶'}
          </button>
        </td>
        <td>
          <code className="alp-ip">{log.ip_address || 'N/A'}</code>
        </td>
      </tr>

      {expanded && (
        <tr className="alp-expanded-row">
          <td colSpan={7}>
            <div className="alp-expanded-content">
              <div className="alp-detail-grid">
                <div className="alp-detail-item">
                  <strong>Description:</strong>
                  <p>{log.description}</p>
                </div>

                {log.error_message && (
                  <div className="alp-detail-item alp-error">
                    <strong>Error:</strong>
                    <p>{log.error_message}</p>
                  </div>
                )}

                <div className="alp-detail-item">
                  <strong>Duration:</strong>
                  <p>{log.duration_ms || 0}ms</p>
                </div>

                <div className="alp-detail-item">
                  <strong>User Agent:</strong>
                  <code>{log.user_agent}</code>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="alp-detail-item">
                    <strong>Additional Data:</strong>
                    <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ============================================
// COMPONENT: LoginLogRow
// ============================================

const LoginLogRow: React.FC<{ log: LoginLog }> = ({ log }) => {
  const calculateDuration = (start: string, end?: string) => {
    if (!end) return 'Active';
    const seconds = Math.floor(
      (new Date(end).getTime() - new Date(start).getTime()) / 1000
    );
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <tr>
      <td>{new Date(log.login_time).toLocaleString()}</td>
      <td><strong>{log.username}</strong></td>
      <td>{log.email}</td>
      <td>
        <span className="alp-role">{log.user_role}</span>
      </td>
      <td>{log.device_name}</td>
      <td>
        <code className="alp-ip">{log.ip_address || 'N/A'}</code>
      </td>
      <td>{calculateDuration(log.login_time, log.logout_time)}</td>
      <td>
        <span className={`alp-status alp-status-${log.status}`}>
          {log.status === 'active' ? '🟢' : '🔴'} {log.status}
        </span>
      </td>
    </tr>
  );
};

export default ActivityLogsPanel;
