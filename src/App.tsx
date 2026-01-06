import { useState } from 'react'
import { useStudents, Student } from './hooks/useStudents'
import { useTeachers, Teacher } from './hooks/useTeachers'
import { useClasses, Class } from './hooks/useClasses'
import { useSubjects, Subject } from './hooks/useSubjects'
import { useTeacherEvaluations, TeacherEvaluation } from './hooks/useTeacherEvaluations'
import { useGraduationEvaluations, GraduationEvaluation } from './hooks/useGraduationEvaluations'
import { usePromotionResults } from './hooks/usePromotionResults'
import { useAuth } from './hooks/useAuth'
import { StudentDialog } from './components/StudentDialog'
import { StudentList } from './components/StudentList'
import { TeacherDialog } from './components/TeacherDialog'
import { TeacherList } from './components/TeacherList'
import { ClassDialog } from './components/ClassDialog'
import { ClassList } from './components/ClassList'
import { SubjectDialog } from './components/SubjectDialog'
import { SubjectList } from './components/SubjectList'
import { TeacherEvaluationDialog } from './components/TeacherEvaluationDialog'
import { TeacherEvaluationList } from './components/TeacherEvaluationList'
import { GraduationEvaluationDialog } from './components/GraduationEvaluationDialog'
import { GraduationEvaluationList } from './components/GraduationEvaluationList'
import { PromotionResultList } from './components/PromotionResultList'
import { ConfirmDialog } from './components/ConfirmDialog'
import { LoginPage } from './components/LoginPage'
import { AdminPanel } from './components/AdminPanel'
import AuditLogsPage from './components/AuditLogsPage'
import TextToSpeechPanel from './components/TextToSpeechPanel'
import './App.css'

