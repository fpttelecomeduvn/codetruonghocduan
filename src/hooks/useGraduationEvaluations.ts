import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface GraduationEvaluation {
  id: string;
  studentId: string;
  studentName: string;
  gpa: number; // 0-4.0
  totalCredits: number;
  requiredCredits: number;
  thesisScore: number; // 0-100
  finalExamScore: number; // 0-100
  status: 'pending' | 'passed' | 'failed';
  evaluationDate: string;
  notes: string;
}

export const useGraduationEvaluations = () => {
  const [evaluations, setEvaluations] = useState<GraduationEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('graduation_evaluations')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mappedEvaluations: GraduationEvaluation[] = (data || []).map((row: any) => ({
          id: row.id,
          studentId: row.student_id || '',
          studentName: row.student_name || '',
          gpa: row.gpa || 0,
          totalCredits: row.total_credits || 0,
          requiredCredits: row.required_credits || 120,
          thesisScore: row.thesis_score || 0,
          finalExamScore: row.final_exam_score || 0,
          status: (row.status || 'pending') as 'pending' | 'passed' | 'failed',
          evaluationDate: row.evaluation_date || new Date().toISOString().split('T')[0],
          notes: row.notes || '',
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

  const addEvaluation = useCallback(async (evaluation: Omit<GraduationEvaluation, 'id'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('graduation_evaluations')
        .insert([
          {
            student_id: evaluation.studentId,
            student_name: evaluation.studentName,
            gpa: evaluation.gpa,
            total_credits: evaluation.totalCredits,
            required_credits: evaluation.requiredCredits,
            thesis_score: evaluation.thesisScore,
            final_exam_score: evaluation.finalExamScore,
            status: evaluation.status,
            evaluation_date: evaluation.evaluationDate,
            notes: evaluation.notes,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newEvaluation: GraduationEvaluation = {
        id: data.id,
        studentId: data.student_id,
        studentName: data.student_name,
        gpa: data.gpa,
        totalCredits: data.total_credits,
        requiredCredits: data.required_credits,
        thesisScore: data.thesis_score,
        finalExamScore: data.final_exam_score,
        status: data.status,
        evaluationDate: data.evaluation_date,
        notes: data.notes,
      };

      setEvaluations((prev) => [newEvaluation, ...prev]);
      return newEvaluation;
    } catch (err: any) {
      console.error('Error adding evaluation:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateEvaluation = useCallback(async (id: string, evaluation: Omit<GraduationEvaluation, 'id'>) => {
    try {
      const { error: updateError } = await supabase
        .from('graduation_evaluations')
        .update({
          student_id: evaluation.studentId,
          student_name: evaluation.studentName,
          gpa: evaluation.gpa,
          total_credits: evaluation.totalCredits,
          required_credits: evaluation.requiredCredits,
          thesis_score: evaluation.thesisScore,
          final_exam_score: evaluation.finalExamScore,
          status: evaluation.status,
          evaluation_date: evaluation.evaluationDate,
          notes: evaluation.notes,
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
        .from('graduation_evaluations')
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
