/**
 * HƯỚNG DẪN: Thêm Logging Vào App.tsx
 * 
 * Thêm những dòng sau vào đầu file App.tsx (sau các import hiện có)
 */

// ============================================
// THÊM NHỮNG IMPORT NÀY
// ============================================

import { logActivityService, loginLogService } from './services/logService'
import ActivityLogsPanel from './components/ActivityLogsPanel'

// ============================================
// CÓ 3 PHẦN CẦN THÊM/SỬA:
// ============================================

/**
 * PHẦN 1: Thêm tracking cho Login
 * 
 * Tìm hàm login trong useAuth hook và sửa:
 * 
 * FROM:
 * const login = (username, password) => {
 *   // current logic
 * }
 * 
 * TO:
 * const login = async (username, password) => {
 *   // current logic
 *   if (success) {
 *     await loginLogService.logLogin({
 *       userId: user.id,
 *       username: user.username,
 *       email: user.email,
 *       userRole: user.role
 *     });
 *   }
 *   return result;
 * }
 */

/**
 * PHẦN 2: Thêm tracking cho Logout
 * 
 * Thêm lệnh gọi logLogout trước logout:
 * 
 * const handleLogout = async () => {
 *   if (currentUser) {
 *     await loginLogService.logLogout(currentUser.id);
 *   }
 *   logout();
 * }
 */

/**
 * PHẦN 3: Thêm tracking cho CRUD Operations
 * 
 * Thêm logActivityService.logActivity() sau mỗi thành công:
 */

// ============================================
// EXAMPLE: Tracking Student Create
// ============================================

// Tìm hàm addStudent và sửa callback:

const handleAddStudent = async (studentData: any) => {
  const success = await addStudent(studentData);
  
  if (success && currentUser) {
    await logActivityService.logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      actionType: 'CREATE',
      resourceType: 'student',
      resourceName: `${studentData.firstName} ${studentData.lastName}`,
      description: `Created new student: ${studentData.firstName} ${studentData.lastName}`,
      status: 'success',
      metadata: {
        studentData: studentData
      }
    });
  }
  
  setDialogMode(null);
  setSelectedStudent(null);
}

// ============================================
// EXAMPLE: Tracking Student Update
// ============================================

const handleUpdateStudent = async (studentData: any) => {
  const success = await updateStudent(selectedStudent?.id, studentData);
  
  if (success && currentUser) {
    await logActivityService.logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      actionType: 'UPDATE',
      resourceType: 'student',
      resourceId: selectedStudent?.id,
      resourceName: `${studentData.firstName} ${studentData.lastName}`,
      description: `Updated student: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`,
      status: 'success',
      metadata: {
        oldData: selectedStudent,
        newData: studentData
      }
    });
  }
  
  setDialogMode(null);
  setSelectedStudent(null);
}

// ============================================
// EXAMPLE: Tracking Student Delete
// ============================================

const handleConfirmDelete = async () => {
  if (!itemToDelete || !currentUser) return;
  
  let success = false;
  let resourceName = '';
  
  if (deleteType === 'student' && 'firstName' in itemToDelete) {
    success = await deleteStudent((itemToDelete as Student).id);
    resourceName = `${itemToDelete.firstName} ${itemToDelete.lastName}`;
  }
  
  if (success) {
    await logActivityService.logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      actionType: 'DELETE',
      resourceType: deleteType,
      resourceName: resourceName,
      description: `Deleted ${deleteType}: ${resourceName}`,
      status: 'success',
      metadata: {
        deletedData: itemToDelete
      }
    });
  }
  
  setConfirmDialogOpen(false);
  setItemToDelete(null);
}

// ============================================
// EXAMPLE: Thêm Activity Logs Panel vào UI
// ============================================

// Thêm tab mới vào sidebar/menu:

const [currentTab, setCurrentTab] = useState<'students' | 'teachers' | 'classes' | 'subjects' | 'teacher-eval' | 'graduation-eval' | 'promotion-result' | 'activity-logs'>('students')

// Thêm button để access Activity Logs Panel:
{hasPermission('view_logs') && (
  <button 
    className="nav-item"
    onClick={() => setCurrentTab('activity-logs')}
  >
    📊 Activity Logs
  </button>
)}

// Thêm render logic cho Activity Logs tab:
{currentTab === 'activity-logs' && hasPermission('view_logs') && (
  <ActivityLogsPanel />
)}

// ============================================
// PERMISSIONS CẦN THÊM VÀO DATABASE
// ============================================

/**
 * Thêm những permission này vào roles table:
 * 
 * - view_logs: Cho phép xem activity logs
 * - manage_logs: Cho phép xóa logs cũ
 * 
 * Thêm vào roles:
 * - admin: view_logs, manage_logs
 * - teacher: view_logs (chỉ logs của chính họ)
 * - viewer: Không có quyền view logs
 */

// ============================================
// COMPLETE EXAMPLE: Sửa Login Function
// ============================================

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username: string, password: string) => {
    try {
      // Existing login logic...
      const user = await authenticateUser(username, password);
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // LOG LOGIN
        await loginLogService.logLogin({
          userId: user.id,
          username: user.username,
          email: user.email,
          userRole: user.role
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      // LOG FAILED LOGIN
      await logActivityService.logActivity({
        userId: 'unknown',
        username: username,
        userRole: 'unknown',
        actionType: 'LOGIN',
        description: `Failed login attempt for user: ${username}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const logout = async () => {
    if (currentUser) {
      // LOG LOGOUT
      await loginLogService.logLogout(currentUser.id);
    }
    
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    // ... other methods
  };
};

// ============================================
// SUMMARY: Files Cần Tạo/Sửa
// ============================================

/**
 * 1. Database Setup (DONE):
 *    - Chạy SQL từ database_logging.sql trong Supabase
 * 
 * 2. Services (DONE):
 *    - src/services/logService.ts - Logic để save/fetch logs
 * 
 * 3. Hooks (DONE):
 *    - src/hooks/useActivityLogs.ts - Hooks để manage logs
 * 
 * 4. Components (DONE):
 *    - src/components/ActivityLogsPanel.tsx - UI hiển thị logs
 * 
 * 5. Styling (DONE):
 *    - src/styles/ActivityLogsPanel.css - CSS cho component
 * 
 * 6. Integration (TODO):
 *    - src/hooks/useAuth.ts - Sửa login/logout
 *    - src/App.tsx - Thêm logActivityService.logActivity() calls
 *    - src/components/*.tsx - Thêm logging cho CRUD operations
 * 
 * 7. Database Update (TODO):
 *    - Thêm columns vào users table (nếu cần):
 *      - activity_log_enabled BOOLEAN DEFAULT true
 */
