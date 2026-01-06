/**
 * FILE-BASED LOGGING SERVICE
 * Lưu logs vào localStorage (browser) + có thể export thành file txt
 * 
 * Không cần Supabase - tất cả lưu trên máy client!
 */

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  user_role: string;
  action_type: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'ERROR';
  resource_type?: string;
  resource_id?: string;
  resource_name?: string;
  description: string;
  status: 'success' | 'failed';
  error_message?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
}

export interface LoginLogEntry {
  id: string;
  user_id: string;
  username: string;
  email: string;
  user_role: string;
  login_time: string;
  logout_time?: string;
  device_name?: string;
  status: 'active' | 'logged_out' | 'session_expired';
  session_duration_seconds?: number;
}

// ============================================
// CONSTANTS
// ============================================

const ACTIVITY_LOGS_KEY = 'app_activity_logs';
const LOGIN_LOGS_KEY = 'app_login_logs';
const MAX_LOGS = 1000; // Keep only last 1000 logs

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get current timestamp
 */
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get device name
 */
const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Windows') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
  return 'Unknown';
};

/**
 * Cleanup old logs - keep only latest N records
 */
const cleanupLogs = (logs: any[], maxCount: number): any[] => {
  if (logs.length > maxCount) {
    return logs.slice(logs.length - maxCount);
  }
  return logs;
};

// ============================================
// ACTIVITY LOGS SERVICE
// ============================================

