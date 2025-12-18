import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export type UserRole = 'admin' | 'teacher' | 'viewer';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  error: string | null;
}

const DEFAULT_ADMIN = {
  id: 'u-admin-001',
  username: 'administrator',
  password: 'administratormatkhau',
  role: 'admin' as UserRole,
  name: 'Quản Trị Viên',
};

const STORAGE_KEY = 'edu_system_auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isAuthenticated: true,
          currentUser: parsed,
          error: null,
        };
      }
    } catch (e) {
      // Ignore parse errors
    }
    return {
      isAuthenticated: false,
      currentUser: null,
      error: null,
    };
  });

  // Initialize admin user in Supabase if not exists
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const { data: existingAdmin } = await supabase
          .from('users')
          .select('*')
          .eq('username', DEFAULT_ADMIN.username)
          .single();

        if (!existingAdmin) {
          // Create default admin
          await supabase.from('users').insert([
            {
              username: DEFAULT_ADMIN.username,
              password: DEFAULT_ADMIN.password,
              name: DEFAULT_ADMIN.name,
              email: 'admin@system.local',
              role: DEFAULT_ADMIN.role,
            },
          ]);
        }
      } catch (err: any) {
        // User might already exist or table not created yet
        console.log('Admin initialization:', err.message);
      }
    };

    initializeAdmin();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      // Check if it's the default admin
      if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
        const user: AuthUser = {
          id: DEFAULT_ADMIN.id,
          username: DEFAULT_ADMIN.username,
          role: DEFAULT_ADMIN.role,
          name: DEFAULT_ADMIN.name,
        };
        setAuthState({
          isAuthenticated: true,
          currentUser: user,
          error: null,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return { success: true };
      }

      // Check in Supabase users table
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username);

      if (fetchError) throw fetchError;

      const user = users?.[0];
      if (user && user.password === password) {
        const authUser: AuthUser = {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
        };
        setAuthState({
          isAuthenticated: true,
          currentUser: authUser,
          error: null,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        return { success: true };
      }

      setAuthState({
        isAuthenticated: false,
        currentUser: null,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
      return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback to localStorage if Supabase fails
      const users = JSON.parse(localStorage.getItem('edu_system_users') || '[]');
      const user = users.find((u: any) => u.username === username);
      if (user && user.password === password) {
        const authUser: AuthUser = {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
        };
        setAuthState({
          isAuthenticated: true,
          currentUser: authUser,
          error: null,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        return { success: true };
      }

      setAuthState({
        isAuthenticated: false,
        currentUser: null,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
      return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
      error: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]) => {
    if (!authState.currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(authState.currentUser.role);
    }
    return authState.currentUser.role === role;
  }, [authState.currentUser]);

  const hasPermission = useCallback((permission: string) => {
    const user = authState.currentUser;
    if (!user) return false;

    // Admin có tất cả quyền
    if (user.role === 'admin') return true;

    // Define permissions per role
    const rolePermissions: Record<UserRole, string[]> = {
      admin: [
        'manage_users',
        'manage_students',
        'manage_teachers',
        'manage_classes',
        'manage_subjects',
        'manage_evaluations',
        'view_results',
        'view_admin_panel',
      ],
      teacher: [
        'add_student',
        'edit_student',
        'view_students',
        'add_evaluation',
        'edit_evaluation',
        'view_evaluations',
      ],
      viewer: [
        'view_students',
        'view_teachers',
        'view_classes',
        'view_subjects',
      ],
    };

    return rolePermissions[user.role]?.includes(permission) ?? false;
  }, [authState.currentUser]);

  return {
    ...authState,
    login,
    logout,
    hasRole,
    hasPermission,
  };
};
