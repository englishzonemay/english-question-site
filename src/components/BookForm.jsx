import { useState } from 'react'
import { uid } from '../utils/storage'
import { LEVELS } from '../utils/levels'

export default function BookForm({ series, defaultSeriesId, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [seriesId, setSeriesId] = useState(defaultSeriesId || series[0]?.id || '')
  const [level, setLevel] = useState('basic')
  const [error, setError] = useState('')

  const submit = () => {
    setError('')
    if (!name.trim()) return setError('책 이름을 입력해주세요.')
    if (!seriesId) return setError('시리즈를 선택해주세요.')

    const book = {
      id: uid(),
      name: name.trim(),
      level,
      createdAt: Date.now(),
      units: [],
    }
    onSubmit(seriesId, book)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>새 책 등록</h2>
        <p className="modal-desc">책 정보를 입력하세요. Unit은 등록 후 추가할 수 있습니다.</p>

        {error && <div className="alert">{error}</div>}

        <div className="form-group">
          <label>시리즈</label>
          <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)}>
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>책 이름</label>
          <input
            type="text"
            placeholder="예: Little Fox Level 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>난이도</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label} · {l.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="row end" style={{ gap: 8 }}>
          <button className="btn secondary" onClick={onClose}>취소</button>
          <button className="btn" onClick={submit}>등록</button>
        </div>
      </div>
    </div>
  )
}
