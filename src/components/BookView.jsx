import { LEVEL_LABEL, normalizeLevel } from '../utils/levels'

export default function BookView({ book, onOpenUnit, onAddUnit }) {
  return (
    <div>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <div className="row" style={{ gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{book.name}</h1>
            <span className="badge">{LEVEL_LABEL[normalizeLevel(book.level)]}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>
            Unit {book.units.length}개
          </div>
        </div>
        <button className="btn" onClick={onAddUnit}>+ Unit 추가</button>
      </div>

      {book.units.length === 0 ? (
        <div className="card">
          <div className="empty">
            <p>아직 Unit이 없습니다.</p>
            <button className="btn" onClick={onAddUnit}>첫 Unit 추가</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          {book.units.map((unit) => (
            <div
              key={unit.id}
              onClick={() => onOpenUnit(unit.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                Unit {unit.number}. {unit.title}
              </div>
              <span style={{ color: 'var(--text-light)', fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
