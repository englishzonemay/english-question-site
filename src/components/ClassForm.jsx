import { useState } from 'react'

export default function ClassForm({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!name.trim()) return setError('반 이름을 입력해주세요.')
    onSubmit(name.trim())
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>새 반 만들기</h2>
        <p className="modal-desc">반 이름을 입력하세요.</p>

        {error && <div className="alert">{error}</div>}

        <div className="form-group">
          <label>반 이름</label>
          <input
            type="text"
            placeholder="예: 월요일반, 화목반"
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
