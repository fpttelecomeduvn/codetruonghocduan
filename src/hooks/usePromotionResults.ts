import { useMemo } from 'react';
import { TeacherEvaluation } from './useTeacherEvaluations';
import { GraduationEvaluation } from './useGraduationEvaluations';

export interface PromotionResult {
  studentId: string;
  studentName: string;
  teacherScore: number;
  teacherAttitude: number;
  teacherParticipation: number;
  graduationGPA: number;
  graduationCredits: number;
  graduationStatus: string;
  finalResult: 'đạt' | 'không đạt';
  reason: string;
  evaluationDate: string;
}

export const usePromotionResults = (
  teacherEvaluations: TeacherEvaluation[],
  graduationEvaluations: GraduationEvaluation[]
) => {
  const promotionResults = useMemo(() => {
    const studentMap = new Map<string, PromotionResult>();

    // Tính điểm từ đánh giá giáo viên
    teacherEvaluations.forEach((te) => {
      const teacherScore = Math.round(te.score * 10) / 10;
      studentMap.set(te.studentId, {
        studentId: te.studentId,
        studentName: te.studentName,
        teacherScore: teacherScore,
        teacherAttitude: te.attitude,
        teacherParticipation: te.participation,
        graduationGPA: 0,
        graduationCredits: 0,
        graduationStatus: '',
        finalResult: 'không đạt',
        reason: '',
        evaluationDate: te.date,
      });
    });

    // Kết hợp với đánh giá tốt nghiệp
    graduationEvaluations.forEach((ge) => {
      const existing = studentMap.get(ge.studentId);
      if (existing) {
        // Điều kiện xét lên lớp:
        // 1. Điểm đánh giá giáo viên >= 60
        // 2. Điểm tốt nghiệp >= 60
        // 3. GPA >= 2.0
        // 4. Hoàn thành tín chỉ yêu cầu
        const teacherOk = existing.teacherScore >= 60;
        const graduationScoreOk =
          (ge.thesisScore + ge.finalExamScore) / 2 >= 60;
        const gpaOk = ge.gpa >= 2.0;
        const creditsOk = ge.totalCredits >= ge.requiredCredits;

        const passed =
          teacherOk && graduationScoreOk && gpaOk && creditsOk;

        const reasons = [];
        if (!teacherOk)
          reasons.push(
            `Điểm đánh giá GV thấp (${existing.teacherScore})`
          );
        if (!graduationScoreOk)
          reasons.push(`Điểm tốt nghiệp thấp`);
        if (!gpaOk) reasons.push(`GPA không đủ (${ge.gpa})`);
        if (!creditsOk)
          reasons.push(
            `Tín chỉ không đủ (${ge.totalCredits}/${ge.requiredCredits})`
          );

        studentMap.set(ge.studentId, {
          ...existing,
          graduationGPA: ge.gpa,
          graduationCredits: ge.totalCredits,
          graduationStatus: ge.status,
          finalResult: passed ? 'đạt' : 'không đạt',
          reason:
            passed ? 'Đạt tất cả điều kiện xét lên lớp' : reasons.join('; '),
          evaluationDate: ge.evaluationDate,
        });
      } else {
        // Nếu chỉ có đánh giá TN mà không có đánh giá GV
        studentMap.set(ge.studentId, {
          studentId: ge.studentId,
          studentName: ge.studentName,
          teacherScore: 0,
          teacherAttitude: 0,
          teacherParticipation: 0,
          graduationGPA: ge.gpa,
          graduationCredits: ge.totalCredits,
          graduationStatus: ge.status,
          finalResult: 'không đạt',
          reason: 'Chưa có đánh giá từ giáo viên',
          evaluationDate: ge.evaluationDate,
        });
      }
    });

    return Array.from(studentMap.values());
  }, [teacherEvaluations, graduationEvaluations]);

  return { promotionResults };
};
