import { useState } from 'react'

export default function StudentForm({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!name.trim()) return setError('학생 이름을 입력해주세요.')
    onSubmit(name.trim())
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>학생 추가</h2>

        {error && <div className="alert">{error}</div>}

        <div className="form-group">
          <label>학생 이름</label>
          <input
            type="text"
            placeholder="예: 김민수"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
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
