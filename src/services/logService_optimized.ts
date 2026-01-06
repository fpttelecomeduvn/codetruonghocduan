import { supabase } from './supabaseClient';

// ============================================
// OPTIMIZED TYPES WITH ENUMS
// ============================================

export type ActionType = 
  | 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' 
  | 'VIEW' | 'EXPORT' | 'IMPORT' | 'ERROR' | 'DOWNLOAD';

export type ResourceType = 
  | 'student' | 'teacher' | 'class' | 'subject' 
  | 'evaluation' | 'user' | 'report' | 'file';

export type UserRole = 'admin' | 'teacher' | 'student' | 'viewer';

export type LogStatus = 'success' | 'failed' | 'pending';

export interface OptimizedActivityLog {
  id: string;
  user_id: string;
  username: string;
  user_role: UserRole;
  action_type: ActionType;
  resource_type?: ResourceType;
  resource_id?: string;
  resource_name?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  status: LogStatus;
  error_message?: string;
  timestamp: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface OptimizedLoginLog {
  id: string;
  user_id: string;
  username: string;
  email?: string;
  user_role: UserRole;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  user_agent?: string;
  device_name?: string;
  location?: string;
  status: 'active' | 'logged_out' | 'session_expired';
  session_duration_seconds?: number;
  session_token?: string;
  created_at: string;
}

export interface DailyActivityStats {
  date: string;
  user_role: UserRole;
  action_type: ActionType;
  action_count: number;
  unique_users: number;
  avg_duration_ms: number;
  failed_count: number;
}

export interface UserActivitySummary {
  user_id: string;
  username: string;
  user_role: UserRole;
  total_actions: number;
  active_days: number;
  last_action_time: string;
  failed_actions: number;
  avg_duration_ms: number;
  login_days: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getClientIp = async (): Promise<string> => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};

const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
};

const convertIpToInet = (ip: string): string => {
  // PostgreSQL INET type accepts IP addresses as strings
  return ip;
};

// ============================================
// OPTIMIZED ACTIVITY LOGS SERVICE
// ============================================

