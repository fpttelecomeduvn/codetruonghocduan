import { useState, useCallback } from 'react';

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

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: '1',
    name: 'Trần Minh Tuấn',
    email: 'tranminhtuan@email.com',
    phone: '0912111111',
    address: '100 Đường Pasteur, Quận 1, TP. Hồ Chí Minh',
    department: 'Khoa Công Nghệ Thông Tin',
    specialization: 'Lập trình Web',
    yearsOfExperience: 8,
    hireDate: '2016-08-15',
  },
  {
    id: '2',
    name: 'Lê Thị Hương',
    email: 'lethihuong@email.com',
    phone: '0987222222',
    address: '200 Đường Nguyễn Hữu Cảnh, Quận 1, TP. Hồ Chí Minh',
    department: 'Khoa Công Nghệ Thông Tin',
    specialization: 'Cơ sở dữ liệu',
    yearsOfExperience: 6,
    hireDate: '2018-09-01',
  },
  {
    id: '3',
    name: 'Phạm Văn Sơn',
    email: 'phamvanson@email.com',
    phone: '0909333333',
    address: '300 Đường Võ Văn Kiệt, Quận 5, TP. Hồ Chí Minh',
    department: 'Khoa Công Nghệ Thông Tin',
    specialization: 'Hệ thống máy tính',
    yearsOfExperience: 10,
    hireDate: '2014-07-20',
  },
];

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);

  const addTeacher = useCallback((teacher: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: Date.now().toString(),
    };
    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  }, []);

  const updateTeacher = useCallback((id: string, teacher: Omit<Teacher, 'id'>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...teacher, id } : t))
    );
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
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
  };
};
