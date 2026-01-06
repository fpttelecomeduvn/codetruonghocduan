import { useState, useEffect, useCallback } from 'react';
import { ActivityLog, LoginLog, LogStats, logActivityService, loginLogService } from '../services/logService';

// ============================================
// HOOK: useActivityLogs
// ============================================

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  // Filters state
  const [filters, setFilters] = useState({
    userId: '',
    actionType: '',
    resourceType: '',
    startDate: '',
    endDate: '',
  });

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count, error: err } = await logActivityService.getActivityLogs({
        userId: filters.userId || undefined,
        actionType: filters.actionType || undefined,
        resourceType: filters.resourceType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: pageSize,
        offset: currentPage * pageSize,
      });

      if (err) {
        setError(err);
      } else {
        setLogs(data);
        setTotalCount(count);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  // Auto fetch khi filters thay đổi
  useEffect(() => {
    setCurrentPage(0);
    fetchLogs();
  }, [filters]);

  // Fetch khi currentPage thay đổi
  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      actionType: '',
      resourceType: '',
      startDate: '',
      endDate: '',
    });
  };

  return {
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
    refetch: fetchLogs,
  };
};

// ============================================
// HOOK: useLoginLogs
// ============================================

export const useLoginLogs = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count, error: err } = await loginLogService.getLoginLogs({
        userId: filters.userId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: pageSize,
        offset: currentPage * pageSize,
      });

      if (err) {
        setError(err);
      } else {
        setLogs(data);
        setTotalCount(count);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
    fetchLogs();
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      startDate: '',
      endDate: '',
    });
  };

  return {
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
    refetch: fetchLogs,
  };
};

// ============================================
// HOOK: useLogStats
// ============================================

export const useLogStats = () => {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await logActivityService.getLogStats();
      if (err) {
        setError(err);
      } else {
        setStats(data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh stats mỗi 30 giây
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// ============================================
// HOOK: useMyActivityLogs
// ============================================

export const useMyActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await logActivityService.getMyActivityLogs({
        limit: pageSize,
        offset: currentPage * pageSize,
      });

      if (err) {
        setError(err);
      } else {
        setLogs(data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  return {
    logs,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    refetch: fetchLogs,
  };
};
