import React, { useState, useEffect } from 'react';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { simpleLogActivityService } from '../services/logService_simple';
import '../styles/AuditLogsPage.css';

interface AuditLogsPageProps {
  currentUser?: { id: string; username: string; role: string };
  onAccessDenied?: () => void;
}

const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ currentUser, onAccessDenied }) => {
  const { logs, loading, error, totalCount, currentPage, pageSize, setCurrentPage, filters, handleFilterChange, handleClearFilters, refetch } = useActivityLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState({ startDate: '', endDate: '', actionType: '', status: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'administrator') {
      onAccessDenied?.();
    }
  }, [currentUser, onAccessDenied]);

  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'administrator') {
    return (
      <div className="alp-access-denied">
        <div className="alp-denied-content">
          <h2>🔒 Truy Cập Bị Từ Chối</h2>
          <p>Chỉ quản trị viên có thể xem trang này.</p>
          <p className="alp-denied-role">Vai trò: <strong>{currentUser?.role}</strong></p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatTime = (timestamp: string): string => new Date(timestamp).toLocaleString('vi-VN');

  const getStatusBadgeClass = (status: string): string => status === 'success' ? 'alp-status-success' : 'alp-status-failed';

  const getActionBadgeClass = (actionType: string): string => {
    const colors: Record<string, string> = {
      'CREATE': 'alp-action-create',
      'UPDATE': 'alp-action-update',
      'DELETE': 'alp-action-delete',
      'ERROR': 'alp-action-error',
    };
    return colors[actionType] || 'alp-action-default';
  };

  const handleDeleteLogs = async () => {
    if (!deleteFilters.startDate && !deleteFilters.endDate && !deleteFilters.actionType && !deleteFilters.status) {
      alert('Chọn ít nhất một tiêu chí');
      return;
    }

    if (!window.confirm('Xác nhận xóa logs?\nHành động này không thể hoàn tác!')) return;

    setIsDeleting(true);
    try {
      const { count, error } = await simpleLogActivityService.deleteActivityLogs({
        startDate: deleteFilters.startDate || undefined,
        endDate: deleteFilters.endDate || undefined,
        actionType: deleteFilters.actionType || undefined,
        status: deleteFilters.status || undefined,
      });

      if (error) {
        setDeleteResult({ success: false, count: 0, message: `❌ Lỗi` });
      } else {
        setDeleteResult({ success: true, count: count || 0, message: `✅ Đã xóa ${count} bản ghi` });
        setDeleteMode(false);
        setDeleteFilters({ startDate: '', endDate: '', actionType: '', status: '' });
        await refetch();
      }
    } catch (err: any) {
      setDeleteResult({ success: false, count: 0, message: `❌ Lỗi` });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Thời Gian', 'Người Dùng', 'Hành Động', 'Tài Nguyên', 'Trạng Thái'];
    const rows = filteredLogs.map(log => [formatTime(log.timestamp), log.username, log.action_type, log.resource_name || '', log.status]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="alp-page">
      <div className="alp-container">
        <div className="alp-header">
          <div>
            <h1>🔐 Audit Logs</h1>
            <p className="alp-subtitle">Quản lý hoạt động hệ thống</p>
            {currentUser && <p className="alp-current-user">👤 {currentUser.username} ({currentUser.role})</p>}
          </div>
          <button onClick={() => setDeleteMode(!deleteMode)} className={`alp-btn-delete-mode ${deleteMode ? 'active' : ''}`}>
            🗑️ {deleteMode ? 'Hủy' : 'Xóa'}
          </button>
        </div>

        {deleteMode && (
          <div className="alp-delete-section">
            <h3>⚠️ Xóa Logs</h3>
            <div className="alp-delete-filters">
              <input type="date" value={deleteFilters.startDate} onChange={(e) => setDeleteFilters({ ...deleteFilters, startDate: e.target.value })} placeholder="Từ ngày" className="alp-input" />
              <input type="date" value={deleteFilters.endDate} onChange={(e) => setDeleteFilters({ ...deleteFilters, endDate: e.target.value })} placeholder="Đến ngày" className="alp-input" />
              <select value={deleteFilters.actionType} onChange={(e) => setDeleteFilters({ ...deleteFilters, actionType: e.target.value })} className="alp-select">
                <option value="">Tất cả hành động</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
              <button onClick={handleDeleteLogs} disabled={isDeleting} className="alp-btn-confirm-delete">
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
            {deleteResult && <div className={`alp-delete-result ${deleteResult.success ? 'success' : 'error'}`}>{deleteResult.message}</div>}
          </div>
        )}

        <div className="alp-filters-section">
          <input type="text" placeholder="🔍 Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="alp-search-input" />
          <select value={filters.actionType} onChange={(e) => handleFilterChange({ actionType: e.target.value })} className="alp-select">
            <option value="">Tất cả hành động</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')} className="alp-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
          </select>
          <button onClick={handleClearFilters} className="alp-btn-clear">✕ Xóa bộ lọc</button>
          <button onClick={handleExportCSV} className="alp-btn-export">📥 Export CSV</button>
        </div>

        <div className="alp-stats">
          <div className="alp-stat-item"><span>Tổng: {totalCount}</span></div>
          <div className="alp-stat-item"><span>Trang: {currentPage + 1}/{totalPages}</span></div>
          <div className="alp-stat-item"><span>Kết quả: {filteredLogs.length}</span></div>
        </div>

        <div className="alp-table-container">
          {loading && <div className="alp-loading">⏳ Đang tải...</div>}
          {error && <div className="alp-error">❌ Lỗi: {error}</div>}
          {!loading && !error && filteredLogs.length === 0 && <div className="alp-empty">📭 Không có dữ liệu</div>}
          {!loading && !error && filteredLogs.length > 0 && (
            <table className="alp-table">
              <thead>
                <tr><th>Thời Gian</th><th>Người Dùng</th><th>Hành Động</th><th>Tài Nguyên</th><th>Trạng Thái</th><th></th></tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className={expandedLogId === log.id ? 'expanded' : ''}>
                      <td>{formatTime(log.timestamp)}</td>
                      <td><strong>{log.username}</strong><br /><small>{log.user_role}</small></td>
                      <td><span className={`alp-badge ${getActionBadgeClass(log.action_type)}`}>{log.action_type}</span></td>
                      <td>{log.resource_name || log.resource_type || '-'}</td>
                      <td><span className={`alp-status-badge ${getStatusBadgeClass(log.status)}`}>{log.status === 'success' ? '✓' : '✗'}</span></td>
                      <td><button className="alp-btn-details" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>{expandedLogId === log.id ? '▼' : '▶'}</button></td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr className="alp-details-row">
                        <td colSpan={6}>
                          <div className="alp-details-content">
                            <p><strong>Mô tả:</strong> {log.description}</p>
                            {log.error_message && <p><strong style={{ color: 'red' }}>Lỗi:</strong> {log.error_message}</p>}
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

        {totalPages > 1 && (
          <div className="alp-pagination">
            <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="alp-btn-page">◀ Trước</button>
            <div className="alp-page-info">{currentPage + 1} / {totalPages}</div>
            <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1} className="alp-btn-page">Sau ▶</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
