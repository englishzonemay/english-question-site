const KEY = 'english-zone-data'

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { series: [], classes: [] }
    const data = JSON.parse(raw)

    if (data.books && !data.series) {
      return {
        series: [
          {
            id: uid(),
            name: '기본 시리즈',
            createdAt: Date.now(),
            books: data.books,
          },
        ],
        classes: [],
      }
    }
    if (!data.series) return { series: [], classes: [] }
    if (!data.classes) data.classes = []
    return data
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
