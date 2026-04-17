import { useState } from 'react'
import { LEVEL_LABEL, normalizeLevel } from '../utils/levels'

export default function ClassView({
  classItem,
  seriesList,
  onAddStudent,
  onEditProgress,
  onOpenStudent,
  onDeleteStudent,
  onRenameStudent,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (st) => {
    setEditingId(st.id)
    setEditValue(st.name)
  }

  const saveEdit = () => {
    if (editValue.trim() && editValue.trim() !== '') {
      onRenameStudent(editingId, editValue.trim())
    }
    setEditingId(null)
  }

  const lookupProgress = (st) => {
    const s = seriesList.find((x) => x.id === st.seriesId)
    const b = s?.books.find((x) => x.id === st.bookId)
    const u = b?.units.find((x) => x.id === st.unitId)
    if (!s || !b || !u) return null
    return { series: s, book: b, unit: u }
  }

  return (
    <div>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
{classItem.name}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>
            학생 {classItem.students.length}명
          </div>
        </div>
        <button className="btn" onClick={onAddStudent}>+ 학생 추가</button>
      </div>

      {classItem.students.length === 0 ? (
        <div className="card">
          <div className="empty">
            <p>아직 학생이 없습니다.</p>
            <button className="btn" onClick={onAddStudent}>+ 첫 학생 추가</button>
          </div>
        </div>
      ) : (
        <div className="grid">
          {classItem.students.map((st) => {
            const prog = lookupProgress(st)
            const isEditing = editingId === st.id

            return (
              <div
                key={st.id}
                className="book-card"
                onClick={() => {
                  if (isEditing) return
                  prog ? onOpenStudent(st) : onEditProgress(st)
                }}
                style={{ cursor: isEditing ? 'default' : 'pointer' }}
              >
                <div className="row between" style={{ marginBottom: 10, gap: 6 }}>
                  {isEditing ? (
                    <input
                      type="text"
                      className="student-edit-input"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={saveEdit}
                    />
                  ) : (
                    <div className="row" style={{ gap: 8, flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
{st.name}
                      </h3>
                      {st.level && (
                        <span className="badge">{LEVEL_LABEL[normalizeLevel(st.level)]}</span>
                      )}
                    </div>
                  )}
                  <div className="row" style={{ gap: 4 }}>
                    {!isEditing && (
                      <button
                        className="icon-mini"
                        title="이름 수정"
                        onClick={(e) => { e.stopPropagation(); startEdit(st) }}
                      >✏️</button>
                    )}
                    <button
                      className="icon-mini danger"
                      title="삭제"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`${st.name} 학생을 삭제할까요?`)) onDeleteStudent(st.id)
                      }}
                    >✕</button>
                  </div>
                </div>

                {prog ? (
                  <>
                    <div className="meta" style={{ marginBottom: 4 }}>
                      {prog.series.name} · {prog.book.name}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--orange-dark)', fontWeight: 700 }}>
Unit {prog.unit.number}. {prog.unit.title}
                    </div>
                    <div className="row" style={{ marginTop: 12, gap: 6 }}>
                      <button
                        className="btn sm secondary"
                        onClick={(e) => { e.stopPropagation(); onEditProgress(st) }}
                      >
                        진도 수정
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="meta" style={{ fontStyle: 'italic' }}>
                      진도가 설정되지 않았어요
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button
                        className="btn sm"
                        onClick={(e) => { e.stopPropagation(); onEditProgress(st) }}
                      >
진도 설정
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
