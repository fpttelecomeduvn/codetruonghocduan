import { useState, useCallback } from 'react';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  major: string;
  gpa: number;
  enrollmentDate: string;
}

const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    major: 'Khoa học máy tính',
    gpa: 3.8,
    enrollmentDate: '2022-09-01',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0987654321',
    address: '456 Đường Lê Lợi, Quận 3, TP. Hồ Chí Minh',
    major: 'Kỹ thuật phần mềm',
    gpa: 3.5,
    enrollmentDate: '2022-09-01',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0909090909',
    address: '789 Đường Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',
    major: 'Hệ thống thông tin',
    gpa: 3.2,
    enrollmentDate: '2023-09-01',
  },
];

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
    };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  }, []);

  const updateStudent = useCallback((id: string, student: Omit<Student, 'id'>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...student, id } : s))
    );
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
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
  };
};
