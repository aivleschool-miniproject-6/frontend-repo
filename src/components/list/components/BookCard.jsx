import styles from './BookCard.module.css'

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

export default function BookCard({ book, rank, onClick, onDelete }) {
  const { bg, ic } = getCoverColor(book.genre)

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cover} style={{ background: bg }}>
        {rank && <span className={styles.rank}>{rank}</span>}
        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete() }}
          title="삭제"
        >
          <i className="ti ti-trash" />
        </button>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} className={styles.coverImg} />
        ) : (
          <i className="ti ti-book" style={{ fontSize: 90, color: ic }} />
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.genre}>{book.genre}</span>
        <div className={styles.title}>{book.title}</div>
        <div className={styles.author}>{book.author} · {book.publisher}</div>
        <div className={styles.bottom}>
          <span className={styles.price}>{book.price?.toLocaleString()}원</span>
          <span className={styles.date}>{fmtDate(book.pubDate)}</span>
        </div>
      </div>
    </div>
  )
}
