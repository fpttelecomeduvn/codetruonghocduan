import { useState } from 'react'
import { useStudents, Student } from './hooks/useStudents'
import { useTeachers, Teacher } from './hooks/useTeachers'
import { StudentDialog } from './components/StudentDialog'
import { StudentList } from './components/StudentList'
import { TeacherDialog } from './components/TeacherDialog'
import { TeacherList } from './components/TeacherList'
import { ConfirmDialog } from './components/ConfirmDialog'
import './App.css'

function App() {
  const { students, addStudent, updateStudent, deleteStudent, getStudent } = useStudents()
  const { teachers, addTeacher, updateTeacher, deleteTeacher, getTeacher } = useTeachers()
  
  const [currentTab, setCurrentTab] = useState<'students' | 'teachers'>('students')
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit' | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Student | Teacher | null>(null)
  const [deleteType, setDeleteType] = useState<'student' | 'teacher'>('student')

  const openCreateDialog = () => {
    setSelectedStudent(null)
    setDialogMode('create')
  }

  const openViewDialog = (student: Student) => {
    setSelectedStudent(student)
    setDialogMode('view')
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setDialogMode('edit')
  }

  const openDeleteConfirm = (student: Student) => {
    setItemToDelete(student)
    setDeleteType('student')
    setConfirmDialogOpen(true)
  }

  const openTeacherCreateDialog = () => {
    setSelectedTeacher(null)
    setDialogMode('create')
  }

  const openTeacherViewDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDialogMode('view')
  }

  const openTeacherEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDialogMode('edit')
  }

  const openTeacherDeleteConfirm = (teacher: Teacher) => {
    setItemToDelete(teacher)
    setDeleteType('teacher')
    setConfirmDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedStudent(null)
  }

  const handleSaveStudent = (studentData: Omit<Student, 'id'>) => {
    if (dialogMode === 'create') {
      addStudent(studentData)
    } else if (dialogMode === 'edit' && selectedStudent) {
      updateStudent(selectedStudent.id, studentData)
    }
    closeDialog()
  }

  const handleSaveTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    if (dialogMode === 'create') {
      addTeacher(teacherData)
    } else if (dialogMode === 'edit' && selectedTeacher) {
      updateTeacher(selectedTeacher.id, teacherData)
    }
    closeDialog()
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (deleteType === 'student') {
        deleteStudent((itemToDelete as Student).id)
      } else {
        deleteTeacher((itemToDelete as Teacher).id)
      }
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>📚 Hệ Thống Quản Lý Giáo Dục</h1>
          <p>Quản lý thông tin sinh viên và giáo viên hiệu quả</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-container">
          <button
            className={`nav-btn ${currentTab === 'students' ? 'active' : ''}`}
            onClick={() => setCurrentTab('students')}
          >
            👨‍🎓 Quản Lý Sinh Viên
          </button>
          <button
            className={`nav-btn ${currentTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setCurrentTab('teachers')}
          >
            👨‍🏫 Quản Lý Giáo Viên
          </button>
        </div>
      </nav>

      <main className="app-main">
        {currentTab === 'students' ? (
          <>
            <div className="control-panel">
              <button className="btn btn-primary btn-lg" onClick={openCreateDialog}>
                ➕ Thêm Sinh Viên Mới
              </button>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng sinh viên:</span>
                  <span className="stat-value">{students.length}</span>
                </div>
              </div>
            </div>

            <StudentList
              students={students}
              onView={openViewDialog}
              onEdit={openEditDialog}
              onDelete={openDeleteConfirm}
            />
          </>
        ) : (
          <>
            <div className="control-panel">
              <button className="btn btn-primary btn-lg btn-teacher" onClick={openTeacherCreateDialog}>
                ➕ Thêm Giáo Viên Mới
              </button>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng giáo viên:</span>
                  <span className="stat-value">{teachers.length}</span>
                </div>
              </div>
            </div>

            <TeacherList
              teachers={teachers}
              onView={openTeacherViewDialog}
              onEdit={openTeacherEditDialog}
              onDelete={openTeacherDeleteConfirm}
            />
          </>
        )}
      </main>

      {currentTab === 'students' && (
        <StudentDialog
          isOpen={dialogMode !== null}
          mode={dialogMode as any}
          student={selectedStudent}
          onClose={closeDialog}
          onSave={dialogMode !== 'view' ? handleSaveStudent : undefined}
        />
      )}

      {currentTab === 'teachers' && (
        <TeacherDialog
          isOpen={dialogMode !== null}
          mode={dialogMode as any}
          teacher={selectedTeacher}
          onClose={closeDialog}
          onSave={dialogMode !== 'view' ? handleSaveTeacher : undefined}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        title={`Xóa ${deleteType === 'student' ? 'sinh viên' : 'giáo viên'}`}
        message={`Bạn có chắc chắn muốn xóa ${deleteType === 'student' ? 'sinh viên' : 'giáo viên'} "${(itemToDelete as any)?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmDialogOpen(false)
          setItemToDelete(null)
        }}
        isDangerous
      />
    </div>
  )
}

export default App