function App() {
  const { isAuthenticated, currentUser, login, logout, hasPermission } = useAuth()
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  // Nếu chưa đăng nhập, hiển thị trang login
  if (!isAuthenticated || !currentUser) {
    return (
      <LoginPage
        onLogin={(username, password) => {
          const result = login(username, password);
          return result;
        }}
      />
    )
  }

  const { students, addStudent, updateStudent, deleteStudent, getStudent } = useStudents()
  const { teachers, addTeacher, updateTeacher, deleteTeacher, getTeacher } = useTeachers()
  const { classes, addClass, updateClass, deleteClass, getClass } = useClasses()
  const { subjects, addSubject, updateSubject, deleteSubject, getSubject } = useSubjects()
  
  const { evaluations, addEvaluation, updateEvaluation, deleteEvaluation, getEvaluation } = useTeacherEvaluations()
  const { evaluations: gradEvaluations, addEvaluation: addGradEvaluation, updateEvaluation: updateGradEvaluation, deleteEvaluation: deleteGradEvaluation, getEvaluation: getGradEvaluation } = useGraduationEvaluations()
  const { promotionResults } = usePromotionResults(evaluations, gradEvaluations)

  const [currentTab, setCurrentTab] = useState<'students' | 'teachers' | 'classes' | 'subjects' | 'teacher-eval' | 'graduation-eval' | 'promotion-result' | 'audit-logs' | 'text-to-speech'>('students')
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit' | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedEvaluation, setSelectedEvaluation] = useState<TeacherEvaluation | null>(null)
  const [selectedGradEvaluation, setSelectedGradEvaluation] = useState<GraduationEvaluation | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Student | Teacher | Class | TeacherEvaluation | GraduationEvaluation | null>(null)
  const [deleteType, setDeleteType] = useState<'student' | 'teacher' | 'class' | 'subject' | 'teacher-eval' | 'graduation-eval'>('student')

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

  const openClassCreateDialog = () => {
    setSelectedClass(null)
    setDialogMode('create')
  }

  const openClassViewDialog = (classData: Class) => {
    setSelectedClass(classData)
    setDialogMode('view')
  }

  const openClassEditDialog = (classData: Class) => {
    setSelectedClass(classData)
    setDialogMode('edit')
  }

  const openClassDeleteConfirm = (classData: Class) => {
    setItemToDelete(classData)
    setDeleteType('class')
    setConfirmDialogOpen(true)
  }

  const openSubjectCreateDialog = () => {
    setSelectedSubject(null)
    setDialogMode('create')
  }

  const openSubjectViewDialog = (subject: Subject) => {
    setSelectedSubject(subject)
    setDialogMode('view')
  }

  const openSubjectEditDialog = (subject: Subject) => {
    setSelectedSubject(subject)
    setDialogMode('edit')
  }

  const openSubjectDeleteConfirm = (subject: Subject) => {
    setItemToDelete(subject)
    setDeleteType('subject')
    setConfirmDialogOpen(true)
  }

  const openEvaluationCreateDialog = () => {
    setSelectedEvaluation(null)
    setDialogMode('create')
  }

  const openEvaluationViewDialog = (evaluation: TeacherEvaluation) => {
    setSelectedEvaluation(evaluation)
    setDialogMode('view')
  }

  const openEvaluationEditDialog = (evaluation: TeacherEvaluation) => {
    setSelectedEvaluation(evaluation)
    setDialogMode('edit')
  }

  const openEvaluationDeleteConfirm = (evaluation: TeacherEvaluation) => {
    setItemToDelete(evaluation)
    setDeleteType('teacher-eval')
    setConfirmDialogOpen(true)
  }

  const openGradEvaluationCreateDialog = () => {
    setSelectedGradEvaluation(null)
    setDialogMode('create')
  }

  const openGradEvaluationViewDialog = (evaluation: GraduationEvaluation) => {
    setSelectedGradEvaluation(evaluation)
    setDialogMode('view')
  }

  const openGradEvaluationEditDialog = (evaluation: GraduationEvaluation) => {
    setSelectedGradEvaluation(evaluation)
    setDialogMode('edit')
  }

  const openGradEvaluationDeleteConfirm = (evaluation: GraduationEvaluation) => {
    setItemToDelete(evaluation)
    setDeleteType('graduation-eval')
    setConfirmDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedStudent(null)
    setSelectedTeacher(null)
    setSelectedClass(null)
    setSelectedSubject(null)
    setSelectedEvaluation(null)
    setSelectedGradEvaluation(null)
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

  const handleSaveClass = (classData: Omit<Class, 'id'>) => {
    if (dialogMode === 'create') {
      addClass(classData)
    } else if (dialogMode === 'edit' && selectedClass) {
      updateClass(selectedClass.id, classData)
    }
    closeDialog()
  }

  const handleSaveSubject = (subjectData: Omit<Subject, 'id'>) => {
    if (dialogMode === 'create') {
      addSubject(subjectData)
    } else if (dialogMode === 'edit' && selectedSubject) {
      updateSubject(selectedSubject.id, subjectData)
    }
    closeDialog()
  }

  const handleSaveEvaluation = (evaluationData: Omit<TeacherEvaluation, 'id'>) => {
    if (dialogMode === 'create') {
      addEvaluation(evaluationData)
    } else if (dialogMode === 'edit' && selectedEvaluation) {
      updateEvaluation(selectedEvaluation.id, evaluationData)
    }
    closeDialog()
  }

  const handleSaveGradEvaluation = (evaluationData: Omit<GraduationEvaluation, 'id'>) => {
    if (dialogMode === 'create') {
      addGradEvaluation(evaluationData)
    } else if (dialogMode === 'edit' && selectedGradEvaluation) {
      updateGradEvaluation(selectedGradEvaluation.id, evaluationData)
    }
    closeDialog()
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (deleteType === 'student') {
        deleteStudent((itemToDelete as Student).id)
      } else if (deleteType === 'teacher') {
        deleteTeacher((itemToDelete as Teacher).id)
      } else if (deleteType === 'class') {
        deleteClass((itemToDelete as Class).id)
      } else if (deleteType === 'subject') {
        deleteSubject((itemToDelete as Subject).id)
      } else if (deleteType === 'teacher-eval') {
        deleteEvaluation((itemToDelete as TeacherEvaluation).id)
      } else if (deleteType === 'graduation-eval') {
        deleteGradEvaluation((itemToDelete as GraduationEvaluation).id)
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
        <div className="header-user">
          <div className="user-info">
            <span className="user-role-badge">{currentUser.role === 'admin' ? '👑 Admin' : currentUser.role === 'teacher' ? '👨‍🏫 Giáo Viên' : '👁️ Người Xem'}</span>
            <span className="user-name">{currentUser.name}</span>
          </div>
          {currentUser.role === 'admin' && (
            <button className="btn btn-secondary" onClick={() => setShowAdminPanel(true)}>
              ⚙️ Quản Lý
            </button>
          )}
          <button className="btn btn-danger" onClick={logout}>
            🚪 Đăng Xuất
          </button>
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
          <button
            className={`nav-btn ${currentTab === 'classes' ? 'active' : ''}`}
            onClick={() => setCurrentTab('classes')}
          >
            🏫 Quản Lý Lớp Học
          </button>
          <button
            className={`nav-btn ${currentTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setCurrentTab('subjects')}
          >
            📚 Quản Lý Môn Học
          </button>
          <button
            className={`nav-btn ${currentTab === 'teacher-eval' ? 'active' : ''}`}
            onClick={() => setCurrentTab('teacher-eval')}
          >
            ⭐ Đánh Giá Giáo Viên
          </button>
          <button
            className={`nav-btn ${currentTab === 'graduation-eval' ? 'active' : ''}`}
            onClick={() => setCurrentTab('graduation-eval')}
          >
            🎓 Đánh Giá Tốt Nghiệp
          </button>
          <button
            className={`nav-btn ${currentTab === 'promotion-result' ? 'active' : ''}`}
            onClick={() => setCurrentTab('promotion-result')}
          >
            📊 Xét Lên Lớp
          </button>
          <button
            className={`nav-btn ${currentTab === 'text-to-speech' ? 'active' : ''}`}
            onClick={() => setCurrentTab('text-to-speech')}
          >
            🎤 Text to Speech
          </button>
          {currentUser?.role === 'admin' || currentUser?.role === 'administrator' ? (
            <button
              className={`nav-btn ${currentTab === 'audit-logs' ? 'active' : ''}`}
              onClick={() => setCurrentTab('audit-logs')}
              style={{ marginLeft: 'auto', background: '#e74c3c' }}
            >
              🔐 Audit Logs
            </button>
          ) : null}
        </div>
      </nav>

      <main className="app-main">
        {currentTab === 'students' ? (
          <>
            <div className="control-panel">
              {hasPermission('add_student') && (
                <button className="btn btn-primary btn-lg" onClick={openCreateDialog}>
                  ➕ Thêm Sinh Viên Mới
                </button>
              )}
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
              onChangeStatus={(student, newStatus) => {
                updateStudent(student.id, {
                  ...student,
                  status: newStatus as any
                });
              }}
            />
          </>
        ) : currentTab === 'teachers' ? (
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
        ) : currentTab === 'subjects' ? (
          <>
            <div className="control-panel">
              <button className="btn btn-primary btn-lg btn-subject" onClick={openSubjectCreateDialog}>
                ➕ Thêm Môn Học Mới
              </button>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng môn học:</span>
                  <span className="stat-value">{subjects.length}</span>
                </div>
              </div>
            </div>

            <SubjectList
              subjects={subjects}
              onView={openSubjectViewDialog}
              onEdit={openSubjectEditDialog}
              onDelete={openSubjectDeleteConfirm}
            />
          </>
        ) : currentTab === 'teacher-eval' ? (
          <>
            <div className="control-panel">
              <button className="btn btn-primary btn-lg btn-teacher" onClick={openEvaluationCreateDialog}>
                ➕ Thêm Đánh Giá Mới
              </button>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng đánh giá:</span>
                  <span className="stat-value">{evaluations.length}</span>
                </div>
              </div>
            </div>

            <TeacherEvaluationList
              evaluations={evaluations}
              onView={openEvaluationViewDialog}
              onEdit={openEvaluationEditDialog}
              onDelete={openEvaluationDeleteConfirm}
            />
          </>
        ) : currentTab === 'graduation-eval' ? (
          <>
            <div className="control-panel">
              <button className="btn btn-primary btn-lg btn-teacher" onClick={openGradEvaluationCreateDialog}>
                ➕ Thêm Đánh Giá Tốt Nghiệp
              </button>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng đánh giá:</span>
                  <span className="stat-value">{gradEvaluations.length}</span>
                </div>
              </div>
            </div>

            <GraduationEvaluationList
              evaluations={gradEvaluations}
              onView={openGradEvaluationViewDialog}
              onEdit={openGradEvaluationEditDialog}
              onDelete={openGradEvaluationDeleteConfirm}
            />
          </>
        ) : currentTab === 'promotion-result' ? (
          <>
            <div className="control-panel">
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng sinh viên xét:</span>
                  <span className="stat-value">{promotionResults.length}</span>
                </div>
              </div>
            </div>

            <PromotionResultList results={promotionResults} />
          </>
        ) : currentTab === 'text-to-speech' ? (
          <TextToSpeechPanel />
        ) : currentTab === 'audit-logs' ? (
          <AuditLogsPage currentUser={currentUser} />
        ) : (
          <>
            <div className="control-panel">
              <button className="btn btn-primary btn-lg btn-class" onClick={openClassCreateDialog}>
                ➕ Thêm Lớp Học Mới
              </button>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng lớp học:</span>
                  <span className="stat-value">{classes.length}</span>
                </div>
              </div>
            </div>

            <ClassList
              classes={classes}
              onView={openClassViewDialog}
              onEdit={openClassEditDialog}
              onDelete={openClassDeleteConfirm}
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

      {currentTab === 'subjects' && (
        <SubjectDialog
          isOpen={dialogMode !== null}
          mode={dialogMode as any}
          subject={selectedSubject}
          onClose={closeDialog}
          onSave={dialogMode !== 'view' ? handleSaveSubject : undefined}
        />
      )}

      {currentTab === 'classes' && (
        <ClassDialog
          isOpen={dialogMode !== null}
          mode={dialogMode as any}
          classData={selectedClass}
          onClose={closeDialog}
          onSave={dialogMode !== 'view' ? handleSaveClass : undefined}
        />
      )}

      {currentTab === 'teacher-eval' && (
        <TeacherEvaluationDialog
          isOpen={dialogMode !== null}
          mode={dialogMode as any}
          data={selectedEvaluation}
          students={students}
          teachers={teachers}
          classes={classes}
          onClose={closeDialog}
          onSave={dialogMode !== 'view' ? handleSaveEvaluation : undefined}
        />
      )}

      {currentTab === 'graduation-eval' && (
        <GraduationEvaluationDialog
          isOpen={dialogMode !== null}
          mode={dialogMode as any}
          data={selectedGradEvaluation}
          students={students}
          onClose={closeDialog}
          onSave={dialogMode !== 'view' ? handleSaveGradEvaluation : undefined}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        title={`Xóa ${deleteType === 'student' ? 'sinh viên' : deleteType === 'teacher' ? 'giáo viên' : deleteType === 'subject' ? 'môn học' : deleteType === 'teacher-eval' ? 'đánh giá giáo viên' : deleteType === 'graduation-eval' ? 'đánh giá tốt nghiệp' : 'lớp học'}`}
        message={`Bạn có chắc chắn muốn xóa ${deleteType === 'student' ? 'sinh viên' : deleteType === 'teacher' ? 'giáo viên' : deleteType === 'subject' ? 'môn học' : deleteType === 'teacher-eval' ? 'đánh giá giáo viên' : deleteType === 'graduation-eval' ? 'đánh giá tốt nghiệp' : 'lớp học'} "${(itemToDelete as any)?.name || (itemToDelete as any)?.className || (itemToDelete as any)?.studentName}" không? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmDialogOpen(false)
          setItemToDelete(null)
        }}
        isDangerous
      />

      {showAdminPanel && currentUser && (
        <AdminPanel currentUser={currentUser} onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  )
}

export default App
