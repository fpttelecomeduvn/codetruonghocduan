import { supabase } from './supabaseClient';

/**
 * SIMPLE ACTIVITY LOG SERVICE - Lightweight version
 * Không cần API calls, chỉ ghi thông tin cơ bản
 */

export interface SimpleActivityLog {
  id: string;
  user_id: string;
  username: string;
  user_role: string;
  action_type: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'ERROR';
  resource_type?: 'student' | 'teacher' | 'class' | 'subject' | 'evaluation' | 'user';
  resource_id?: string;
  resource_name?: string;
  description: string;
  status: 'success' | 'failed';
  error_message?: string;
  timestamp: string;
  created_at?: string;
}

/**
 * Simple log action - không cần async operations
 */
export const simpleLogActivityService = {
  /**
   * Ghi log hành động - đơn giản & nhanh
   */
  async logActivity(data: {
    userId: string;
    username: string;
    userRole: string;
    actionType: SimpleActivityLog['action_type'];
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    description: string;
    status?: 'success' | 'failed';
    errorMessage?: string;
  }): Promise<{ error: any; data: any }> {
    try {
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
            status: data.status || 'success',
            error_message: data.errorMessage,
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
  }): Promise<{ data: SimpleActivityLog[]; count: number; error: any }> {
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
   * Xóa activity logs theo date range
   */
  async deleteActivityLogs(filters?: {
    startDate?: string;
    endDate?: string;
    actionType?: string;
    status?: string;
  }): Promise<{ count: number; error: any }> {
    try {
      let query = supabase.from('activity_logs').delete();

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error deleting activity logs:', error);
        return { count: 0, error };
      }

      return { count: count || 0, error };
    } catch (error) {
      console.error('Error deleting activity logs:', error);
      return { count: 0, error };
    }
  },

  /**
   * Lấy logs của user cụ thể
   */
  async getUserActivityLogs(userId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: SimpleActivityLog[]; error: any }> {
    try {
      const result = await this.getActivityLogs({
        userId,
        limit: options?.limit,
        offset: options?.offset,
      });

      return { data: result.data, error: result.error };
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      return { data: [], error };
    }
  },

  /**
   * Lấy thống kê logs
   */
  async getLogStats(): Promise<{
    totalActivities: number;
    activeUsers: number;
    failedActions: number;
    error: any;
  }> {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true });

      const { count: failedCount, error: failedError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      const { data: userIds, error: usersError } = await supabase
        .from('activity_logs')
        .select('user_id', { distinct: true });

      if (totalError || failedError || usersError) {
        return {
          totalActivities: 0,
          activeUsers: 0,
          failedActions: 0,
          error: totalError || failedError || usersError,
        };
      }

      return {
        totalActivities: totalCount || 0,
        activeUsers: userIds?.length || 0,
        failedActions: failedCount || 0,
        error: null,
      };
    } catch (error) {
      console.error('Error fetching log stats:', error);
      return {
        totalActivities: 0,
        activeUsers: 0,
        failedActions: 0,
        error,
      };
    }
  },
};

/**
 * Simple action helpers - không cần IP/location
 */

export const simpleLogCreate = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  resourceName: string
) => ({
  userId,
  username,
  userRole,
  actionType: 'CREATE' as const,
  resourceType,
  resourceName,
  description: `Tạo mới ${resourceType}: ${resourceName}`,
  status: 'success' as const,
});

export const simpleLogUpdate = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  resourceId: string,
  resourceName: string
) => ({
  userId,
  username,
  userRole,
  actionType: 'UPDATE' as const,
  resourceType,
  resourceId,
  resourceName,
  description: `Chỉnh sửa ${resourceType}: ${resourceName}`,
  status: 'success' as const,
});

export const simpleLogDelete = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  resourceId: string,
  resourceName: string
) => ({
  userId,
  username,
  userRole,
  actionType: 'DELETE' as const,
  resourceType,
  resourceId,
  resourceName,
  description: `Xóa ${resourceType}: ${resourceName}`,
  status: 'success' as const,
});

export const simpleLogAction = async (
  userId: string,
  username: string,
  userRole: string,
  actionType: SimpleActivityLog['action_type'],
  description: string,
  resourceType?: string,
  resourceName?: string
): Promise<void> => {
  try {
    await simpleLogActivityService.logActivity({
      userId,
      username,
      userRole,
      actionType,
      resourceType,
      resourceName,
      description,
    });
  } catch (error) {
    console.warn('Failed to log action:', error);
  }
};
