import { useEffect, useState } from 'react'
import { loadData, saveData, uid, moveInArray, reorderArray } from './utils/storage'
import Sidebar from './components/Sidebar'
import SeriesForm from './components/SeriesForm'
import BookForm from './components/BookForm'
import UnitForm from './components/UnitForm'
import ClassForm from './components/ClassForm'
import StudentForm from './components/StudentForm'
import ProgressForm from './components/ProgressForm'
import HomeView from './components/HomeView'
import SeriesView from './components/SeriesView'
import BookView from './components/BookView'
import ClassView from './components/ClassView'
import UnitDetail from './components/UnitDetail'
import BackupButtons from './components/BackupButtons'

export default function App() {
  const [data, setData] = useState({ series: [], classes: [] })
  const [selection, setSelection] = useState({ type: 'home' })
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [showBookForm, setShowBookForm] = useState(false)
  const [bookFormDefaultSeries, setBookFormDefaultSeries] = useState(null)
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [showClassForm, setShowClassForm] = useState(false)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [progressFormStudent, setProgressFormStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setData(loadData()) }, [])

  useEffect(() => {
    window.history.replaceState({ selection: { type: 'home' } }, '')
    const onPop = (e) => {
      const s = e.state?.selection || { type: 'home' }
      setSelection(s)
      setSearchQuery('')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (next) => {
    window.history.pushState({ selection: next }, '')
    setSelection(next)
  }

  const persist = (next) => { setData(next); saveData(next) }

  const seriesList = data.series || []
  const classList = data.classes || []
  const series = seriesList.find((s) => s.id === selection.seriesId)
  const book = (series?.books || []).find((b) => b.id === selection.bookId)
  const unit = (book?.units || []).find((u) => u.id === selection.unitId)
  const classItem = classList.find((c) => c.id === selection.classId)

  const addSeries = (name) => {
    const s = { id: uid(), name, createdAt: Date.now(), books: [] }
    persist({ ...data, series: [...data.series, s] })
    setShowSeriesForm(false)
    navigate({ type: 'series', seriesId: s.id })
  }

  const renameSeries = (id, name) => {
    persist({
      ...data,
      series: data.series.map((s) => (s.id === id ? { ...s, name } : s)),
    })
  }

  const renameBook = (seriesId, bookId, name) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== seriesId ? s : {
          ...s,
          books: s.books.map((b) => (b.id === bookId ? { ...b, name } : b)),
        },
      ),
    })
  }

  const renameUnit = (seriesId, bookId, unitId, title) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== seriesId ? s : {
          ...s,
          books: s.books.map((b) =>
            b.id !== bookId ? b : {
              ...b,
              units: b.units.map((u) => (u.id === unitId ? { ...u, title } : u)),
            },
          ),
        },
      ),
    })
  }

  const moveSeries = (id, dir) => {
    const idx = data.series.findIndex((s) => s.id === id)
    persist({ ...data, series: moveInArray(data.series, idx, dir) })
  }

  const moveBook = (seriesId, bookId, dir) => {
    persist({
      ...data,
      series: data.series.map((s) => {
        if (s.id !== seriesId) return s
        const idx = s.books.findIndex((b) => b.id === bookId)
        return { ...s, books: moveInArray(s.books, idx, dir) }
      }),
    })
  }

  const moveUnit = (seriesId, bookId, unitId, dir) => {
    persist({
      ...data,
      series: data.series.map((s) => {
        if (s.id !== seriesId) return s
        return {
          ...s,
          books: s.books.map((b) => {
            if (b.id !== bookId) return b
            const idx = b.units.findIndex((u) => u.id === unitId)
            return { ...b, units: moveInArray(b.units, idx, dir) }
          }),
        }
      }),
    })
  }

  const reorderSeries = (fromIdx, toIdx) => {
    persist({ ...data, series: reorderArray(data.series, fromIdx, toIdx) })
  }

  const reorderBooks = (seriesId, fromIdx, toIdx) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== seriesId ? s : { ...s, books: reorderArray(s.books, fromIdx, toIdx) },
      ),
    })
  }

  const reorderUnits = (seriesId, bookId, fromIdx, toIdx) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== seriesId ? s : {
          ...s,
          books: s.books.map((b) =>
            b.id !== bookId ? b : { ...b, units: reorderArray(b.units, fromIdx, toIdx) },
          ),
        },
      ),
    })
  }

  const renameClass = (id, name) => {
    persist({
      ...data,
      classes: data.classes.map((c) => (c.id === id ? { ...c, name } : c)),
    })
  }

  const renameStudent = (studentId, name) => {
    persist({
      ...data,
      classes: data.classes.map((c) =>
        c.id !== selection.classId ? c : {
          ...c,
          students: c.students.map((st) => (st.id === studentId ? { ...st, name } : st)),
        },
      ),
    })
  }

  const deleteSeries = (id) => {
    persist({ ...data, series: data.series.filter((s) => s.id !== id) })
    if (selection.seriesId === id) navigate({ type: 'home' })
  }

  const openBookForm = (seriesId = null) => {
    if (data.series.length === 0) {
      alert('먼저 시리즈를 추가해주세요.')
      setShowSeriesForm(true)
      return
    }
    setBookFormDefaultSeries(seriesId)
    setShowBookForm(true)
  }

  const addBook = (seriesId, bk) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id === seriesId ? { ...s, books: [...s.books, bk] } : s,
      ),
    })
    setShowBookForm(false)
    navigate({ type: 'book', seriesId, bookId: bk.id })
  }

  const deleteBook = (seriesId, bookId) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id === seriesId ? { ...s, books: s.books.filter((b) => b.id !== bookId) } : s,
      ),
    })
    if (selection.bookId === bookId) navigate({ type: 'series', seriesId })
  }

  const addUnit = (newUnit) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== selection.seriesId ? s : {
          ...s,
          books: s.books.map((b) =>
            b.id !== selection.bookId ? b : { ...b, units: [...b.units, newUnit] },
          ),
        },
      ),
    })
    setShowUnitForm(false)
    navigate({ ...selection, type: 'unit', unitId: newUnit.id })
  }

  const updateUnit = (updatedUnit) => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== selection.seriesId ? s : {
          ...s,
          books: s.books.map((b) =>
            b.id !== selection.bookId ? b : {
              ...b,
              units: b.units.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)),
            },
          ),
        },
      ),
    })
  }

  const deleteUnit = () => {
    persist({
      ...data,
      series: data.series.map((s) =>
        s.id !== selection.seriesId ? s : {
          ...s,
          books: s.books.map((b) =>
            b.id !== selection.bookId ? b : {
              ...b,
              units: b.units.filter((u) => u.id !== selection.unitId),
            },
          ),
        },
      ),
    })
    navigate({ type: 'book', seriesId: selection.seriesId, bookId: selection.bookId })
  }

  // Class / student
  const addClass = (name) => {
    const c = { id: uid(), name, createdAt: Date.now(), students: [] }
    persist({ ...data, classes: [...data.classes, c] })
    setShowClassForm(false)
    navigate({ type: 'class', classId: c.id })
  }

  const deleteClass = (id) => {
    persist({ ...data, classes: data.classes.filter((c) => c.id !== id) })
    if (selection.classId === id) navigate({ type: 'home' })
  }

  const addStudent = (name) => {
    persist({
      ...data,
      classes: data.classes.map((c) =>
        c.id !== selection.classId ? c : {
          ...c,
          students: [...c.students, { id: uid(), name, seriesId: '', bookId: '', unitId: '' }],
        },
      ),
    })
    setShowStudentForm(false)
  }

  const deleteStudent = (studentId) => {
    persist({
      ...data,
      classes: data.classes.map((c) =>
        c.id !== selection.classId ? c : {
          ...c,
          students: c.students.filter((st) => st.id !== studentId),
        },
      ),
    })
  }

  const saveProgress = (progress) => {
    const studentId = progressFormStudent.id
    persist({
      ...data,
      classes: data.classes.map((c) =>
        c.id !== selection.classId ? c : {
          ...c,
          students: c.students.map((st) =>
            st.id === studentId ? { ...st, ...progress } : st,
          ),
        },
      ),
    })
    setProgressFormStudent(null)
  }

  const openStudentUnit = (st) => {
    navigate({
      type: 'unit',
      seriesId: st.seriesId,
      bookId: st.bookId,
      unitId: st.unitId,
      initialTab: 'questions',
      fromClassId: selection.classId,
    })
  }

  const closeSidebar = () => setSidebarOpen(false)
  const navAndClose = (fn) => (...args) => { fn(...args); closeSidebar() }

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <Sidebar
        series={seriesList}
        classes={classList}
        selection={selection}
        searchQuery={searchQuery}
        onSelectHome={navAndClose(() => { setSearchQuery(''); navigate({ type: 'home' }) })}
        onSelectSeries={navAndClose((id) => { setSearchQuery(''); navigate({ type: 'series', seriesId: id }) })}
        onSelectBook={navAndClose((sid, bid) => { setSearchQuery(''); navigate({ type: 'book', seriesId: sid, bookId: bid }) })}
        onSelectUnit={navAndClose((sid, bid, uid) => { setSearchQuery(''); navigate({ type: 'unit', seriesId: sid, bookId: bid, unitId: uid }) })}
        onSelectClass={navAndClose((id) => { setSearchQuery(''); navigate({ type: 'class', classId: id }) })}
        onAddSeries={() => setShowSeriesForm(true)}
        onAddBook={(sid) => openBookForm(sid)}
        onAddClass={() => setShowClassForm(true)}
        onDeleteSeries={deleteSeries}
        onDeleteBook={deleteBook}
        onDeleteClass={deleteClass}
        onRenameSeries={renameSeries}
        onRenameBook={renameBook}
        onRenameUnit={renameUnit}
        onRenameClass={renameClass}
        onReorderSeries={reorderSeries}
        onReorderBooks={reorderBooks}
        onReorderUnits={reorderUnits}
      />

      <main className="main">
        <div className="topbar no-print">
          <button className="hamburger" onClick={() => setSidebarOpen((v) => !v)} aria-label="메뉴">
            <span /><span /><span />
          </button>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="시리즈, 책, Unit 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Breadcrumb
              selection={selection}
              series={series}
              book={book}
              unit={unit}
              classItem={classItem}
              data={data}
              onHome={() => navigate({ type: 'home' })}
              onSeries={() => navigate({ type: 'series', seriesId: selection.seriesId })}
              onBook={() => navigate({ type: 'book', seriesId: selection.seriesId, bookId: selection.bookId })}
              onClass={(id) => navigate({ type: 'class', classId: id })}
            />
          </div>
          <BackupButtons data={data} onRestore={(next) => { persist(next); navigate({ type: 'home' }); setSearchQuery('') }} />
        </div>

        <div className="content">
          <div className="content-inner">
            {selection.type === 'home' && (
              <HomeView
                series={seriesList}
                onAddSeries={() => setShowSeriesForm(true)}
                onOpenBook={(sid, bid) => navigate({ type: 'book', seriesId: sid, bookId: bid })}
              />
            )}
            {selection.type === 'series' && series && (
              <SeriesView
                series={series}
                onAddBook={() => openBookForm(series.id)}
                onOpenBook={(bid) => navigate({ type: 'book', seriesId: series.id, bookId: bid })}
              />
            )}
            {selection.type === 'book' && book && (
              <BookView
                book={book}
                onOpenUnit={(uid) => navigate({ type: 'unit', seriesId: series.id, bookId: book.id, unitId: uid })}
                onAddUnit={() => setShowUnitForm(true)}
              />
            )}
            {selection.type === 'unit' && unit && (
              <UnitDetail
                book={book}
                unit={unit}
                initialTab={selection.initialTab}
                onUpdate={updateUnit}
                onDelete={deleteUnit}
              />
            )}
            {selection.type === 'class' && classItem && (
              <ClassView
                classItem={classItem}
                seriesList={seriesList}
                onAddStudent={() => setShowStudentForm(true)}
                onEditProgress={setProgressFormStudent}
                onOpenStudent={openStudentUnit}
                onDeleteStudent={deleteStudent}
                onRenameStudent={renameStudent}
              />
            )}
          </div>
        </div>
      </main>

      {showSeriesForm && (
        <SeriesForm onClose={() => setShowSeriesForm(false)} onSubmit={addSeries} />
      )}
      {showBookForm && (
        <BookForm
          series={seriesList}
          defaultSeriesId={bookFormDefaultSeries}
          onClose={() => setShowBookForm(false)}
          onSubmit={addBook}
        />
      )}
      {showUnitForm && book && (
        <UnitForm
          existingCount={book.units.length}
          onClose={() => setShowUnitForm(false)}
          onSubmit={addUnit}
        />
      )}
      {showClassForm && (
        <ClassForm onClose={() => setShowClassForm(false)} onSubmit={addClass} />
      )}
      {showStudentForm && (
        <StudentForm onClose={() => setShowStudentForm(false)} onSubmit={addStudent} />
      )}
      {progressFormStudent && (
        <ProgressForm
          student={progressFormStudent}
          seriesList={seriesList}
          onClose={() => setProgressFormStudent(null)}
          onSubmit={saveProgress}
        />
      )}
    </div>
  )
}

