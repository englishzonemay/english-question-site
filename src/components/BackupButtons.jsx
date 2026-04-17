import { useRef } from 'react'

export default function BackupButtons({ data, onRestore }) {
  const fileRef = useRef(null)

  const handleBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      data,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const now = new Date()
    const stamp =
      now.getFullYear() +
      '-' + String(now.getMonth() + 1).padStart(2, '0') +
      '-' + String(now.getDate()).padStart(2, '0') +
      '_' + String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0')

    const a = document.createElement('a')
    a.href = url
    a.download = `english-zone-backup-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRestoreClick = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const incoming = parsed?.data ?? parsed
      if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.series)) {
        alert('올바른 백업 파일이 아닙니다.')
        return
      }
      const ok = confirm(
        '현재 데이터를 백업 파일로 완전히 교체합니다. 계속할까요?',
      )
      if (!ok) return
      if (!incoming.classes) incoming.classes = []
      onRestore(incoming)
      alert('복원이 완료되었습니다.')
    } catch (err) {
      alert('파일을 읽는 중 오류가 발생했어요.\n' + err.message)
    }
  }

  return (
    <div className="row" style={{ gap: 6 }}>
      <button
        className="icon-btn"
        title="데이터 백업 (JSON 다운로드)"
        onClick={handleBackup}
      >
        💾
      </button>
      <button
        className="icon-btn"
        title="데이터 복원 (JSON 업로드)"
        onClick={handleRestoreClick}
      >
        📂
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
