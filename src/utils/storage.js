const KEY = 'english-zone-data'

function safeSeries(list) {
  return (Array.isArray(list) ? list : []).map((s) => ({
    ...s,
    books: (Array.isArray(s?.books) ? s.books : []).map((b) => ({
      ...b,
      units: Array.isArray(b?.units) ? b.units : [],
    })),
  }))
}

function safeClasses(list) {
  return (Array.isArray(list) ? list : []).map((c) => ({
    ...c,
    students: Array.isArray(c?.students) ? c.students : [],
  }))
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { series: [], classes: [] }
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return { series: [], classes: [] }

    if (data.books && !data.series) {
      return {
        series: safeSeries([
          {
            id: uid(),
            name: '기본 시리즈',
            createdAt: Date.now(),
            books: data.books,
          },
        ]),
        classes: [],
      }
    }
    return {
      series: safeSeries(data.series),
      classes: safeClasses(data.classes),
    }
  } catch {
    return { series: [], classes: [] }
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function moveInArray(arr, idx, dir) {
  const newIdx = idx + dir
  if (newIdx < 0 || newIdx >= arr.length) return arr
  const next = [...arr]
  ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
  return next
}

export function reorderArray(arr, fromIdx, toIdx) {
  if (fromIdx === toIdx || toIdx < 0 || toIdx >= arr.length) return arr
  const next = [...arr]
  const [item] = next.splice(fromIdx, 1)
  next.splice(toIdx, 0, item)
  return next
}
