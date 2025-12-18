import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Class {
  id: string;
  className: string;
  classCode: string;
  major: string;
  semester: string;
  year: string;
  maxStudents: number;
  currentStudents: number;
  teacherName: string;
  room: string;
  schedule: string;
  description: string;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('classes')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedClasses: Class[] = (data || []).map((row: any) => ({
          id: row.id,
          className: row.class_name || '',
          classCode: row.class_code || '',
          major: '',
          semester: row.semester || '',
          year: row.year?.toString() || '',
          maxStudents: row.capacity || 0,
          currentStudents: 0,
          teacherName: row.teacher_name || '',
          room: '',
          schedule: '',
          description: '',
        }));

        setClasses(mappedClasses);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching classes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const addClass = useCallback(async (classData: Omit<Class, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('classes')
        .insert([
          {
            class_code: classData.classCode,
            class_name: classData.className,
            semester: classData.semester,
            year: parseInt(classData.year),
            capacity: classData.maxStudents,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newClass: Class = {
        id: data.id,
        className: data.class_name,
        classCode: data.class_code,
        major: '',
        semester: data.semester || '',
        year: data.year?.toString() || '',
        maxStudents: data.capacity || 0,
        currentStudents: 0,
        teacherName: '',
        room: '',
        schedule: '',
        description: '',
      };

      setClasses((prev) => [newClass, ...prev]);
      return newClass;
    } catch (err: any) {
      console.error('Error adding class:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateClass = useCallback(async (id: string, classData: Omit<Class, 'id'>) => {
    try {
      const { error: updateError } = await supabase
        .from('classes')
        .update({
          class_code: classData.classCode,
          class_name: classData.className,
          semester: classData.semester,
          year: parseInt(classData.year),
          capacity: classData.maxStudents,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setClasses((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...classData,
                id: c.id,
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error updating class:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('classes').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting class:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getClass = useCallback(
    (id: string) => {
      return classes.find((c) => c.id === id);
    },
    [classes]
  );

  return {
    classes,
    addClass,
    updateClass,
    deleteClass,
    getClass,
    loading,
    error,
  };
};
