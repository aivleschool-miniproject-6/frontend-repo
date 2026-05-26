// 장르별 커버 색상
const COVER_COLORS = {
  '소설':    { bg: '#E1F5EE', ic: '#0F6E56' },
  '인문':    { bg: '#FBEAF0', ic: '#993556' },
  '에세이':  { bg: '#EEEDFE', ic: '#534AB7' },
  '경제/경영': { bg: '#EAF3DE', ic: '#3B6D11' },
  'IT/컴퓨터': { bg: '#FAECE7', ic: '#993C1D' },
  '자기계발': { bg: '#F1EFE8', ic: '#5F5E5A' },
}
const DEFAULT_COLOR = { bg: '#E6F1FB', ic: '#185FA5' }

export function getCoverColor(genre) {
  return COVER_COLORS[genre] || DEFAULT_COLOR
}

export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  return `${y}년 ${parseInt(m)}월`
}

const styles = {
  card: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  cover: (bg) => ({
    width: '100%',
    height: 360,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }),
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  rank: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.22)',
    fontSize: 11,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#c0392b',
    fontSize: 14,
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  body: {
    padding: 12,
  },
  genre: {
    display: 'inline-block',
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 20,
    background: '#f5f5f4',
    color: '#6b6b67',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1a1a18',
    marginBottom: 3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  author: {
    fontSize: 11,
    color: '#6b6b67',
    marginBottom: 8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1a1a18',
  },
  date: {
    fontSize: 11,
    color: '#6b6b67',
  },
}

export default function BookCard({ book, rank, onClick, onDelete }) {
  const { bg, ic } = getCoverColor(book.genre)

  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)'
        e.currentTarget.querySelector('.del-btn').style.opacity = '1'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.querySelector('.del-btn').style.opacity = '0'
      }}
    >
      <div style={styles.cover(bg)}>
        {rank && <span style={styles.rank}>{rank}</span>}
        <button
          className="del-btn"
          style={styles.deleteBtn}
          onClick={e => { e.stopPropagation(); onDelete && onDelete() }}
          title="삭제"
        >
          <i className="ti ti-trash" />
        </button>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} style={styles.coverImg} />
        ) : (
          <i className="ti ti-book" style={{ fontSize: 90, color: ic }} />
        )}
      </div>
      <div style={styles.body}>
        <span style={styles.genre}>{book.genre}</span>
        <div style={styles.title}>{book.title}</div>
        <div style={styles.author}>{book.author} · {book.publisher}</div>
        <div style={styles.bottom}>
          <span style={styles.price}>{book.price?.toLocaleString()}원</span>
          <span style={styles.date}>{fmtDate(book.pubDate)}</span>
        </div>
      </div>
    </div>
  )
}
