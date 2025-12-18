import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: string;
  year: string;
  teacherName: string;
  room: string;
  schedule: string;
  description: string;
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('subjects')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedSubjects: Subject[] = (data || []).map((row: any) => ({
          id: row.id,
          code: row.subject_code || '',
          name: row.subject_name || '',
          credits: row.credits || 0,
          semester: '',
          year: '',
          teacherName: '',
          room: '',
          schedule: '',
          description: row.description || '',
        }));

        setSubjects(mappedSubjects);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching subjects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const addSubject = useCallback(async (subject: Omit<Subject, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('subjects')
        .insert([
          {
            subject_code: subject.code,
            subject_name: subject.name,
            credits: subject.credits,
            description: subject.description,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newSubject: Subject = {
        id: data.id,
        code: data.subject_code,
        name: data.subject_name,
        credits: data.credits,
        semester: '',
        year: '',
        teacherName: '',
        room: '',
        schedule: '',
        description: data.description || '',
      };

      setSubjects((prev) => [newSubject, ...prev]);
      return newSubject;
    } catch (err: any) {
      console.error('Error adding subject:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateSubject = useCallback(async (id: string, subject: Omit<Subject, 'id'>) => {
    try {
      const { error: updateError } = await supabase
        .from('subjects')
        .update({
          subject_code: subject.code,
          subject_name: subject.name,
          credits: subject.credits,
          description: subject.description,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...subject, id: s.id } : s)));
    } catch (err: any) {
      console.error('Error updating subject:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('subjects').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getSubject = useCallback(
    (id: string) => {
      return subjects.find((s) => s.id === id);
    },
    [subjects]
  );

  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    loading,
    error,
  };
};
