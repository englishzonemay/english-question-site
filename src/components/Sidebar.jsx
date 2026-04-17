import { useState, useMemo, useRef } from 'react'

export default function Sidebar({
  series,
  classes,
  selection,
  searchQuery,
  onSelectHome,
  onSelectSeries,
  onSelectBook,
  onSelectUnit,
  onSelectClass,
  onAddSeries,
  onAddBook,
  onAddClass,
  onDeleteSeries,
  onDeleteBook,
  onDeleteClass,
  onRenameSeries,
  onRenameBook,
  onRenameUnit,
  onRenameClass,
  onReorderSeries,
  onReorderBooks,
  onReorderUnits,
}) {
  const [expanded, setExpanded] = useState(() => {
    const init = {}
    series.forEach((s) => { init[s.id] = true })
    return init
  })
  const [editing, setEditing] = useState(null) // {type, seriesId, bookId, unitId}
  const dragInfo = useRef(null) // {scope, index}

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  const query = searchQuery.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!query) return null
    const results = []
    series.forEach((s) => {
      if (s.name.toLowerCase().includes(query)) results.push({ type: 'series', series: s })
      s.books.forEach((b) => {
        if (b.name.toLowerCase().includes(query)) results.push({ type: 'book', series: s, book: b })
        b.units.forEach((u) => {
          if (u.title.toLowerCase().includes(query)) {
            results.push({ type: 'unit', series: s, book: b, unit: u })
          }
        })
      })
    })
    return results
  }, [query, series])

  const handleDragStart = (e, scope, index) => {
    dragInfo.current = { scope, index }
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', String(index)) } catch {}
  }

  const handleDragOver = (e, scope) => {
    if (dragInfo.current?.scope === scope) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (e, scope, toIndex, onReorder) => {
    e.preventDefault()
    const info = dragInfo.current
    if (!info || info.scope !== scope) return
    if (info.index !== toIndex) onReorder(info.index, toIndex)
    dragInfo.current = null
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo" onClick={onSelectHome}>
          <div>
            <div className="logo-text">English Zone</div>
            <div className="logo-sub">질문지 생성기</div>
          </div>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="btn secondary sm block" onClick={onAddSeries}>
          + 시리즈 추가
        </button>
      </div>

      <div className="sidebar-section-title">교재</div>

      <div className="sidebar-tree">
        {searchResults !== null ? (
          <SearchResults
            results={searchResults}
            query={query}
            onSelectSeries={onSelectSeries}
            onSelectBook={onSelectBook}
            onSelectUnit={onSelectUnit}
          />
        ) : series.length === 0 ? (
          <div className="tree-empty">
            시리즈를 추가해서<br />시작하세요
          </div>
        ) : (
          series.map((s, sIdx) => {
            const open = expanded[s.id]
            const seriesActive = selection.type === 'series' && selection.seriesId === s.id
            const seriesScope = 'series'
            const seriesEditing = editing?.type === 'series' && editing.seriesId === s.id

            return (
              <div
                key={s.id}
                className="tree-series"
                draggable={!seriesEditing}
                onDragStart={(e) => handleDragStart(e, seriesScope, sIdx)}
                onDragOver={(e) => handleDragOver(e, seriesScope)}
                onDrop={(e) => handleDrop(e, seriesScope, sIdx, onReorderSeries)}
              >
                <TreeRow
                  className={`series ${seriesActive ? 'active' : ''}`}
                  onClick={() => { toggle(s.id); onSelectSeries(s.id) }}
                  isEditing={seriesEditing}
                  value={s.name}
                  onSaveEdit={(v) => { onRenameSeries(s.id, v); setEditing(null) }}
                  onCancelEdit={() => setEditing(null)}
                  icon={<span className={`chevron ${open ? 'open' : ''}`}>▶</span>}
                  name={s.name}
                  actions={[
                    { label: '✏️', title: '이름 수정', onClick: () => setEditing({ type: 'series', seriesId: s.id }) },
                    { label: '✕', title: '삭제', danger: true, onClick: () => {
                      if (confirm(`시리즈 "${s.name}"을 삭제할까요? 내부의 모든 책도 삭제됩니다.`)) onDeleteSeries(s.id)
                    }},
                  ]}
                />

                {open && (
                  <div className="tree-children">
                    {s.books.map((b, bIdx) => {
                      const bookActive = selection.bookId === b.id
                      const bookOpen = expanded[b.id]
                      const bookScope = `books:${s.id}`
                      const bookEditing = editing?.type === 'book' && editing.bookId === b.id

                      return (
                        <div
                          key={b.id}
                          draggable={!bookEditing}
                          onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, bookScope, bIdx) }}
                          onDragOver={(e) => handleDragOver(e, bookScope)}
                          onDrop={(e) => {
                            e.stopPropagation()
                            handleDrop(e, bookScope, bIdx, (from, to) => onReorderBooks(s.id, from, to))
                          }}
                        >
                          <TreeRow
                            className={`book ${bookActive && selection.type === 'book' ? 'active' : ''}`}
                            onClick={() => { toggle(b.id); onSelectBook(s.id, b.id) }}
                            isEditing={bookEditing}
                            value={b.name}
                            onSaveEdit={(v) => { onRenameBook(s.id, b.id, v); setEditing(null) }}
                            onCancelEdit={() => setEditing(null)}
                            icon={<span className={`chevron ${bookOpen ? 'open' : ''}`}>▶</span>}
                            name={b.name}
                            actions={[
                              { label: '✏️', onClick: () => setEditing({ type: 'book', bookId: b.id }) },
                              { label: '✕', danger: true, onClick: () => {
                                if (confirm(`"${b.name}"을 삭제할까요?`)) onDeleteBook(s.id, b.id)
                              }},
                            ]}
                          />

                          {bookOpen && b.units.map((u, uIdx) => {
                            const unitActive = selection.unitId === u.id
                            const unitScope = `units:${b.id}`
                            const unitEditing = editing?.type === 'unit' && editing.unitId === u.id

                            return (
                              <div
                                key={u.id}
                                draggable={!unitEditing}
                                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, unitScope, uIdx) }}
                                onDragOver={(e) => handleDragOver(e, unitScope)}
                                onDrop={(e) => {
                                  e.stopPropagation()
                                  handleDrop(e, unitScope, uIdx, (from, to) => onReorderUnits(s.id, b.id, from, to))
                                }}
                              >
                                <TreeRow
                                  className={`unit ${unitActive ? 'active' : ''}`}
                                  onClick={() => onSelectUnit(s.id, b.id, u.id)}
                                  isEditing={unitEditing}
                                  value={u.title}
                                  onSaveEdit={(v) => { onRenameUnit(s.id, b.id, u.id, v); setEditing(null) }}
                                  onCancelEdit={() => setEditing(null)}
                                  name={<>Unit {u.number}. {u.title}</>}
                                  actions={[
                                    { label: '✏️', onClick: () => setEditing({ type: 'unit', unitId: u.id }) },
                                  ]}
                                />
                              </div>
                            )
                          })}

                          {bookOpen && b.units.length === 0 && (
                            <div className="tree-node unit" style={{ color: 'var(--text-light)', cursor: 'default' }}>
                              Unit 없음
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div
                      className="tree-node book"
                      style={{ color: 'var(--text-muted)', fontSize: 12.5 }}
                      onClick={() => onAddBook(s.id)}
                    >
                      <span style={{ width: 10 }}></span>
                      <span>+ 책 추가</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {!searchResults && (
          <>
            <div className="sidebar-section-title" style={{ marginTop: 18 }}>반 관리</div>
            {classes.length === 0 ? (
              <div className="tree-empty" style={{ padding: '14px 10px', fontSize: 12 }}>
                반이 없어요
              </div>
            ) : (
              classes.map((c) => {
                const active = selection.type === 'class' && selection.classId === c.id
                const classEditing = editing?.type === 'class' && editing.classId === c.id
                return (
                  <TreeRow
                    key={c.id}
                    className={`series ${active ? 'active' : ''}`}
                    onClick={() => onSelectClass(c.id)}
                    isEditing={classEditing}
                    value={c.name}
                    onSaveEdit={(v) => { onRenameClass(c.id, v); setEditing(null) }}
                    onCancelEdit={() => setEditing(null)}
                    icon={<span style={{ width: 10 }}></span>}
                    name={<>{c.name} <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 400 }}>· {c.students.length}명</span></>}
                    actions={[
                      { label: '✏️', title: '이름 수정', onClick: () => setEditing({ type: 'class', classId: c.id }) },
                      { label: '✕', title: '삭제', danger: true, onClick: () => {
                        if (confirm(`"${c.name}"을 삭제할까요?`)) onDeleteClass(c.id)
                      }},
                    ]}
                  />
                )
              })
            )}
            <div style={{ padding: '6px 10px 0' }}>
              <button className="btn secondary sm block" onClick={onAddClass}>
                + 반 추가
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

function TreeRow({
  className, onClick, isEditing, value, onSaveEdit, onCancelEdit,
  icon, name, actions = [],
}) {
  const [v, setV] = useState(value)

  if (isEditing) {
    return (
      <div className={`tree-node ${className}`} onClick={(e) => e.stopPropagation()}>
        {icon}
        <input
          className="tree-edit-input"
          autoFocus
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { if (v.trim()) onSaveEdit(v.trim()) }
            if (e.key === 'Escape') onCancelEdit()
          }}
          onBlur={() => { if (v.trim() && v !== value) onSaveEdit(v.trim()); else onCancelEdit() }}
        />
      </div>
    )
  }

  return (
    <div className={`tree-node ${className}`} onClick={onClick}>
      {icon}
      <span className="name">{name}</span>
      <span className="tree-actions">
        {actions.map((a, i) => (
          <button
            key={i}
            className={`tree-action ${a.danger ? 'danger' : ''}`}
            title={a.title || a.label}
            disabled={a.disabled}
            onClick={(e) => { e.stopPropagation(); a.onClick() }}
          >
            {a.label}
          </button>
        ))}
      </span>
    </div>
  )
}

function Highlight({ text, query }) {
  if (!query) return text
  const i = text.toLowerCase().indexOf(query)
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: '#FFE066', color: 'inherit', padding: 0 }}>
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  )
}

function SearchResults({ results, query, onSelectSeries, onSelectBook, onSelectUnit }) {
  if (results.length === 0) {
    return (
      <div className="tree-empty">
        "{query}"에 대한<br />검색 결과가 없습니다
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '8px 10px 6px', fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        검색 결과 {results.length}개
      </div>
      {results.map((r, idx) => {
        if (r.type === 'series') {
          return (
            <div key={`s-${r.series.id}-${idx}`} className="tree-node series" onClick={() => onSelectSeries(r.series.id)}>
              <span className="name"><Highlight text={r.series.name} query={query} /></span>
            </div>
          )
        }
        if (r.type === 'book') {
          return (
            <div key={`b-${r.book.id}-${idx}`} className="tree-node book" onClick={() => onSelectBook(r.series.id, r.book.id)} style={{ paddingLeft: 10 }}>
              <span className="name">
                <Highlight text={r.book.name} query={query} />
                <span style={{ fontSize: 11, color: 'var(--text-light)', marginLeft: 6 }}>· {r.series.name}</span>
              </span>
            </div>
          )
        }
        return (
          <div key={`u-${r.unit.id}-${idx}`} className="tree-node unit" onClick={() => onSelectUnit(r.series.id, r.book.id, r.unit.id)} style={{ paddingLeft: 10 }}>
            <span className="name">
              Unit {r.unit.number}. <Highlight text={r.unit.title} query={query} />
              <span style={{ fontSize: 11, color: 'var(--text-light)', marginLeft: 6, display: 'block' }}>
                {r.series.name} / {r.book.name}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
