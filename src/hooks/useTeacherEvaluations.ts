import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface TeacherEvaluation {
  id: string;
  studentId: string;
  studentName: string;
  teacherName: string;
  classCode: string;
  score: number; // 0-100
  attitude: number; // 0-100
  participation: number; // 0-100
  feedback: string;
  date: string;
}

export const useTeacherEvaluations = () => {
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('teacher_evaluations')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedEvaluations: TeacherEvaluation[] = (data || []).map((row: any) => ({
          id: row.id,
          studentId: row.student_id || '',
          studentName: row.student_name || '',
          teacherName: row.teacher_name || '',
          classCode: row.class_code || '',
          score: row.score || 0,
          attitude: row.attitude || 0,
          participation: row.participation || 0,
          feedback: row.feedback || '',
          date: row.date || new Date().toISOString().split('T')[0],
        }));

        setEvaluations(mappedEvaluations);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching evaluations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const addEvaluation = useCallback(async (evaluation: Omit<TeacherEvaluation, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('teacher_evaluations')
        .insert([
          {
            student_id: evaluation.studentId,
            student_name: evaluation.studentName,
            teacher_name: evaluation.teacherName,
            class_code: evaluation.classCode,
            score: evaluation.score,
            attitude: evaluation.attitude,
            participation: evaluation.participation,
            feedback: evaluation.feedback,
            date: evaluation.date,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newEvaluation: TeacherEvaluation = {
        id: data.id,
        studentId: data.student_id,
        studentName: data.student_name,
        teacherName: data.teacher_name,
        classCode: data.class_code,
        score: data.score,
        attitude: data.attitude,
        participation: data.participation,
        feedback: data.feedback,
        date: data.date,
      };

      setEvaluations((prev) => [newEvaluation, ...prev]);
      return newEvaluation;
    } catch (err: any) {
      console.error('Error adding evaluation:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateEvaluation = useCallback(async (id: string, evaluation: Omit<TeacherEvaluation, 'id'>) => {
    try {
      const { error: updateError } = await supabase
        .from('teacher_evaluations')
        .update({
          student_id: evaluation.studentId,
          student_name: evaluation.studentName,
          teacher_name: evaluation.teacherName,
          class_code: evaluation.classCode,
          score: evaluation.score,
          attitude: evaluation.attitude,
          participation: evaluation.participation,
          feedback: evaluation.feedback,
          date: evaluation.date,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setEvaluations((prev) =>
        prev.map((e) => (e.id === id ? { ...evaluation, id: e.id } : e))
      );
    } catch (err: any) {
      console.error('Error updating evaluation:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteEvaluation = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('teacher_evaluations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setEvaluations((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error('Error deleting evaluation:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getEvaluation = useCallback(
    (id: string) => {
      return evaluations.find((e) => e.id === id);
    },
    [evaluations]
  );

  return {
    evaluations,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getEvaluation,
    loading,
    error,
  };
};
