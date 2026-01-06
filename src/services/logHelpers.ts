/**
 * LOGGING HELPERS FOR SUPABASE-BASED LOGGING
 * 
 * Dùng để gọi logging một cách dễ dàng từ các component
 * Lưu logs vào Supabase Database
 */

import { logActivityService, loginLogService } from '../services/logService';

export interface CurrentUser {
  id: string;
  username: string;
  email?: string;
  role: string;
}

// ============================================
// ACTIVITY LOGGING HELPERS
// ============================================

/**
 * Log CREATE action
 */
export const logCreateAction = async (
  user: CurrentUser,
  resourceType: string,
  resourceId: string,
  resourceName: string,
  resourceData: Record<string, any>
) => {
  await logActivityService.logActivity({
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    action_type: 'CREATE',
    resource_type: resourceType,
    resource_id: resourceId,
    resource_name: resourceName,
    description: `Tạo mới ${resourceType}: ${resourceName}`,
    status: 'success',
    metadata: {
      data: resourceData,
    },
  });
};

/**
 * Log UPDATE action
 */
export const logUpdateAction = async (
  user: CurrentUser,
  resourceType: string,
  resourceId: string,
  resourceName: string,
  oldValue: Record<string, any>,
  newValue: Record<string, any>
) => {
  const changes = getChanges(oldValue, newValue);

  await logActivityService.logActivity({
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    action_type: 'UPDATE',
    resource_type: resourceType,
    resource_id: resourceId,
    resource_name: resourceName,
    description: `Cập nhật ${resourceType}: ${resourceName} (${Object.keys(changes).join(', ')})`,
    status: 'success',
    metadata: {
      changes,
      oldValue,
      newValue,
    },
  });
};

/**
 * Log DELETE action
 */
export const logDeleteAction = async (
  user: CurrentUser,
  resourceType: string,
  resourceId: string,
  resourceName: string,
  resourceData?: Record<string, any>
) => {
  await logActivityService.logActivity({
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    action_type: 'DELETE',
    resource_type: resourceType,
    resource_id: resourceId,
    resource_name: resourceName,
    description: `Xóa ${resourceType}: ${resourceName}`,
    status: 'success',
    metadata: {
      deletedData: resourceData,
    },
  });
};

/**
 * Log VIEW action
 */
export const logViewAction = async (
  user: CurrentUser,
  resourceType: string,
  resourceId?: string,
  resourceName?: string
) => {
  await logActivityService.logActivity({
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    action_type: 'VIEW',
    resource_type: resourceType,
    resource_id: resourceId,
    resource_name: resourceName || `Xem danh sách ${resourceType}`,
    description: `Xem ${resourceType}${resourceName ? `: ${resourceName}` : ''}`,
    status: 'success',
  });
};

/**
 * Log ERROR action
 */
export const logErrorAction = async (
  user: CurrentUser,
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER',
  resourceType: string,
  errorMessage: string,
  errorDetails?: Record<string, any>
) => {
  await logActivityService.logActivity({
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    action_type: actionType as any,
    resource_type: resourceType,
    description: `Lỗi: ${errorMessage}`,
    status: 'failed',
    error_message: errorMessage,
    metadata: {
      errorDetails,
    },
  });
};

// ============================================
// LOGIN LOGGING HELPERS
// ============================================

/**
 * Log login
 */
export const logLoginAction = async (user: CurrentUser) => {
  await loginLogService.logLogin({
    user_id: user.id,
    username: user.username,
    email: user.email || 'N/A',
    user_role: user.role,
    status: 'active',
  });
};

/**
 * Log logout
 */
export const logLogoutAction = async (userId: string) => {
  await loginLogService.logLogout(userId);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get changes between old and new values
 */
function getChanges(
  oldValue: Record<string, any>,
  newValue: Record<string, any>
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  // Check all keys in new value
  Object.keys(newValue).forEach(key => {
    if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
      changes[key] = {
        old: oldValue[key],
        new: newValue[key],
      };
    }
  });

  return changes;
}

/**
 * Format log entry for display
 */
export const formatLogEntry = (timestamp: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(timestamp);

  if (format === 'short') {
    return date.toLocaleString('vi-VN', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
  });
};

/**
 * Get user activity summary
 */
export const getUserActivitySummary = async (userId: string): Promise<Record<string, number>> => {
  const { data: logs } = await logActivityService.getActivityLogs({ userId });
  const summary: Record<string, number> = {};

  logs.forEach(log => {
    const key = `${log.action_type}_${log.resource_type || 'general'}`;
    summary[key] = (summary[key] || 0) + 1;
  });

  return summary;
};

/**
 * Get last activity for user
 */
export const getUserLastActivity = async (userId: string): Promise<string | null> => {
  const { data: logs } = await logActivityService.getActivityLogs({ userId, limit: 1 });

  if (logs.length === 0) {
    return null;
  }

  const lastLog = logs[0];
  return `${lastLog.action_type} - ${lastLog.description} (${formatLogEntry(lastLog.timestamp)})`;
};

/**
 * Get activity trend for today
 */
export const getActivityTrendToday = async (): Promise<Record<string, number>> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: allLogs } = await logActivityService.getActivityLogs({
    startDate: today.toISOString(),
    endDate: tomorrow.toISOString(),
  });

  const trend: Record<string, number> = {};

  allLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    const hourKey = `${hour}:00`;
    trend[hourKey] = (trend[hourKey] || 0) + 1;
  });

  return trend;
};
