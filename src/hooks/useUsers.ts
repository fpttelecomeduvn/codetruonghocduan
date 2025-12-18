import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserRole } from './useAuth';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedUsers: User[] = (data || []).map((row: any) => ({
          id: row.id,
          username: row.username,
          password: row.password,
          name: row.name,
          email: row.email,
          role: row.role,
          createdAt: row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        }));

        setUsers(mappedUsers);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newUser: User = {
        id: data.id,
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      };

      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err: any) {
      console.error('Error adding user:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<Omit<User, 'id'>>) => {
    try {
      const updateData: any = {};
      if (userData.username) updateData.username = userData.username;
      if (userData.password) updateData.password = userData.password;
      if (userData.name) updateData.name = userData.name;
      if (userData.email) updateData.email = userData.email;
      if (userData.role) updateData.role = userData.role;

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
      );
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('users').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getUserByUsername = useCallback((username: string) => {
    return users.find((u) => u.username === username);
  }, [users]);

  const getUsersByRole = useCallback((role: UserRole) => {
    return users.filter((u) => u.role === role);
  }, [users]);

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUserByUsername,
    getUsersByRole,
    loading,
    error,
  };
};
