import { useEffect, useMemo, useState } from 'react'

const TABS = [
  { key: 'passage', label: '본문' },
  { key: 'questions', label: '질문지' },
]

export default function UnitDetail({ book, unit, initialTab, onUpdate, onDelete }) {
  const [tab, setTab] = useState(initialTab || 'passage')

  const update = (key, value) => onUpdate({ ...unit, [key]: value })

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Unit {unit.number}. {unit.title}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>
            {book.name}
          </div>
        </div>
        <button
          className="btn danger sm no-print"
          onClick={() => {
            if (confirm(`"${unit.title}"을 삭제할까요?`)) onDelete()
          }}
        >
          Unit 삭제
        </button>
      </div>

      <div className="tabs no-print">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'passage' && (
          <PassageEditor
            key={unit.id + '-passage'}
            data={unit.passage}
            onChange={(v) => update('passage', v)}
          />
        )}
        {tab === 'questions' && (
          <QuestionsEditor
            key={unit.id + '-questions'}
            unit={unit}
            data={unit.questions}
            onChange={(v) => update('questions', v)}
          />
        )}
      </div>
    </div>
  )
}

/* ============ PASSAGE ============ */
function normalizeTag(t) {
  const description = t?.description
    || [t?.structure, t?.meaning, t?.example].filter(Boolean).join('\n')
    || ''
  return { name: t?.name || '', description }
}
function normalizeWord(w) {
  return { word: w?.word || '', meaning: w?.meaning || '' }
}
function normalizeSentence(s) {
  let tags = Array.isArray(s?.tags) ? s.tags.map(normalizeTag) : []
  if (tags.length === 0 && s?.grammar) {
    tags = [{ name: '문법', description: s.grammar }]
  }
  const words = Array.isArray(s?.words) ? s.words.map(normalizeWord) : []
  return { en: s?.en || '', ko: s?.ko || '', words, tags }
}
function migratePassage(data) {
  if (!data) return { sentences: [] }
  if (Array.isArray(data.sentences)) {
    return { sentences: data.sentences.map(normalizeSentence) }
  }
  const en = (data.english || '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
  const ko = (data.korean || '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
  const len = Math.max(en.length, ko.length)
  const sentences = []
  for (let i = 0; i < len; i++) sentences.push({ en: en[i] || '', ko: ko[i] || '', words: [], tags: [] })
  return { sentences }
}

function PassageEditor({ data, onChange }) {
  const initial = useMemo(() => migratePassage(data), [data])
  const [sentences, setSentences] = useState(initial.sentences)
  const [editing, setEditing] = useState(null) // { idx, original, isNew }
  const [draft, setDraft] = useState({ en: '', ko: '', words: [], tags: [] })
  const [popupIdx, setPopupIdx] = useState(null)
  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [selected, setSelected] = useState(() => new Set())

  useEffect(() => setSentences(initial.sentences), [initial])

  const toggleSelected = (i) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }
  const selectAll = () => setSelected(new Set(sentences.map((_, i) => i)))
  const clearSelection = () => setSelected(new Set())
  const removeSelected = () => {
    if (selected.size === 0) return
    if (!confirm(`선택한 ${selected.size}개 문장을 삭제할까요?`)) return
    commit(sentences.filter((_, i) => !selected.has(i)))
    setSelected(new Set())
  }

  const commit = (next) => {
    setSentences(next)
    onChange({ sentences: next })
  }

  const startEdit = (i) => {
    const src = sentences[i]
    setEditing({ idx: i, original: src, isNew: false })
    setDraft({
      en: src.en,
      ko: src.ko,
      words: src.words.map((w) => ({ ...w })),
      tags: src.tags.map((t) => ({ ...t })),
    })
  }
  const startAdd = () => {
    const empty = { en: '', ko: '', words: [], tags: [] }
    const next = [...sentences, empty]
    setSentences(next)
    setEditing({ idx: next.length - 1, original: null, isNew: true })
    setDraft({ en: '', ko: '', words: [], tags: [] })
  }
  const saveEdit = () => {
    const cleaned = {
      en: draft.en,
      ko: draft.ko,
      words: draft.words.filter((w) => w.word.trim() || w.meaning.trim()),
      tags: draft.tags.filter((t) => t.name.trim() || t.description.trim()),
    }
    const next = sentences.map((s, i) => (i === editing.idx ? cleaned : s))
    commit(next)
    setEditing(null)
  }
  const cancelEdit = () => {
    if (editing.isNew) {
      setSentences(sentences.filter((_, i) => i !== editing.idx))
    } else {
      setSentences(sentences.map((s, i) => (i === editing.idx ? editing.original : s)))
    }
    setEditing(null)
  }
  const remove = (i) => {
    if (!confirm('이 문장을 삭제할까요?')) return
    commit(sentences.filter((_, idx) => idx !== i))
  }

  const addTag = () => {
    setDraft({ ...draft, tags: [...draft.tags, { name: '', description: '' }] })
  }
  const updateTag = (ti, patch) => {
    setDraft({ ...draft, tags: draft.tags.map((t, i) => (i === ti ? { ...t, ...patch } : t)) })
  }
  const removeTag = (ti) => {
    setDraft({ ...draft, tags: draft.tags.filter((_, i) => i !== ti) })
  }
  const addWord = () => {
    setDraft({ ...draft, words: [...draft.words, { word: '', meaning: '' }] })
  }
  const updateWord = (wi, patch) => {
    setDraft({ ...draft, words: draft.words.map((w, i) => (i === wi ? { ...w, ...patch } : w)) })
  }
  const removeWord = (wi) => {
    setDraft({ ...draft, words: draft.words.filter((_, i) => i !== wi) })
  }

  const parsePaste = () => {
    const text = pasteText.trim()
    if (!text) return
    const parsed = []
    const empty = () => ({ en: '', ko: '', wordsRaw: '', grammarRaw: '' })
    let cur = empty()
    let lastKey = null
    const parsePairs = (raw) =>
      raw.split(',').map((s) => s.trim()).filter(Boolean).map((pair) => {
        const [a, ...rest] = pair.split('/')
        return { a: (a || '').trim(), b: rest.join('/').trim() }
      })
    const flush = () => {
      if (cur.en || cur.ko) {
        const words = cur.wordsRaw
          ? parsePairs(cur.wordsRaw).filter((p) => p.a || p.b).map((p) => ({ word: p.a, meaning: p.b }))
          : []
        const tags = cur.grammarRaw
          ? parsePairs(cur.grammarRaw).filter((p) => p.a || p.b).map((p) => ({ name: p.a, description: p.b }))
          : []
        parsed.push({ en: cur.en.trim(), ko: cur.ko.trim(), words, tags })
      }
      cur = empty()
      lastKey = null
    }
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line) { flush(); continue }
      const m = line.match(/^(EN|KR|KO|WORDS|GRAMMAR)\s*[:：]\s*(.*)$/i)
      if (m) {
        const key = m[1].toUpperCase()
        const val = m[2]
        if (key === 'EN') {
          if (cur.en) flush()
          cur.en = val
          lastKey = 'en'
        } else if (key === 'KR' || key === 'KO') {
          cur.ko = cur.ko ? cur.ko + ' ' + val : val
          lastKey = 'ko'
        } else if (key === 'WORDS') {
          cur.wordsRaw = val
          lastKey = 'wordsRaw'
        } else if (key === 'GRAMMAR') {
          cur.grammarRaw = val
          lastKey = 'grammarRaw'
        }
      } else if (lastKey) {
        if (lastKey === 'wordsRaw' || lastKey === 'grammarRaw') {
          cur[lastKey] = cur[lastKey] ? cur[lastKey] + ', ' + line : line
        } else {
          cur[lastKey] = cur[lastKey] ? cur[lastKey] + ' ' + line : line
        }
      }
    }
    flush()
    if (parsed.length === 0) {
      alert('분리할 문장을 찾을 수 없습니다. 형식을 확인해주세요.')
      return
    }
    if (!confirm(`${parsed.length}개 문장을 추가할까요?`)) return
    commit([...sentences, ...parsed])
    setPasteText('')
    setShowPaste(false)
  }

  const popupSentence = popupIdx !== null ? sentences[popupIdx] : null

  return (
    <div>
      <div className="row between" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          총 {sentences.length}개 문장{selected.size > 0 && ` · ${selected.size}개 선택됨`}
        </div>
        <div className="row no-print" style={{ gap: 8, flexWrap: 'wrap' }}>
          {sentences.length > 0 && (
            <>
              <button
                className="btn sm secondary"
                onClick={selected.size === sentences.length ? clearSelection : selectAll}
                disabled={!!editing}
              >
                {selected.size === sentences.length ? '전체 해제' : '전체 선택'}
              </button>
              <button
                className="btn sm danger"
                onClick={removeSelected}
                disabled={!!editing || selected.size === 0}
              >
                선택 삭제 {selected.size > 0 && `(${selected.size})`}
              </button>
            </>
          )}
          <button
            className="btn sm secondary"
            onClick={() => setShowPaste((v) => !v)}
            disabled={!!editing}
          >
            {showPaste ? '붙여넣기 닫기' : '📋 붙여넣기'}
          </button>
          <button className="btn sm" onClick={startAdd} disabled={!!editing}>
            + 문장 추가
          </button>
        </div>
      </div>

      {showPaste && (
        <div className="paste-box no-print">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            형식: <code>EN:</code> 영어 / <code>KR:</code> 한글 / <code>WORDS:</code> 단어1/뜻1, 단어2/뜻2 / <code>GRAMMAR:</code> 이름1/설명1, 이름2/설명2 (WORDS·GRAMMAR는 선택사항, 문장 쌍은 빈 줄로 구분)
          </div>
          <textarea
            rows={10}
            placeholder={'EN: I have been to Paris.\nKR: 나는 파리에 가본 적이 있다.\nWORDS: been/가본 적 있는, Paris/파리\nGRAMMAR: 현재완료/have+p.p., 경험 용법/~해본 적이 있다\n\nEN: She likes coffee.\nKR: 그녀는 커피를 좋아한다.'}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
          />
          <div className="row end" style={{ gap: 8, marginTop: 8 }}>
            <button className="btn sm secondary" onClick={() => { setPasteText(''); setShowPaste(false) }}>취소</button>
            <button className="btn sm" onClick={parsePaste} disabled={!pasteText.trim()}>문장 분리하기</button>
          </div>
        </div>
      )}

      {sentences.length === 0 ? (
        <div className="empty">
          <p>아직 문장이 없습니다.</p>
          <button className="btn" onClick={startAdd}>+ 첫 문장 추가</button>
        </div>
      ) : (
        <div className="sentence-list">
          {sentences.map((s, i) => {
            const isEditing = editing?.idx === i
            return (
              <div key={i} className={`sentence-row ${isEditing ? 'editing' : ''} ${selected.has(i) ? 'selected' : ''}`}>
                {!isEditing && (
                  <input
                    type="checkbox"
                    className="sentence-check no-print"
                    checked={selected.has(i)}
                    onChange={() => toggleSelected(i)}
                    aria-label={`${i + 1}번 문장 선택`}
                  />
                )}
                <div className="sentence-num">{i + 1}</div>
                {isEditing ? (
                  <>
                    <div className="sentence-fields">
                      <textarea
                        className="sentence-en"
                        placeholder="English sentence"
                        rows={2}
                        autoFocus
                        value={draft.en}
                        onChange={(e) => setDraft({ ...draft, en: e.target.value })}
                      />
                      <textarea
                        className="sentence-ko"
                        placeholder="한국어 해석"
                        rows={2}
                        value={draft.ko}
                        onChange={(e) => setDraft({ ...draft, ko: e.target.value })}
                      />
                      <div className="tag-editor">
                        <div className="row between" style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>단어</div>
                          <button className="btn sm secondary" onClick={addWord} type="button">+ 단어 추가</button>
                        </div>
                        {draft.words.length === 0 && (
                          <div style={{ fontSize: 12, color: 'var(--text-light)', padding: '6px 2px' }}>
                            단어 없음 (선택사항)
                          </div>
                        )}
                        {draft.words.map((w, wi) => (
                          <div key={wi} className="tag-edit-row">
                            <div className="row" style={{ gap: 6 }}>
                              <input
                                type="text"
                                placeholder="단어"
                                value={w.word}
                                onChange={(e) => updateWord(wi, { word: e.target.value })}
                                style={{ flex: 1 }}
                              />
                              <input
                                type="text"
                                placeholder="뜻"
                                value={w.meaning}
                                onChange={(e) => updateWord(wi, { meaning: e.target.value })}
                                style={{ flex: 1.5 }}
                              />
                              <button className="btn sm danger" onClick={() => removeWord(wi)} type="button">삭제</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="tag-editor">
                        <div className="row between" style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>문법</div>
                          <button className="btn sm secondary" onClick={addTag} type="button">+ 문법 추가</button>
                        </div>
                        {draft.tags.length === 0 && (
                          <div style={{ fontSize: 12, color: 'var(--text-light)', padding: '6px 2px' }}>
                            문법 없음 (선택사항)
                          </div>
                        )}
                        {draft.tags.map((t, ti) => (
                          <div key={ti} className="tag-edit-row">
                            <div className="row between" style={{ marginBottom: 4 }}>
                              <input
                                type="text"
                                placeholder="문법 이름 (예: 현재완료)"
                                value={t.name}
                                onChange={(e) => updateTag(ti, { name: e.target.value })}
                                style={{ flex: 1 }}
                              />
                              <button className="btn sm danger" onClick={() => removeTag(ti)} type="button" style={{ marginLeft: 6 }}>삭제</button>
                            </div>
                            <textarea
                              placeholder="설명"
                              rows={3}
                              value={t.description}
                              onChange={(e) => updateTag(ti, { description: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn sm" onClick={saveEdit}>저장</button>
                      <button className="btn sm secondary" onClick={cancelEdit}>취소</button>
                    </div>
                  </>
                ) : (
                  <>
                    {(() => {
                      const hasDetail = s.words.length > 0 || s.tags.length > 0
                      return (
                        <div
                          className={`sentence-fields view ${hasDetail ? 'has-detail' : ''}`}
                          onClick={() => !editing && hasDetail && setPopupIdx(i)}
                          style={{ cursor: hasDetail && !editing ? 'pointer' : 'default' }}
                          title={hasDetail ? '클릭하여 단어/문법 보기' : ''}
                        >
                          <div className="sentence-en-view">{s.en || <em className="placeholder">영어 문장 없음</em>}</div>
                          <div className="sentence-ko-view">{s.ko || <em className="placeholder">한국어 해석 없음</em>}</div>
                          {s.tags.length > 0 && (
                            <div className="tag-list">
                              {s.tags.map((t, ti) => (
                                <span key={ti} className="tag-chip">{t.name || '문법'}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                    <div className="item-actions no-print">
                      <button
                        className="btn sm secondary"
                        onClick={() => startEdit(i)}
                        disabled={!!editing}
                      >
                        수정
                      </button>
                      <button
                        className="btn sm danger"
                        onClick={() => remove(i)}
                        disabled={!!editing}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {popupSentence && (
        <div className="modal-bg" onClick={() => setPopupIdx(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--yellow-soft)', borderRadius: 8, fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{popupSentence.en}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{popupSentence.ko}</div>
            </div>

            {popupSentence.words.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>📖 단어</h3>
                <table className="popup-word-table">
                  <tbody>
                    {popupSentence.words.map((w, wi) => (
                      <tr key={wi}>
                        <td style={{ fontWeight: 600, width: '40%' }}>{w.word}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{w.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {popupSentence.tags.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>📘 문법</h3>
                {popupSentence.tags.map((t, ti) => (
                  <div key={ti} className="popup-grammar-item">
                    <div className="popup-grammar-name">{t.name || '문법'}</div>
                    {t.description && (
                      <div className="popup-grammar-desc" style={{ whiteSpace: 'pre-wrap' }}>{t.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="row end" style={{ gap: 8, marginTop: 18 }}>
              <button className="btn sm" onClick={() => setPopupIdx(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============ QUESTIONS ============ */
const EMPTY_Q = { question: '', questionKo: '', answer: '', answerKo: '', teacherGuide: '' }

function QuestionsEditor({ unit, data, onChange }) {
  const initial = useMemo(() => ({ questions: data?.questions || [] }), [data])
  const [questions, setQuestions] = useState(initial.questions)
  const [openIdx, setOpenIdx] = useState(0)
  const [editing, setEditing] = useState(null) // { idx, original, isNew, scope: 'qa' | 'guide' }
  const [draft, setDraft] = useState(null)

  useEffect(() => setQuestions(initial.questions), [initial])

  const commit = (next) => {
    setQuestions(next)
    onChange({ questions: next })
  }

  const startEdit = (i, scope = 'qa') => {
    setEditing({ idx: i, original: questions[i], isNew: false, scope })
    setDraft({ ...questions[i] })
    setOpenIdx(i)
  }
  const startAdd = () => {
    const next = [...questions, { ...EMPTY_Q }]
    setQuestions(next)
    setOpenIdx(next.length - 1)
    setEditing({ idx: next.length - 1, original: null, isNew: true, scope: 'qa' })
    setDraft({ ...EMPTY_Q })
  }
  const saveEdit = () => {
    const next = questions.map((q, i) => (i === editing.idx ? draft : q))
    commit(next)
    setEditing(null)
    setDraft(null)
  }
  const cancelEdit = () => {
    if (editing.isNew) {
      setQuestions(questions.filter((_, i) => i !== editing.idx))
    } else {
      setQuestions(questions.map((q, i) => (i === editing.idx ? editing.original : q)))
    }
    setEditing(null)
    setDraft(null)
  }
  const remove = (i) => {
    if (!confirm('이 질문을 삭제할까요?')) return
    commit(questions.filter((_, idx) => idx !== i))
  }

  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)

  const parsePaste = () => {
    const text = pasteText.trim()
    if (!text) return
    const parsed = []
    let cur = { question: '', questionKo: '', answer: '', answerKo: '' }
    const hasContent = (c) => c.question || c.questionKo || c.answer || c.answerKo
    const flush = () => {
      if (hasContent(cur)) parsed.push({ ...cur, teacherGuide: '' })
      cur = { question: '', questionKo: '', answer: '', answerKo: '' }
    }
    let lastKey = null
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line) { flush(); lastKey = null; continue }
      const m = line.match(/^(QKR|QKO|AKR|AKO|Q|A)\s*[:：]\s*(.*)$/i)
      if (m) {
        const k = m[1].toUpperCase()
        const v = m[2]
        if (k === 'Q') { if (cur.question) flush(); cur.question = v; lastKey = 'question' }
        else if (k === 'QKR' || k === 'QKO') { cur.questionKo = v; lastKey = 'questionKo' }
        else if (k === 'A') { cur.answer = v; lastKey = 'answer' }
        else if (k === 'AKR' || k === 'AKO') { cur.answerKo = v; lastKey = 'answerKo' }
      } else if (lastKey) {
        cur[lastKey] = cur[lastKey] ? cur[lastKey] + ' ' + line : line
      }
    }
    flush()
    if (parsed.length === 0) {
      alert('분리할 질문을 찾을 수 없습니다. 형식을 확인해주세요.')
      return
    }
    if (!confirm(`${parsed.length}개 질문을 추가할까요?`)) return
    commit([...questions, ...parsed])
    setPasteText('')
    setShowPaste(false)
  }

  return (
    <div>
      <div className="row between no-print" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          총 {questions.length}개 질문
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm secondary" onClick={() => window.print()}>인쇄</button>
          <button
            className="btn sm secondary"
            onClick={() => setShowPaste((v) => !v)}
            disabled={!!editing}
          >
            {showPaste ? '붙여넣기 닫기' : '📋 질문 붙여넣기'}
          </button>
          <button className="btn sm" onClick={startAdd} disabled={!!editing}>+ 질문 추가</button>
        </div>
      </div>

      {showPaste && (
        <div className="paste-box no-print">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            형식: <code>Q:</code> 영어 질문 / <code>QKR:</code> 한글 질문 / <code>A:</code> 영어 답변 / <code>AKR:</code> 한글 답변 (질문 쌍은 빈 줄로 구분)
          </div>
          <textarea
            rows={10}
            placeholder={'Q: What is your name?\nQKR: 너의 이름은 무엇이니?\nA: My name is Mia.\nAKR: 내 이름은 미아야.\n\nQ: How old are you?\nQKR: 몇 살이니?\nA: I am ten years old.\nAKR: 나는 열 살이야.'}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            style={{ width: '100%', fontFamily: 'inherit', fontSize: 13, padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
          />
          <div className="row end" style={{ gap: 8, marginTop: 8 }}>
            <button className="btn sm secondary" onClick={() => { setPasteText(''); setShowPaste(false) }}>취소</button>
            <button className="btn sm" onClick={parsePaste} disabled={!pasteText.trim()}>질문 분리하기</button>
          </div>
        </div>
      )}

      <div className="print-area">
        <div className="print-only print-header">
          <h2>Unit {unit.number}. {unit.title}</h2>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>질문지</div>
        </div>

        {questions.length === 0 ? (
          <div className="empty no-print">
            <p>아직 질문이 없습니다.</p>
            <button className="btn" onClick={startAdd}>+ 질문 추가</button>
          </div>
        ) : (
          <div className="accordion">
            {questions.map((q, i) => {
              const open = openIdx === i
              const isEditing = editing?.idx === i && editing?.scope === 'qa'
              const shown = isEditing ? draft : q
              return (
                <div key={i} className={`accordion-item ${open ? 'open' : ''} ${isEditing ? 'editing' : ''}`}>
                  <div
                    className="accordion-head no-print"
                    onClick={() => !isEditing && setOpenIdx(open ? -1 : i)}
                  >
                    <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                      <span className="qa-num">Q{i + 1}</span>
                      {isEditing ? (
                        <input
                          type="text"
                          className="accordion-title-input"
                          placeholder="질문 (영어)"
                          value={shown.question}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                        />
                      ) : (
                        <div className="accordion-title-view">
                          {q.question || <em className="placeholder">질문 없음</em>}
                        </div>
                      )}
                    </div>
                    <div className="row" style={{ gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      {!isEditing && (
                        <>
                          <button
                            className="btn sm secondary"
                            onClick={() => startEdit(i, 'qa')}
                            disabled={!!editing}
                          >
                            수정
                          </button>
                          <button
                            className="btn sm danger"
                            onClick={() => remove(i)}
                            disabled={!!editing}
                          >
                            삭제
                          </button>
                        </>
                      )}
                      {!isEditing && <span className={`chevron ${open ? 'open' : ''}`}>›</span>}
                    </div>
                  </div>

                  <div className="print-only qa-print">
                    <div className="print-text"><strong>Q{i + 1}.</strong> {q.question}</div>
                    {q.questionKo && <div className="print-text print-muted">{q.questionKo}</div>}
                    {q.answer && <div className="print-text" style={{ marginTop: 4 }}><strong>A.</strong> {q.answer}</div>}
                    {q.answerKo && <div className="print-text print-muted">{q.answerKo}</div>}
                  </div>

                  {open && (
                    <div className="accordion-body no-print">
                      {isEditing ? (
                        <>
                          <div className="form-group">
                            <label>질문 (한글 해석)</label>
                            <input
                              type="text"
                              value={shown.questionKo}
                              onChange={(e) => setDraft({ ...draft, questionKo: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>답변 (영어)</label>
                            <textarea
                              style={{ minHeight: 60 }}
                              value={shown.answer}
                              onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>답변 (한글 해석)</label>
                            <textarea
                              style={{ minHeight: 60 }}
                              value={shown.answerKo}
                              onChange={(e) => setDraft({ ...draft, answerKo: e.target.value })}
                            />
                          </div>
                          <div className="row end" style={{ gap: 8 }}>
                            <button className="btn secondary sm" onClick={cancelEdit}>취소</button>
                            <button className="btn sm" onClick={saveEdit}>저장</button>
                          </div>
                        </>
                      ) : (
                        <div className="view-block" onClick={() => !editing && startEdit(i, 'qa')}>
                          <div className="view-row">
                            <div className="view-label">질문 (한글)</div>
                            <div className="view-value">{q.questionKo || <em className="placeholder">없음</em>}</div>
                          </div>
                          <div className="view-row">
                            <div className="view-label">답변 (영어)</div>
                            <div className="view-value">{q.answer || <em className="placeholder">없음</em>}</div>
                          </div>
                          <div className="view-row">
                            <div className="view-label">답변 (한글)</div>
                            <div className="view-value">{q.answerKo || <em className="placeholder">없음</em>}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

