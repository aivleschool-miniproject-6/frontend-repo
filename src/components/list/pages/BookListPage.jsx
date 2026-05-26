import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import BookListItem from '../components/BookListItem'
import styles from './BookListPage.module.css'

const API = 'http://localhost:5000/books'
const ALL = 'ALL'
const FAVORITES = 'FAVORITES'

function readFavoriteIds() {
  const ids = new Set()
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith('bookFavorite:') && localStorage.getItem(key) === 'true') {
      ids.add(key.replace('bookFavorite:', ''))
    }
  }
  return ids
}

export default function BookListPage({ onClickNew, onClickBook }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [genre, setGenre] = useState(ALL)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds())
  const [sortBy, setSortBy] = useState('register')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(API)
        if (!res.ok) throw new Error('네트워크 오류')
        const data = await res.json()
        setBooks(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const refresh = () => setFavoriteIds(readFavoriteIds())
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('bookFavoriteChange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('bookFavoriteChange', refresh)
    }
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제할까요?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    localStorage.removeItem(`bookFavorite:${id}`)
    setFavoriteIds(readFavoriteIds())
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase()
    return books.filter((book) => {
      const genreOk =
        genre === ALL || (genre === FAVORITES ? favoriteIds.has(String(book.id)) : book.genre === genre)
      const queryOk =
        !query ||
        book.title?.toLowerCase().includes(lowerQuery) ||
        book.author?.toLowerCase().includes(lowerQuery)
      return genreOk && queryOk
    })
  }, [books, genre, favoriteIds, query])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'title') return arr.sort((a, b) => a.title?.localeCompare(b.title || '', 'ko'))
    if (sortBy === 'price') return arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    return arr.sort((a, b) => Number(b.id) - Number(a.id))
  }, [filtered, sortBy])

  return (
    <div className={styles.shell}>
      <Sidebar genre={genre} books={books} favoriteIds={favoriteIds} onSelectGenre={setGenre} />

      <div className={styles.main}>
        <div className={styles.topbar}>
          <span className={styles.title}>{genre === ALL ? '전체 도서' : genre}</span>
          <div className={styles.searchWrap}>
            <i className={`ti ti-search ${styles.searchIcon}`} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="제목, 저자 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.subbar}>
          <div className={styles.subLeft}>
            <span className={styles.count}>총 {sorted.length}권</span>
            <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="register">등록순</option>
              <option value="title">제목순</option>
              <option value="price">가격순</option>
            </select>
          </div>
          <div className={styles.toggleWrap}>
            <button
              className={`${styles.toggleBtn} ${view === 'grid' ? styles.toggleActive : ''}`}
              onClick={() => setView('grid')}
              title="격자 보기"
            >
              <i className={`ti ti-layout-grid ${styles.toggleIcon}`} />
            </button>
            <button
              className={`${styles.toggleBtnLast} ${view === 'list' ? styles.toggleActive : ''}`}
              onClick={() => setView('list')}
              title="목록 보기"
            >
              <i className={`ti ti-menu-2 ${styles.toggleIcon}`} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {loading && <div className={styles.loading}>불러오는 중…</div>}
          {error && (
            <div className={styles.error}>
              오류: {error}
              <br />
              json-server가 실행 중인지 확인하세요.
            </div>
          )}
          {!loading && !error && sorted.length === 0 && (
            <div className={styles.empty}>
              <i className={`ti ti-book-off ${styles.emptyIcon}`} />
              결과가 없습니다.
            </div>
          )}

          {!loading && !error && view === 'grid' && (
            <div className={styles.gridArea}>
              {sorted.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  rank={i + 1}
                  onClick={() => onClickBook?.(book)}
                  onDelete={() => handleDelete(book.id)}
                />
              ))}
            </div>
          )}

          {!loading && !error && view === 'list' && (
            <div>
              {sorted.map((book, i) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  rank={i + 1}
                  onClick={() => onClickBook?.(book)}
                  onDelete={() => handleDelete(book.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
