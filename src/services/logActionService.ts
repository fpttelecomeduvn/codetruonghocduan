import { logActivityService } from './logService';

/**
 * Utility wrapper để tự động ghi logs cho các hành động
 */

export interface LogActionConfig {
  userId: string;
  username: string;
  userRole: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'ERROR';
  resourceType: 'student' | 'teacher' | 'class' | 'subject' | 'evaluation' | 'user';
  resourceId?: string;
  resourceName?: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log a CRUD action automatically
 */
export const logCrudAction = async (
  config: LogActionConfig,
  action: () => Promise<any>
): Promise<{ success: boolean; data: any; error?: any }> => {
  const startTime = performance.now();

  try {
    // Execute the action
    const result = await action();

    // Log success
    const endTime = performance.now();
    await logActivityService.logActivity({
      userId: config.userId,
      username: config.username,
      userRole: config.userRole,
      actionType: config.actionType,
      resourceType: config.resourceType,
      resourceId: config.resourceId,
      resourceName: config.resourceName,
      description: config.description,
      status: 'success',
      metadata: {
        ...config.metadata,
        duration_ms: Math.round(endTime - startTime),
      },
    });

    return { success: true, data: result };
  } catch (error: any) {
    // Log error
    await logActivityService.logActivity({
      userId: config.userId,
      username: config.username,
      userRole: config.userRole,
      actionType: 'ERROR',
      resourceType: config.resourceType,
      resourceId: config.resourceId,
      resourceName: config.resourceName,
      description: `${config.description} - Lỗi: ${error?.message || 'Unknown error'}`,
      status: 'failed',
      errorMessage: error?.message || 'Unknown error',
      metadata: config.metadata,
    });

    throw error;
  }
};

/**
 * Log a CREATE action
 */
export const logCreate = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  resourceName: string,
  metadata?: Record<string, any>
) => ({
  userId,
  username,
  userRole,
  actionType: 'CREATE' as const,
  resourceType,
  resourceName,
  description: `Tạo mới ${resourceType}: ${resourceName}`,
  metadata,
});

/**
 * Log an UPDATE action
 */
export const logUpdate = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  resourceId: string,
  resourceName: string,
  changes?: Record<string, any>
) => ({
  userId,
  username,
  userRole,
  actionType: 'UPDATE' as const,
  resourceType,
  resourceId,
  resourceName,
  description: `Chỉnh sửa ${resourceType}: ${resourceName}`,
  metadata: { changes },
});

/**
 * Log a DELETE action
 */
export const logDelete = (
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
});

/**
 * Log a VIEW action
 */
export const logView = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  resourceName?: string
) => ({
  userId,
  username,
  userRole,
  actionType: 'VIEW' as const,
  resourceType,
  resourceName,
  description: `Xem ${resourceType}: ${resourceName || resourceType}`,
});

/**
 * Log an EXPORT action
 */
export const logExport = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  format: string,
  rowCount?: number
) => ({
  userId,
  username,
  userRole,
  actionType: 'EXPORT' as const,
  resourceType,
  description: `Xuất ${resourceType} dưới dạng ${format}${rowCount ? ` (${rowCount} bản ghi)` : ''}`,
  metadata: { format, rowCount },
});

/**
 * Log an IMPORT action
 */
export const logImport = (
  userId: string,
  username: string,
  userRole: string,
  resourceType: string,
  fileName: string,
  rowCount?: number
) => ({
  userId,
  username,
  userRole,
  actionType: 'IMPORT' as const,
  resourceType,
  description: `Nhập ${resourceType} từ file: ${fileName}${rowCount ? ` (${rowCount} bản ghi)` : ''}`,
  metadata: { fileName, rowCount },
});

/**
 * Simple logging function
 */
export const logAction = async (config: LogActionConfig): Promise<void> => {
  try {
    await logActivityService.logActivity(config);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

/**
 * Helper to get success result with logging
 */
export const withLogging = async <T>(
  config: LogActionConfig,
  action: () => Promise<T>
): Promise<T> => {
  const result = await logCrudAction(config, action);
  return result.data;
};
