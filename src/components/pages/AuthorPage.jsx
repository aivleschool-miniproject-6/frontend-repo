import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BookCard from '../list/components/BookCard'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const s = {
  page: { minHeight: 'calc(100vh - 64px)', background: '#eeece6' },
  topbar: {
    background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.12)',
    padding: '0 20px', height: 52, display: 'flex', alignItems: 'center',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
    color: '#6b6b67', background: 'none', border: 'none', cursor: 'pointer',
  },
  inner: { padding: 24 },
  wrap: { maxWidth: 980, margin: '0 auto' },
  profileCard: {
    background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14, padding: 28, marginBottom: 24,
    display: 'flex', alignItems: 'center', gap: 24,
  },
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    background: '#1a1a18', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700, flexShrink: 0,
  },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: { fontSize: 22, fontWeight: 700, color: '#1a1a18', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: '#6b6b67' },
  followBtn: (following) => ({
    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
    border: following ? '0.5px solid rgba(0,0,0,0.22)' : 'none',
    background: following ? '#fff' : '#1a1a18',
    color: following ? '#1a1a18' : '#fff',
    flexShrink: 0,
  }),
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 16 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 16,
  },
  status: { padding: 60, textAlign: 'center', color: '#6b6b67', fontSize: 14 },
  emptyState: { textAlign: 'center', padding: '40px 0', color: '#6b6b67', fontSize: 14 },
}

export default function AuthorPage() {
  const { authorId } = useParams()
  const navigate = useNavigate()
  const { user, token, isLoggedIn } = useAuth()

  const [author, setAuthor] = useState(null)
  const [books, setBooks] = useState([])
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  const isMyPage = user?.userId === Number(authorId)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const requests = [
        fetch(`${API_BASE}/users/${authorId}`),
        fetch(`${API_BASE}/books`),
      ]
      if (isLoggedIn && !isMyPage) {
        requests.push(
          fetch(`${API_BASE}/users/followings`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      }

      const results = await Promise.all(requests)
      const [authorRes, booksRes] = results

      if (!authorRes.ok) throw new Error('작가 정보를 불러올 수 없습니다.')
      if (!booksRes.ok) throw new Error('도서 목록을 불러올 수 없습니다.')

      const authorData = await authorRes.json()
      const allBooks = await booksRes.json()
      const authorBooks = allBooks.filter((b) => b.authorId === Number(authorId))

      setAuthor(authorData)
      setBooks(authorBooks)

      if (isLoggedIn && !isMyPage && results[2]?.ok) {
        const followings = await results[2].json()
        setFollowing(followings.some((f) => f.followingId === Number(authorId)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [authorId, isLoggedIn, isMyPage, token])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData() }, [loadData])

  const handleFollow = async () => {
    if (!isLoggedIn) { navigate('/login'); return }
    try {
      setFollowLoading(true)
      const res = await fetch(`${API_BASE}/authors/${authorId}/follows`, {
        method: following ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setFollowing((prev) => !prev)
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.topbar}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <i className="ti ti-arrow-left" /> 뒤로가기
          </button>
        </div>
        <div style={s.status}>
          <i className="ti ti-loader-2" style={{ fontSize: 38, display: 'block', marginBottom: 12, color: '#9b9b95' }} />
          불러오는 중...
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left" /> 뒤로가기
        </button>
      </div>

      <div style={s.inner}>
        <div style={s.wrap}>
          <div style={s.profileCard}>
            <div style={s.avatar}>
              {author?.nickname?.slice(0, 1).toUpperCase() ?? '?'}
            </div>
            <div style={s.profileInfo}>
              <div style={s.profileName}>{author?.nickname ?? '알 수 없음'}</div>
              <div style={s.profileEmail}>{author?.email}</div>
            </div>
            {!isMyPage && (
              <button
                style={s.followBtn(following)}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {following ? '팔로잉' : '팔로우'}
              </button>
            )}
          </div>

          <div style={s.sectionTitle}>등록 도서 ({books.length})</div>

          {books.length > 0 ? (
            <div style={s.grid}>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => navigate(`/books/${book.id}`)}
                />
              ))}
            </div>
          ) : (
            <div style={s.emptyState}>
              <i className="ti ti-book-off" style={{ fontSize: 32, display: 'block', marginBottom: 10, color: '#9b9b95' }} />
              등록된 도서가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
