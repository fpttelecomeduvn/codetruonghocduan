import { useState, useEffect, useCallback } from 'react';
import { simpleLogActivityService, SimpleActivityLog } from '../services/logService_simple';

export const useSimpleActivityLogs = () => {
  const [logs, setLogs] = useState<SimpleActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const [filters, setFilters] = useState({
    userId: '',
    actionType: '',
    resourceType: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count, error: err } = await simpleLogActivityService.getActivityLogs({
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
        setLogs(data || []);
        setTotalCount(count || 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading logs');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setCurrentPage(0);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setCurrentPage(0);
    setFilters({
      userId: '',
      actionType: '',
      resourceType: '',
      startDate: '',
      endDate: '',
    });
  };

  const refetch = async () => {
    await fetchLogs();
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
    refetch,
  };
};
