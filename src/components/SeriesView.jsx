import { LEVEL_LABEL, normalizeLevel } from '../utils/levels'

export default function SeriesView({ series, onAddBook, onOpenBook }) {
  return (
    <div>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{series.name}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>
            책 {series.books.length}권
          </div>
        </div>
        <button className="btn" onClick={onAddBook}>+ 책 추가</button>
      </div>

      {series.books.length === 0 ? (
        <div className="card">
          <div className="empty">
            <p>이 시리즈에 아직 책이 없습니다.</p>
            <button className="btn" onClick={onAddBook}>첫 책 추가하기</button>
          </div>
        </div>
      ) : (
        <div className="grid">
          {series.books.map((b) => (
            <div key={b.id} className="book-card" onClick={() => onOpenBook(b.id)}>
              <h3>{b.name}</h3>
              <div className="meta">Unit {b.units.length}개</div>
              <div style={{ marginTop: 10 }}>
                <span className="badge">{LEVEL_LABEL[normalizeLevel(b.level)]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
