import { useState } from 'react'
import styles from './BookCard.module.css'
import { useAuth } from '../../../context/AuthContext'
import { getCoverColor, fmtDate } from './bookCardUtils'

export default function BookCard({ book, rank, onClick, onDelete, favoriteTop = false }) {
  const { bg, ic } = getCoverColor(book.genre)
  const { user } = useAuth()
  const favKey = `bookFavorite:${user?.userId ?? 'guest'}:${book.id}`
  const [favorite, setFavorite] = useState(() => localStorage.getItem(favKey) === 'true')

  const handleFavorite = (e) => {
    e.stopPropagation()
    const next = !favorite
    setFavorite(next)
    localStorage.setItem(favKey, String(next))
    window.dispatchEvent(new Event('bookFavoriteChange'))
  }

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cover} style={{ background: bg }}>
        {rank && <span className={styles.rank}>{rank}</span>}
        {!favoriteTop && book.authorId === user?.userId && (
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
