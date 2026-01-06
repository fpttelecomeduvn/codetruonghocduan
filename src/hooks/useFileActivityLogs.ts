import { useState, useCallback, useEffect } from 'react';
import { 
  fileLogService, 
  fileLoginLogService, 
  ActivityLogEntry, 
  LoginLogEntry 
} from '../services/fileLogService';

// ============================================
// HOOK: useFileActivityLogs
// ============================================

export const useFileActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const [filters, setFilters] = useState({
    userId: '',
    actionType: '',
    resourceType: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(() => {
    setLoading(true);
    try {
      const { data, count } = fileLogService.getActivityLogs({
        userId: filters.userId || undefined,
        actionType: filters.actionType || undefined,
        resourceType: filters.resourceType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: (currentPage + 1) * pageSize,
      });

      setLogs(data.slice(currentPage * pageSize));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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

  const getTotalCount = () => {
    const { data } = fileLogService.getActivityLogs({
      userId: filters.userId || undefined,
      actionType: filters.actionType || undefined,
      resourceType: filters.resourceType || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
    return data.length;
  };

  const totalCount = getTotalCount();
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    logs,
    loading,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    refetch: fetchLogs,
  };
};

// ============================================
// HOOK: useFileLoginLogs
// ============================================

export const useFileLoginLogs = () => {
  const [logs, setLogs] = useState<LoginLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(() => {
    setLoading(true);
    try {
      const { data } = fileLoginLogService.getLoginLogs({
        userId: filters.userId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: (currentPage + 1) * pageSize,
      });

      setLogs(data.slice(currentPage * pageSize));
    } catch (error) {
      console.error('Error fetching login logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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

  const getTotalCount = () => {
    const { data } = fileLoginLogService.getLoginLogs({
      userId: filters.userId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
    return data.length;
  };

  const totalCount = getTotalCount();
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    logs,
    loading,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    refetch: fetchLogs,
  };
};

// ============================================
// HOOK: useFileLogStats
// ============================================

export const useFileLogStats = () => {
  const [stats, setStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    failedActions: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(() => {
    setLoading(true);
    try {
      const activityStats = fileLogService.getStats();
      const loginLogs = fileLoginLogService.getAllLoginLogs();
      const activeUsers = new Set(
        loginLogs
          .filter(log => log.status === 'active')
          .map(log => log.user_id)
      ).size;

      setStats({
        totalActivities: activityStats.totalActivities,
        todayActivities: activityStats.todayActivities,
        failedActions: activityStats.failedActions,
        activeUsers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};
