import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  specialization: string;
  yearsOfExperience: number;
  hireDate: string;
}

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedTeachers: Teacher[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address || '',
          department: row.department || '',
          specialization: row.specialty || '',
          yearsOfExperience: row.experience_years || 0,
          hireDate: row.created_at || new Date().toISOString().split('T')[0],
        }));

        setTeachers(mappedTeachers);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching teachers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const addTeacher = useCallback(async (teacher: Omit<Teacher, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('teachers')
        .insert([
          {
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            department: teacher.department,
            specialty: teacher.specialization,
            experience_years: teacher.yearsOfExperience,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newTeacher: Teacher = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || '',
        department: data.department || '',
        specialization: data.specialty || '',
        yearsOfExperience: data.experience_years || 0,
        hireDate: data.created_at,
      };

      setTeachers((prev) => [newTeacher, ...prev]);
      return newTeacher;
    } catch (err: any) {
      console.error('Error adding teacher:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateTeacher = useCallback(async (id: string, teacher: Omit<Teacher, 'id'>) => {
    try {
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          department: teacher.department,
          specialty: teacher.specialization,
          experience_years: teacher.yearsOfExperience,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setTeachers((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...teacher,
                id: t.id,
              }
            : t
        )
      );
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteTeacher = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('teachers').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting teacher:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getTeacher = useCallback(
    (id: string) => {
      return teachers.find((t) => t.id === id);
    },
    [teachers]
  );

  return {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacher,
    loading,
    error,
  };
};
