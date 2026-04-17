import { useState } from 'react'
import { LEVELS, normalizeLevel } from '../utils/levels'

export default function ProgressForm({ student, seriesList, onClose, onSubmit }) {
  const [level, setLevel] = useState(normalizeLevel(student.level))
  const [seriesId, setSeriesId] = useState(student.seriesId || '')
  const [bookId, setBookId] = useState(student.bookId || '')
  const [unitId, setUnitId] = useState(student.unitId || '')
  const [error, setError] = useState('')

  const series = seriesList.find((s) => s.id === seriesId)
  const book = series?.books.find((b) => b.id === bookId)

  const submit = () => {
    if (!seriesId) return setError('시리즈를 선택해주세요.')
    if (!bookId) return setError('책을 선택해주세요.')
    if (!unitId) return setError('Unit을 선택해주세요.')
    onSubmit({ level, seriesId, bookId, unitId })
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>진도 설정</h2>
        <p className="modal-desc">
          <strong>{student.name}</strong> 학생의 진도를 선택하세요.
        </p>

        {error && <div className="alert">{error}</div>}

        <div className="form-group">
          <label>학생 레벨</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label} · {l.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>시리즈</label>
          <select
            value={seriesId}
            onChange={(e) => { setSeriesId(e.target.value); setBookId(''); setUnitId('') }}
          >
            <option value="">선택하세요</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>책</label>
          <select
            value={bookId}
            onChange={(e) => { setBookId(e.target.value); setUnitId('') }}
            disabled={!series}
          >
            <option value="">{series ? '선택하세요' : '시리즈를 먼저 선택'}</option>
            {series?.books.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Unit</label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={!book}
          >
            <option value="">{book ? '선택하세요' : '책을 먼저 선택'}</option>
            {book?.units.map((u) => (
              <option key={u.id} value={u.id}>Unit {u.number}. {u.title}</option>
            ))}
          </select>
        </div>

        <div className="row end" style={{ gap: 8 }}>
          <button className="btn secondary" onClick={onClose}>취소</button>
          <button className="btn" onClick={submit}>저장</button>
        </div>
      </div>
    </div>
  )
}
