import { useMemo, useState } from 'react';
import { Subject } from '../hooks/useSubjects';
import '../styles/SubjectList.css';

interface SubjectListProps {
  subjects: Subject[];
  onView: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export const SubjectList = ({ subjects, onView, onEdit, onDelete }: SubjectListProps) => {
  const [search, setSearch] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(8)

  const semesters = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.semester).filter(Boolean)))
  }, [subjects])

  const years = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.year).filter(Boolean)))
  }, [subjects])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return subjects.filter((s) => {
      if (filterSemester && s.semester !== filterSemester) return false
      if (filterYear && s.year !== filterYear) return false
      if (!q) return true
      return (
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.teacherName || '').toLowerCase().includes(q) ||
        (s.room || '').toLowerCase().includes(q)
      )
    })
  }, [subjects, search, filterSemester, filterYear])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  if (page > totalPages) setPage(totalPages)

  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)

  const exportCSV = () => {
    const rows = filtered.map((s) => [
      s.code,
      s.name,
      String(s.credits),
      s.semester,
      s.year,
      s.teacherName,
      s.room,
      s.schedule,
      (s.description || '').replace(/\n/g, ' '),
    ])
    const header = ['Mã', 'Tên môn', 'Tín chỉ', 'Học kỳ', 'Năm học', 'Giảng viên', 'Phòng', 'Lịch', 'Mô tả']
    const csvContent = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subjects_export_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="subject-list-wrapper">
      <div className="subject-controls">
        <div className="left-controls">
          <input
            className="search-input"
            placeholder="Tìm kiếm mã/tên/giảng viên/phòng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <select value={filterSemester} onChange={(e) => { setFilterSemester(e.target.value); setPage(1) }}>
            <option value="">Tất cả học kỳ</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setPage(1) }}>
            <option value="">Tất cả năm học</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="right-controls">
          <label className="perpage-label">Hiển thị</label>
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}>
            {[5,8,10,20,50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="subject-list-container">
        <table className="subject-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã</th>
              <th>Tên môn</th>
              <th>Tín chỉ</th>
              <th>Giảng viên</th>
              <th>Phòng</th>
              <th>Lịch</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-message">Không tìm thấy kết quả</td>
              </tr>
            ) : (
              pageItems.map((s, idx) => (
                <tr key={s.id}>
                  <td>{(page - 1) * perPage + idx + 1}</td>
                  <td><span className="subject-code">{s.code}</span></td>
                  <td>{s.name}</td>
                  <td>{s.credits}</td>
                  <td>{s.teacherName}</td>
                  <td>{s.room}</td>
                  <td>{s.schedule}</td>
                  <td className="action-buttons">
                    <button className="btn btn-sm btn-info" onClick={() => onView(s)}>👁️</button>
                    <button className="btn btn-sm btn-warning" onClick={() => onEdit(s)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(s)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="subject-pagination">
        <div className="pagination-info">{filtered.length} kết quả</div>
        <div className="pagination-controls">
          <button className="btn btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="btn btn-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
};
