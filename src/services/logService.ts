import { supabase } from './supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ActivityLog {
  id: string;
  user_id: string;
  username: string;
  user_role: string;
  action_type: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'ERROR';
  resource_type?: 'student' | 'teacher' | 'class' | 'subject' | 'evaluation' | 'user';
  resource_id?: string;
  resource_name?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed';
  error_message?: string;
  timestamp: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
}

export interface LoginLog {
  id: string;
  user_id: string;
  username: string;
  email: string;
  user_role: string;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  user_agent?: string;
  device_name?: string;
  location?: string;
  status: 'active' | 'logged_out' | 'session_expired';
  session_duration_seconds?: number;
}

export interface LogStats {
  totalActivities: number;
  totalLogins: number;
  activeUsers: number;
  failedActions: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getClientIp = (): Promise<string> => {
  return fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => data.ip)
    .catch(() => 'unknown');
};

/**
 * Lấy location từ IP address sử dụng ip-api.com
 */
const getLocationFromIp = async (ip: string): Promise<string> => {
  try {
    if (ip === 'unknown') return 'Unknown';
    const response = await fetch(`https://ip-api.com/json/${ip}?fields=country,city,regionName`);
    if (!response.ok) return 'Unknown';
    const data = await response.json();
    if (data.country && data.city) {
      return `${data.city}, ${data.regionName || ''}, ${data.country}`.replace(/,\s*$/, '');
    }
    return data.country || 'Unknown';
  } catch (error) {
    console.warn('Error getting location:', error);
    return 'Unknown';
  }
};

/**
 * Lấy vị trí hiện tại từ browser Geolocation API
 */
const getBrowserLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding từ tọa độ
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.address;
            const location = [
              address?.city || address?.town || address?.village,
              address?.state,
              address?.country
            ].filter(Boolean).join(', ');
            resolve(location || 'Unknown');
          } catch (error) {
            resolve('Unknown');
          }
        },
        () => {
          resolve('Unknown'); // Nếu user từ chối permissions
        },
        { timeout: 5000 }
      );
    } else {
      resolve('Unknown');
    }
  });
};

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
 * Lấy browser name
 */
const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  return 'Unknown';
};

// ============================================
// ACTIVITY LOGS SERVICE
// ============================================

export const logActivityService = {
  /**
   * Ghi log hành động của user
   */
  async logActivity(data: {
    userId: string;
    username: string;
    userRole: string;
    actionType: ActivityLog['action_type'];
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    description: string;
    status?: 'success' | 'failed';
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<{ error: any; data: any }> {
    try {
      const startTime = performance.now();
      const ipAddress = await getClientIp();
      const location = await getLocationFromIp(ipAddress);
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
            ip_address: ipAddress,
            location: location,
            user_agent: navigator.userAgent,
            status: data.status || 'success',
            error_message: data.errorMessage,
            duration_ms: Math.round(endTime - startTime),
            metadata: {
              ...data.metadata,
              device: getDeviceName(),
              browser: getBrowserName(),
            },
            timestamp: new Date().toISOString(),
          },
        ]);

      return { error, data: logData };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { error, data: null };
    }
  },

  /**
   * Lấy activity logs với filters
   */
  async getActivityLogs(filters?: {
    userId?: string;
    actionType?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ActivityLog[]; count: number; error: any }> {
    try {
      let query = supabase.from('activity_logs').select('*', { count: 'exact' });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      // Sắp xếp theo thời gian mới nhất
      query = query.order('timestamp', { ascending: false });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      return { data: data || [], count: count || 0, error };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Lấy activity logs của user hiện tại
   */
  async getMyActivityLogs(options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: ActivityLog[]; error: any }> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user.id) {
        return { data: [], error: 'Not authenticated' };
      }

      const result = await this.getActivityLogs({
        userId: sessionData.session.user.id,
        limit: options?.limit,
        offset: options?.offset,
      });

      return { data: result.data, error: result.error };
    } catch (error) {
      console.error('Error fetching my activity logs:', error);
      return { data: [], error };
    }
  },

  /**
   * Lấy thống kê logs
   */
  async getLogStats(): Promise<{ data: LogStats | null; error: any }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total activities
      const { count: totalActivities } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact' });

      // Total logins hôm nay
      const { count: totalLogins } = await supabase
        .from('login_logs')
        .select('*', { count: 'exact' })
        .gte('login_time', today.toISOString());

      // Active users hôm nay
      const { data: activeUsersData } = await supabase
        .from('login_logs')
        .select('user_id')
        .gte('login_time', today.toISOString())
        .eq('status', 'active');

      const uniqueUsers = new Set(activeUsersData?.map(log => log.user_id) || []);

      // Failed actions
      const { count: failedActions } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .eq('status', 'failed');

      return {
        data: {
          totalActivities: totalActivities || 0,
          totalLogins: totalLogins || 0,
          activeUsers: uniqueUsers.size,
          failedActions: failedActions || 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching log stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Xóa activity logs cũ (> 90 ngày)
   */
  async deleteOldLogs(daysOld: number = 90): Promise<{ error: any; deletedCount?: number }> {
    try {
      const date = new Date();
      date.setDate(date.getDate() - daysOld);

      const { error, data } = await supabase
        .from('activity_logs')
        .delete()
        .lt('timestamp', date.toISOString());

      return { error, deletedCount: data?.length || 0 };
    } catch (error) {
      console.error('Error deleting old logs:', error);
      return { error };
    }
  },
};

// ============================================
// LOGIN LOGS SERVICE
// ============================================

export const loginLogService = {
  /**
   * Ghi log khi user login
   */
  async logLogin(data: {
    userId: string;
    username: string;
    email: string;
    userRole: string;
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
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            device_name: getDeviceName(),
            login_time: new Date().toISOString(),
            status: 'active',
          },
        ]);

      return { error, data: logData };
    } catch (error) {
      console.error('Error logging login:', error);
      return { error, data: null };
    }
  },

  /**
   * Ghi log khi user logout
   */
  async logLogout(userId: string): Promise<{ error: any; data: any }> {
    try {
      const now = new Date();

      // Lấy login session gần nhất
      const { data: loginData } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('login_time', { ascending: false })
        .limit(1);

      if (loginData && loginData.length > 0) {
        const loginTime = new Date(loginData[0].login_time);
        const duration = Math.round((now.getTime() - loginTime.getTime()) / 1000);

        const { error, data: logData } = await supabase
          .from('login_logs')
          .update({
            logout_time: now.toISOString(),
            status: 'logged_out',
            session_duration_seconds: duration,
          })
          .eq('id', loginData[0].id);

        return { error, data: logData };
      }

      return { error: 'No active session found', data: null };
    } catch (error) {
      console.error('Error logging logout:', error);
      return { error, data: null };
    }
  },

  /**
   * Lấy login logs
   */
  async getLoginLogs(filters?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: LoginLog[]; count: number; error: any }> {
    try {
      let query = supabase.from('login_logs').select('*', { count: 'exact' });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.startDate) {
        query = query.gte('login_time', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('login_time', filters.endDate);
      }

      query = query.order('login_time', { ascending: false });

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      return { data: data || [], count: count || 0, error };
    } catch (error) {
      console.error('Error fetching login logs:', error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Lấy session hiện tại của user
   */
  async getCurrentSession(userId: string): Promise<{ data: LoginLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('login_time', { ascending: false })
        .limit(1)
        .single();

      return { data: data as LoginLog | null, error };
    } catch (error) {
      console.error('Error fetching current session:', error);
      return { data: null, error };
    }
  },
};
