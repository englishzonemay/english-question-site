import { LEVEL_LABEL, normalizeLevel } from '../utils/levels'

export default function HomeView({ series, onAddSeries, onOpenBook }) {
  const totalBooks = series.reduce((n, s) => n + s.books.length, 0)
  const totalUnits = series.reduce((n, s) => n + s.books.reduce((m, b) => m + b.units.length, 0), 0)

  const recentBooks = series
    .flatMap((s) => s.books.map((b) => ({ ...b, seriesId: s.id, seriesName: s.name })))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6)

  return (
    <div>
      <div className="hero">
        <div className="hero-text">
          <h1>English Zone</h1>
          <p>영어 수업 자료를 간편하게 관리하세요.</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="label">시리즈</div>
          <div className="value">{series.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">등록된 책</div>
          <div className="value">{totalBooks}</div>
        </div>
        <div className="stat-card">
          <div className="label">전체 Unit</div>
          <div className="value">{totalUnits}</div>
        </div>
      </div>

      <div className="section-title">
        <span>최근 추가된 책</span>
        {series.length === 0 && (
          <button className="btn sm" onClick={onAddSeries}>+ 시리즈 추가</button>
        )}
      </div>

      {recentBooks.length === 0 ? (
        <div className="card">
          <div className="empty">
            <p>아직 등록된 책이 없습니다.</p>
            <button className="btn" onClick={onAddSeries}>첫 시리즈 만들기</button>
          </div>
        </div>
      ) : (
        <div className="grid">
          {recentBooks.map((b) => (
            <div key={b.id} className="book-card" onClick={() => onOpenBook(b.seriesId, b.id)}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                {b.seriesName}
              </div>
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
