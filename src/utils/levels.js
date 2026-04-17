export const LEVELS = [
  { value: 'starter', label: 'Starter', desc: '영어 입문 단계' },
  { value: 'basic', label: 'Basic', desc: '기초 단계' },
  { value: 'intermediate', label: 'Intermediate', desc: '중급 단계' },
  { value: 'advanced', label: 'Advanced', desc: '고급 단계' },
]

export const LEVEL_LABEL = LEVELS.reduce((acc, l) => {
  acc[l.value] = l.label
  return acc
}, {})

// backward compat for older data
const LEGACY_MAP = {
  kindergarten: 'starter',
  elementary_low: 'basic',
  elementary_high: 'intermediate',
}

export function normalizeLevel(level) {
  if (!level) return 'starter'
  if (LEVEL_LABEL[level]) return level
  return LEGACY_MAP[level] || 'starter'
}