export const optimizedLogActivityService = {
  /**
   * Log activity with performance tracking
   */
  async logActivity(data: {
    userId: string;
    username: string;
    userRole: UserRole;
    actionType: ActionType;
    resourceType?: ResourceType;
    resourceId?: string;
    resourceName?: string;
    description: string;
    status?: LogStatus;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<{ error: any; data: any }> {
    try {
      const startTime = performance.now();
      const ipAddress = await getClientIp();
      const endTime = performance.now();

      const { error, data: logData } = await supabase
        .from('activity_logs')
        .insert([
          {
            user_id: data.userId,
            username: data.username,
            user_role: data.userRole,
            action_type: data.actionType,
            resource_type: data.resourceType,
            resource_id: data.resourceId,
            resource_name: data.resourceName,
            description: data.description,
            ip_address: convertIpToInet(ipAddress),
            user_agent: navigator.userAgent,
            status: data.status || 'success',
            error_message: data.errorMessage,
            duration_ms: Math.round(endTime - startTime),
            metadata: data.metadata || {},
            timestamp: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('Error logging activity:', error);
      }

      return { error, data: logData };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { error, data: null };
    }
  },

  /**
   * Batch insert logs for better performance
   */
  async batchLogActivities(
    activities: Array<{
      userId: string;
      username: string;
      userRole: UserRole;
      actionType: ActionType;
      resourceType?: ResourceType;
      resourceId?: string;
      resourceName?: string;
      description: string;
      status?: LogStatus;
      errorMessage?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<{ error: any; count: number }> {
    try {
      const ipAddress = await getClientIp();

      const logsToInsert = activities.map((data) => ({
        user_id: data.userId,
        username: data.username,
        user_role: data.userRole,
        action_type: data.actionType,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        resource_name: data.resourceName,
        description: data.description,
        ip_address: convertIpToInet(ipAddress),
        user_agent: navigator.userAgent,
        status: data.status || 'success',
        error_message: data.errorMessage,
        metadata: data.metadata || {},
        timestamp: new Date().toISOString(),
      }));

      const { error, data } = await supabase
        .from('activity_logs')
        .insert(logsToInsert)
        .select();

      return { error, count: data?.length || 0 };
    } catch (error) {
      console.error('Error batch logging:', error);
      return { error, count: 0 };
    }
  },

  /**
   * Advanced search with filters
   */
  async searchActivityLogs(filters?: {
    userId?: string;
    actionType?: ActionType;
    resourceType?: ResourceType;
    searchText?: string;
    startDate?: string;
    endDate?: string;
    status?: LogStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ data: OptimizedActivityLog[]; count: number; error: any }> {
    try {
      // Use RPC function for advanced search
      const { data, error, count } = await supabase.rpc(
        'search_activity_logs',
        {
          p_user_id: filters?.userId || null,
          p_action_type: filters?.actionType || null,
          p_resource_type: filters?.resourceType || null,
          p_search_text: filters?.searchText || null,
          p_start_date: filters?.startDate || null,
          p_end_date: filters?.endDate || null,
          p_limit: filters?.limit || 100,
          p_offset: filters?.offset || 0,
        }
      );

      return { data: data || [], count: count || 0, error };
    } catch (error) {
      console.error('Error searching logs:', error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Get user activity summary (optimized)
   */
  async getUserActivitySummary(userId: string): Promise<{
    data: any;
    error: any;
  }> {
    try {
      const { data, error } = await supabase.rpc(
        'get_user_activity_summary',
        { user_id_param: userId }
      );

      return { data: data?.[0], error };
    } catch (error) {
      console.error('Error getting user summary:', error);
      return { data: null, error };
    }
  },

  /**
   * Get stats for dashboard
   */
  async getDailyActivityStats(filters?: {
    startDate?: string;
    endDate?: string;
    userRole?: UserRole;
  }): Promise<{ data: DailyActivityStats[]; error: any }> {
    try {
      let query = supabase
        .from('daily_activity_stats')
        .select('*');

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.userRole) {
        query = query.eq('user_role', filters.userRole);
      }

      const { data, error } = await query.order('date', {
        ascending: false,
      });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return { data: [], error };
    }
  },

  /**
   * Get error logs for debugging
   */
  async getErrorLogs(filters?: {
    userId?: string;
    actionType?: ActionType;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ data: OptimizedActivityLog[]; error: any }> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('status', 'failed');

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting error logs:', error);
      return { data: [], error };
    }
  },

  /**
   * Export logs to CSV
   */
  async exportLogsToCSV(filters?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ csv: string; error: any }> {
    try {
      const { data, error } = await this.searchActivityLogs({
        ...filters,
        limit: 10000, // CSV export limit
      });

      if (error || !data.length) {
        return { csv: '', error };
      }

      // Create CSV header
      const headers = [
        'ID',
        'User',
        'Role',
        'Action',
        'Resource',
        'Resource Name',
        'Description',
        'Status',
        'Duration (ms)',
        'Timestamp',
      ];

      // Create CSV rows
      const rows = data.map((log) => [
        log.id,
        log.username,
        log.user_role,
        log.action_type,
        log.resource_type || '',
        log.resource_name || '',
        log.description,
        log.status,
        log.duration_ms || '',
        new Date(log.created_at).toLocaleString(),
      ]);

      // Combine headers and rows
      const csv = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      return { csv, error: null };
    } catch (error) {
      console.error('Error exporting logs:', error);
      return { csv: '', error };
    }
  },
};

// ============================================
// OPTIMIZED LOGIN LOGS SERVICE
// ============================================

export const optimizedLoginLogService = {
  /**
   * Log user login
   */
  async logLogin(data: {
    userId: string;
    username: string;
    email?: string;
    userRole: UserRole;
  }): Promise<{ error: any; data: any }> {
    try {
      const ipAddress = await getClientIp();

      const { error, data: logData } = await supabase
        .from('login_logs')
        .insert([
          {
            user_id: data.userId,
            username: data.username,
            email: data.email,
            user_role: data.userRole,
            ip_address: convertIpToInet(ipAddress),
            user_agent: navigator.userAgent,
            device_name: getDeviceName(),
            login_time: new Date().toISOString(),
            status: 'active',
          },
        ])
        .select();

      return { error, data: logData };
    } catch (error) {
      console.error('Error logging login:', error);
      return { error, data: null };
    }
  },

  /**
   * Log user logout
   */
  async logLogout(userId: string): Promise<{ error: any; data: any }> {
    try {
      const logoutTime = new Date();

      // Get the last active session
      const { data: lastSession, error: fetchError } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('login_time', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !lastSession) {
        return { error: fetchError || 'No active session found', data: null };
      }

      // Calculate session duration
      const loginTime = new Date(lastSession.login_time);
      const sessionDurationSeconds = Math.floor(
        (logoutTime.getTime() - loginTime.getTime()) / 1000
      );

      // Update logout info
      const { error, data } = await supabase
        .from('login_logs')
        .update({
          logout_time: logoutTime.toISOString(),
          status: 'logged_out',
          session_duration_seconds: sessionDurationSeconds,
          updated_at: logoutTime.toISOString(),
        })
        .eq('id', lastSession.id)
        .select();

      return { error, data };
    } catch (error) {
      console.error('Error logging logout:', error);
      return { error, data: null };
    }
  },

  /**
   * Get active sessions
   */
  async getActiveSessions(filters?: {
    userId?: string;
    limit?: number;
  }): Promise<{ data: OptimizedLoginLog[]; error: any }> {
    try {
      let query = supabase
        .from('login_logs')
        .select('*')
        .eq('status', 'active');

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query
        .order('login_time', { ascending: false })
        .limit(filters?.limit || 50);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return { data: [], error };
    }
  },

  /**
   * Get login history
   */
  async getLoginHistory(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ data: OptimizedLoginLog[]; error: any }> {
    try {
      let query = supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', userId);

      if (filters?.startDate) {
        query = query.gte('login_time', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('login_time', filters.endDate);
      }

      const { data, error } = await query
        .order('login_time', { ascending: false })
        .limit(filters?.limit || 100);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting login history:', error);
      return { data: [], error };
    }
  },

  /**
   * Get session statistics
   */
  async getSessionStats(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      let query = supabase
        .from('login_logs')
        .select('*');

      if (filters?.startDate) {
        query = query.gte('login_time', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('login_time', filters.endDate);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { data: null, error };
      }

      // Calculate stats
      const stats = {
        total_logins: data.length,
        unique_users: new Set(data.map((d) => d.user_id)).size,
        average_session_duration:
          data
            .filter((d) => d.session_duration_seconds)
            .reduce((sum, d) => sum + d.session_duration_seconds, 0) /
          data.filter((d) => d.session_duration_seconds).length,
        active_sessions: data.filter((d) => d.status === 'active').length,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { data: null, error };
    }
  },
};

// ============================================
// MAINTENANCE FUNCTIONS
// ============================================

export const logMaintenanceService = {
  /**
   * Archive old logs (cron job friendly)
   */
  async archiveOldLogs(daysToKeep: number = 90): Promise<{
    error: any;
    archivedCount?: number;
  }> {
    try {
      const { error } = await supabase.rpc('archive_old_logs', {
        days_to_keep: daysToKeep,
      });

      return { error };
    } catch (error) {
      console.error('Error archiving logs:', error);
      return { error };
    }
  },

  /**
   * Refresh materialized views for analytics
   */
  async refreshAnalyticsViews(): Promise<{ error: any }> {
    try {
      // Refresh daily stats
      const { error: error1 } = await supabase
        .from('daily_activity_stats')
        .select('*')
        .limit(1);

      // Refresh user summary
      const { error: error2 } = await supabase
        .from('user_activity_summary')
        .select('*')
        .limit(1);

      return { error: error1 || error2 };
    } catch (error) {
      console.error('Error refreshing views:', error);
      return { error };
    }
  },

  /**
   * Get database size info
   */
  async getTableSizeInfo(): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('table_size_info')
        .select('*');

      return { data, error };
    } catch (error) {
      console.error('Error getting table size:', error);
      return { data: null, error };
    }
  },
};
