const COVER_COLORS = {
  소설: { bg: '#E1F5EE', ic: '#0F6E56' },
  에세이: { bg: '#FBEAF0', ic: '#993556' },
  시: { bg: '#EEEDFE', ic: '#534AB7' },
  'IT/기술': { bg: '#FAECE7', ic: '#993C1D' },
  인문: { bg: '#F1EFE8', ic: '#5F5E5A' },
}
const DEFAULT_COLOR = { bg: '#E6F1FB', ic: '#185FA5' }

export function getCoverColor(genre) {
  return COVER_COLORS[genre] || DEFAULT_COLOR
}

export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  return `${y}.${parseInt(m, 10)}`
}