function Breadcrumb({ selection, series, book, unit, classItem, data, onHome, onSeries, onBook, onClass }) {
  const fromClass = selection.fromClassId
    ? data.classes.find((c) => c.id === selection.fromClassId)
    : null

  return (
    <div className="breadcrumb">
      <a onClick={onHome}>홈</a>
      {fromClass && selection.type === 'unit' && (
        <>
          <span className="sep">/</span>
          <a onClick={() => onClass(fromClass.id)}>{fromClass.name}</a>
        </>
      )}
      {classItem && (
        <>
          <span className="sep">/</span>
          <span className="current">{classItem.name}</span>
        </>
      )}
      {series && (
        <>
          <span className="sep">/</span>
          {selection.type === 'series' ? (
            <span className="current">{series.name}</span>
          ) : (
            <a onClick={onSeries}>{series.name}</a>
          )}
        </>
      )}
      {book && (
        <>
          <span className="sep">/</span>
          {selection.type === 'book' ? (
            <span className="current">{book.name}</span>
          ) : (
            <a onClick={onBook}>{book.name}</a>
          )}
        </>
      )}
      {unit && (
        <>
          <span className="sep">/</span>
          <span className="current">Unit {unit.number}. {unit.title}</span>
        </>
      )}
    </div>
  )
}
