import { useState } from 'react'
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

export default function BookCard({ book, rank, onClick, onDelete, favoriteTop = false }) {
  const { bg, ic } = getCoverColor(book.genre)
  const [favorite, setFavorite] = useState(
    () => localStorage.getItem(`bookFavorite:${book.id}`) === 'true'
  )

  const handleFavorite = (e) => {
    e.stopPropagation()
    const next = !favorite
    setFavorite(next)
    localStorage.setItem(`bookFavorite:${book.id}`, String(next))
    window.dispatchEvent(new Event('bookFavoriteChange'))
  }

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cover} style={{ background: bg }}>
        {rank && <span className={styles.rank}>{rank}</span>}
        {!favoriteTop && (
          <button
            className={styles.deleteBtn}
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete() }}
            title="삭제"
          >
            <i className="ti ti-trash" />
          </button>
        )}
        <button
          className={`${favoriteTop ? styles.favoriteBtnTop : styles.favoriteBtn} ${favorite ? styles.favoriteBtnActive : ''}`}
          onClick={handleFavorite}
          title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <i className={`ti ${favorite ? 'ti-star-filled' : 'ti-star'}`} />
        </button>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} className={styles.coverImg} />
        ) : (
          <i className="ti ti-book" style={{ fontSize: 90, color: ic }} />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.genreRow}>
          <span className={styles.genre} style={{ background: bg, color: ic }}>{book.genre}</span>
          {book.averageRating != null && (
            <div className={styles.rating}>
              <i className="ti ti-star-filled" style={{ fontSize: 11, color: '#f59e0b' }} />
              <span className={styles.ratingScore}>{book.averageRating.toFixed(1)}</span>
              <span className={styles.ratingCount}>({book.ratingCount})</span>
            </div>
          )}
        </div>
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
