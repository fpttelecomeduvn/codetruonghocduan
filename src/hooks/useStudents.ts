import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export type StudentStatus = 'active' | 'graduated' | 'dropped_out' | 'suspended' | 'completed';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  major: string;
  gpa: number;
  enrollmentDate: string;
  status: StudentStatus;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedStudents: Student[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          major: row.major,
          gpa: row.gpa,
          enrollmentDate: row.enrollment_date,
          status: row.status,
        }));

        setStudents(mappedStudents);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('students')
        .insert([
          {
            name: student.name,
            email: student.email,
            phone: student.phone,
            address: student.address,
            major: student.major,
            gpa: student.gpa,
            enrollment_date: student.enrollmentDate,
            status: student.status,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newStudent: Student = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        major: data.major,
        gpa: data.gpa,
        enrollmentDate: data.enrollment_date,
        status: data.status,
      };

      setStudents((prev) => [newStudent, ...prev]);
      return newStudent;
    } catch (err: any) {
      console.error('Error adding student:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateStudent = useCallback(async (id: string, student: Omit<Student, 'id'>) => {
    try {
      const { error: updateError } = await supabase
        .from('students')
        .update({
          name: student.name,
          email: student.email,
          phone: student.phone,
          address: student.address,
          major: student.major,
          gpa: student.gpa,
          enrollment_date: student.enrollmentDate,
          status: student.status,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setStudents((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...student,
                id: s.id,
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Error updating student:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('students').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error('Error deleting student:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getStudent = useCallback(
    (id: string) => {
      return students.find((s) => s.id === id);
    },
    [students]
  );

  return {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    loading,
    error,
  };
};
