import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import BookListItem from '../components/BookListItem'

const API = 'http://localhost:5000/books'
const FAVORITES = '즐겨찾기'

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

const styles = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
    background: '#eeece6',
  },
  topbar: {
    background: '#fff',
    borderBottom: '0.5px solid rgba(0,0,0,0.12)',
    padding: '0 18px',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 500,
    color: '#1a1a18',
    flex: 1,
  },
  searchWrap: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 9,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 15,
    color: '#6b6b67',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '7px 10px 7px 30px',
    border: '0.5px solid rgba(0,0,0,0.22)',
    borderRadius: 8,
    fontSize: 13,
    background: '#f5f5f4',
    color: '#1a1a18',
    width: 180,
    outline: 'none',
  },
  subbar: {
    background: '#fff',
    borderBottom: '0.5px solid rgba(0,0,0,0.12)',
    padding: '0 18px',
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  subLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  cnt: {
    fontSize: 12,
    color: '#6b6b67',
  },
  sortSelect: {
    padding: '4px 8px',
    border: '0.5px solid rgba(0,0,0,0.22)',
    borderRadius: 8,
    fontSize: 12,
    background: '#fff',
    color: '#6b6b67',
    outline: 'none',
  },
  toggleWrap: {
    display: 'flex',
    border: '0.5px solid rgba(0,0,0,0.22)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: (active) => ({
    width: 34,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? '#f5f5f4' : 'none',
    border: 'none',
    borderRight: '0.5px solid rgba(0,0,0,0.22)',
    color: active ? '#1a1a18' : '#6b6b67',
    cursor: 'pointer',
  }),
  toggleBtnLast: (active) => ({
    width: 34,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? '#f5f5f4' : 'none',
    border: 'none',
    color: active ? '#1a1a18' : '#6b6b67',
    cursor: 'pointer',
  }),
  content: {
    flex: 1,
    overflowY: 'auto',
  },
  gridArea: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    padding: 18,
  },
  empty: {
    padding: 60,
    textAlign: 'center',
    color: '#6b6b67',
    fontSize: 13,
  },
  loading: {
    padding: 40,
    textAlign: 'center',
    color: '#6b6b67',
    fontSize: 13,
  },
  error: {
    padding: 40,
    textAlign: 'center',
    color: '#c0392b',
    fontSize: 13,
  },
}

export default function BookListPage({ onClickNew, onClickBook }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [genre, setGenre] = useState('전체')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds())

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(API)
        if (!res.ok) throw new Error('서버 오류')
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
    const refreshFavorites = () => setFavoriteIds(readFavoriteIds())

    window.addEventListener('focus', refreshFavorites)
    window.addEventListener('storage', refreshFavorites)
    window.addEventListener('bookFavoriteChange', refreshFavorites)
    refreshFavorites()

    return () => {
      window.removeEventListener('focus', refreshFavorites)
      window.removeEventListener('storage', refreshFavorites)
      window.removeEventListener('bookFavoriteChange', refreshFavorites)
    }
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    localStorage.removeItem(`bookFavorite:${id}`)
    setFavoriteIds(readFavoriteIds())
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = books.filter((book) => {
    const genreOk =
      genre === '전체' ||
      (genre === FAVORITES ? favoriteIds.has(String(book.id)) : book.genre === genre)
    const lowerQuery = query.toLowerCase()
    const queryOk =
      !query ||
      book.title?.toLowerCase().includes(lowerQuery) ||
      book.author?.toLowerCase().includes(lowerQuery)

    return genreOk && queryOk
  })

  return (
    <div style={styles.shell}>
      <Sidebar
        genre={genre}
        books={books}
        favoriteIds={favoriteIds}
        onSelectGenre={setGenre}
      />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <span style={styles.title}>
            {genre === '전체' ? '전체 도서' : genre}
          </span>
          <div style={styles.searchWrap}>
            <i className="ti ti-search" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              type="text"
              placeholder="제목, 저자 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.subbar}>
          <div style={styles.subLeft}>
            <span style={styles.cnt}>총 {filtered.length}권</span>
            <select style={styles.sortSelect}>
              <option>등록일순</option>
              <option>제목순</option>
              <option>가격순</option>
            </select>
          </div>
          <div style={styles.toggleWrap}>
            <button
              style={styles.toggleBtn(view === 'grid')}
              onClick={() => setView('grid')}
              title="격자 보기"
            >
              <i className="ti ti-layout-grid" style={{ fontSize: 16 }} />
            </button>
            <button
              style={styles.toggleBtnLast(view === 'list')}
              onClick={() => setView('list')}
              title="목록 보기"
            >
              <i className="ti ti-menu-2" style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {loading && <div style={styles.loading}>불러오는 중...</div>}
          {error && (
            <div style={styles.error}>
              오류: {error}
              <br />
              json-server가 실행 중인지 확인하세요.
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={styles.empty}>
              <i className="ti ti-book-off" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
              {genre === FAVORITES ? '즐겨찾기한 도서가 없습니다.' : '해당 도서가 없습니다.'}
            </div>
          )}

          {!loading && !error && view === 'grid' && (
            <div style={styles.gridArea}>
              {filtered.map((book, i) => (
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
              {filtered.map((book, i) => (
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