export const fileLogService = {
  /**
   * Log activity
   */
  logActivity(data: {
    userId: string;
    username: string;
    userRole: string;
    actionType: ActivityLogEntry['action_type'];
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    description: string;
    status?: 'success' | 'failed';
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): ActivityLogEntry {
    try {
      // Get existing logs
      const existingLogs = this.getAllActivityLogs();

      // Create new log entry
      const logEntry: ActivityLogEntry = {
        id: generateId(),
        timestamp: getCurrentTimestamp(),
        user_id: data.userId,
        username: data.username,
        user_role: data.userRole,
        action_type: data.actionType,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        resource_name: data.resourceName,
        description: data.description,
        status: data.status || 'success',
        error_message: data.errorMessage,
        ip_address: 'Local', // Can't get real IP on client
        metadata: data.metadata,
      };

      // Add to logs
      const updatedLogs = [...existingLogs, logEntry];

      // Cleanup old logs
      const cleanedLogs = cleanupLogs(updatedLogs, MAX_LOGS);

      // Save to localStorage
      localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(cleanedLogs));

      // Also log to browser console for debugging
      console.log(`[${data.actionType}] ${data.description}`);

      return logEntry;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  /**
   * Get all activity logs
   */
  getAllActivityLogs(): ActivityLogEntry[] {
    try {
      const logs = localStorage.getItem(ACTIVITY_LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving activity logs:', error);
      return [];
    }
  },

  /**
   * Get activity logs with filters
   */
  getActivityLogs(filters?: {
    userId?: string;
    actionType?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): { data: ActivityLogEntry[]; count: number } {
    try {
      let logs = this.getAllActivityLogs();

      // Apply filters
      if (filters?.userId) {
        logs = logs.filter(log => log.user_id === filters.userId);
      }

      if (filters?.actionType) {
        logs = logs.filter(log => log.action_type === filters.actionType);
      }

      if (filters?.resourceType) {
        logs = logs.filter(log => log.resource_type === filters.resourceType);
      }

      if (filters?.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }

      if (filters?.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }

      // Sort by timestamp (newest first)
      logs = logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply limit
      const limit = filters?.limit || 100;
      const data = logs.slice(0, limit);

      return { data, count: logs.length };
    } catch (error) {
      console.error('Error filtering activity logs:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Get statistics
   */
  getStats(): {
    totalActivities: number;
    todayActivities: number;
    failedActions: number;
    actionsByType: Record<string, number>;
  } {
    try {
      const logs = this.getAllActivityLogs();
      const today = new Date().toDateString();

      const stats = {
        totalActivities: logs.length,
        todayActivities: logs.filter(
          log => new Date(log.timestamp).toDateString() === today
        ).length,
        failedActions: logs.filter(log => log.status === 'failed').length,
        actionsByType: {} as Record<string, number>,
      };

      // Count by action type
      logs.forEach(log => {
        stats.actionsByType[log.action_type] = 
          (stats.actionsByType[log.action_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalActivities: 0,
        todayActivities: 0,
        failedActions: 0,
        actionsByType: {},
      };
    }
  },

  /**
   * Clear all activity logs
   */
  clearActivityLogs(): void {
    try {
      localStorage.removeItem(ACTIVITY_LOGS_KEY);
      console.log('Activity logs cleared');
    } catch (error) {
      console.error('Error clearing activity logs:', error);
    }
  },

  /**
   * Export logs to JSON
   */
  exportLogsAsJSON(): string {
    try {
      const logs = this.getAllActivityLogs();
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error('Error exporting logs:', error);
      return '';
    }
  },

  /**
   * Export logs to CSV
   */
  exportLogsAsCSV(): string {
    try {
      const logs = this.getAllActivityLogs();

      if (logs.length === 0) {
        return 'No logs to export';
      }

      // CSV header
      const headers = [
        'Timestamp',
        'User',
        'Role',
        'Action',
        'Resource',
        'Status',
        'Description',
      ];

      // CSV rows
      const rows = logs.map(log => [
        log.timestamp,
        log.username,
        log.user_role,
        log.action_type,
        log.resource_type || 'N/A',
        log.status,
        log.description,
      ]);

      // Combine
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return '';
    }
  },

  /**
   * Export logs to TXT
   */
  exportLogsAsTXT(): string {
    try {
      const logs = this.getAllActivityLogs();

      if (logs.length === 0) {
        return 'No logs to export';
      }

      const lines: string[] = [
        '========================================',
        'ACTIVITY LOGS REPORT',
        `Generated: ${new Date().toISOString()}`,
        'Total Logs: ' + logs.length,
        '========================================',
        '',
      ];

      logs.forEach((log, index) => {
        lines.push(`[${index + 1}] ${log.timestamp}`);
        lines.push(`    User: ${log.username} (${log.user_role})`);
        lines.push(`    Action: ${log.action_type}`);
        if (log.resource_type) {
          lines.push(`    Resource: ${log.resource_type} - ${log.resource_name || 'N/A'}`);
        }
        lines.push(`    Status: ${log.status}`);
        lines.push(`    Description: ${log.description}`);
        if (log.error_message) {
          lines.push(`    Error: ${log.error_message}`);
        }
        lines.push('');
      });

      return lines.join('\n');
    } catch (error) {
      console.error('Error exporting to TXT:', error);
      return '';
    }
  },
};

// ============================================
// LOGIN LOGS SERVICE
// ============================================

export const fileLoginLogService = {
  /**
   * Log login
   */
  logLogin(data: {
    userId: string;
    username: string;
    email: string;
    userRole: string;
  }): LoginLogEntry {
    try {
      const existingLogs = this.getAllLoginLogs();

      const logEntry: LoginLogEntry = {
        id: generateId(),
        user_id: data.userId,
        username: data.username,
        email: data.email,
        user_role: data.userRole,
        login_time: getCurrentTimestamp(),
        device_name: getDeviceName(),
        status: 'active',
      };

      const updatedLogs = [...existingLogs, logEntry];
      const cleanedLogs = cleanupLogs(updatedLogs, MAX_LOGS);

      localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(cleanedLogs));

      console.log(`[LOGIN] ${data.username} logged in`);

      return logEntry;
    } catch (error) {
      console.error('Error logging login:', error);
      throw error;
    }
  },

  /**
   * Log logout
   */
  logLogout(userId: string): void {
    try {
      const logs = this.getAllLoginLogs();
      const activeSession = logs.find(
        log => log.user_id === userId && log.status === 'active'
      );

      if (activeSession) {
        const now = new Date();
        const loginTime = new Date(activeSession.login_time);
        const duration = Math.round(
          (now.getTime() - loginTime.getTime()) / 1000
        );

        activeSession.logout_time = getCurrentTimestamp();
        activeSession.status = 'logged_out';
        activeSession.session_duration_seconds = duration;

        localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(logs));

        console.log(`[LOGOUT] ${activeSession.username} logged out (${duration}s)`);
      }
    } catch (error) {
      console.error('Error logging logout:', error);
    }
  },

  /**
   * Get all login logs
   */
  getAllLoginLogs(): LoginLogEntry[] {
    try {
      const logs = localStorage.getItem(LOGIN_LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving login logs:', error);
      return [];
    }
  },

  /**
   * Get login logs with filters
   */
  getLoginLogs(filters?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): { data: LoginLogEntry[]; count: number } {
    try {
      let logs = this.getAllLoginLogs();

      if (filters?.userId) {
        logs = logs.filter(log => log.user_id === filters.userId);
      }

      if (filters?.startDate) {
        logs = logs.filter(log => log.login_time >= filters.startDate!);
      }

      if (filters?.endDate) {
        logs = logs.filter(log => log.login_time <= filters.endDate!);
      }

      logs = logs.sort((a, b) =>
        new Date(b.login_time).getTime() - new Date(a.login_time).getTime()
      );

      const limit = filters?.limit || 100;
      const data = logs.slice(0, limit);

      return { data, count: logs.length };
    } catch (error) {
      console.error('Error filtering login logs:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Clear all login logs
   */
  clearLoginLogs(): void {
    try {
      localStorage.removeItem(LOGIN_LOGS_KEY);
      console.log('Login logs cleared');
    } catch (error) {
      console.error('Error clearing login logs:', error);
    }
  },
};

// ============================================
// DOWNLOAD HELPER
// ============================================

export const downloadLogs = (
  content: string,
  filename: string,
  type: 'text/plain' | 'application/json' | 'text/csv' = 'text/plain'
): void => {
  try {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } catch (error) {
    console.error('Error downloading logs:', error);
  }
};
