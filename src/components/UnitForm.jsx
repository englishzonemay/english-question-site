import { useState } from 'react'
import { uid } from '../utils/storage'

export default function UnitForm({ existingCount, onClose, onSubmit }) {
  const [number, setNumber] = useState(String(existingCount + 1))
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    setError('')
    if (!number.trim()) return setError('Unit 번호를 입력해주세요.')
    if (!title.trim()) return setError('Unit 제목을 입력해주세요.')

    onSubmit({
      id: uid(),
      number: number.trim(),
      title: title.trim(),
      passage: null,
      questions: null,
      words: null,
      grammar: null,
    })
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>새 Unit 추가</h2>

        {error && <div className="alert">{error}</div>}

        <div className="form-group">
          <label>Unit 번호</label>
          <input
            type="text"
            placeholder="예: 1"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Unit 제목</label>
          <input
            type="text"
            placeholder="예: My Family"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>

        <div className="row end" style={{ gap: 8 }}>
          <button className="btn secondary" onClick={onClose}>취소</button>
          <button className="btn" onClick={submit}>추가</button>
        </div>
      </div>
    </div>
  )
}
