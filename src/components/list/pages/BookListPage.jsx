import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import BookListItem from '../components/BookListItem'

const API = 'http://localhost:5000/books'

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

export default function BookListPage({ onClickNew }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [genre, setGenre] = useState('전체')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')

  // ── GET /books ──
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

  // ── DELETE /books/:id ──
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = books.filter((b) => {
    const genreOk = genre === '전체' || b.genre === genre
    const queryOk =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
    return genreOk && queryOk
  })

  return (
    <div style={styles.shell}>
      <Sidebar
        genre={genre}
        books={books}
        onSelectGenre={setGenre}
      />

      <div style={styles.main}>
        {/* 상단바 */}
        <div style={styles.topbar}>
          <span style={styles.title}>
            {genre === '전체' ? '전체 도서' : genre}
          </span>
          <div style={styles.searchWrap}>
            <i className="ti ti-search" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              type="text"
              placeholder="제목, 저자..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 서브바 */}
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
              title="크게 보기"
            >
              <i className="ti ti-layout-grid" style={{ fontSize: 16 }} />
            </button>
            <button
              style={styles.toggleBtnLast(view === 'list')}
              onClick={() => setView('list')}
              title="상세히 보기"
            >
              <i className="ti ti-menu-2" style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div style={styles.content}>
          {loading && <div style={styles.loading}>불러오는 중...</div>}
          {error && <div style={styles.error}>오류: {error}<br />json-server가 실행 중인지 확인하세요.</div>}
          {!loading && !error && filtered.length === 0 && (
            <div style={styles.empty}>
              <i className="ti ti-book-off" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
              해당 도서가 없습니다.
            </div>
          )}

          {!loading && !error && view === 'grid' && (
            <div style={styles.gridArea}>
              {filtered.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  rank={i + 1}
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
