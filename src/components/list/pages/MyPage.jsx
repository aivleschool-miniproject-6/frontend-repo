import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BookCard from '../components/BookCard'
import { useAuth } from '../../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

function readFavoriteBookIds(userId) {
  const prefix = `bookFavorite:${userId ?? 'guest'}:`
  const ids = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix) && localStorage.getItem(key) === 'true') {
      ids.push(key.replace(prefix, ''))
    }
  }
  return ids
}

const s = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#eeece6',
    padding: '24px',
  },
  wrap: {
    maxWidth: 980,
    margin: '0 auto',
  },
  profileCard: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14,
    padding: 28,
    marginBottom: 24,
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: 24,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: '#f5f5f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileIcon: {
    fontSize: 48,
    color: '#9b9b95',
  },
  profileInfo: {
    minWidth: 0,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a18',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b6b67',
  },
  tabContainer: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    borderBottom: '0.5px solid rgba(0,0,0,0.12)',
  },
  tab: (active) => ({
    padding: '14px 20px',
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    color: active ? '#1a1a18' : '#6b6b67',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #1a1a18' : 'none',
    cursor: 'pointer',
    marginBottom: -1,
  }),
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#6b6b67',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 38,
    display: 'block',
    marginBottom: 12,
    color: '#9b9b95',
  },
  authorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  authorCard: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer',
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#1a1a18',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    flexShrink: 0,
  },
  authorName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a18',
  },
  authorEmail: {
    fontSize: 12,
    color: '#6b6b67',
    marginTop: 2,
  },
  loadingState: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#6b6b67',
    fontSize: 14,
  },
  errorState: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#c0392b',
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 38,
    display: 'block',
    marginBottom: 12,
    color: '#c0392b',
  },
}

export default function MyPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, token } = useAuth()

  const [profile, setProfile] = useState(null)
  const [myBooks, setMyBooks] = useState([])
  const [favorites, setFavorites] = useState([])
  const [followings, setFollowings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('mybooks')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const authHeader = { Authorization: `Bearer ${token}` }

        // 내 프로필 + 전체 책 목록 + 즐겨찾기 ID 병렬 조회
        const favoriteIds = readFavoriteBookIds(user?.userId)

        const [profileRes, booksRes, followingsRes] = await Promise.all([
          fetch(`${API_BASE}/users/me`, { headers: authHeader }),
          fetch(`${API_BASE}/books`),
          fetch(`${API_BASE}/users/followings`, { headers: authHeader }),
        ])

        if (!profileRes.ok) throw new Error('사용자 정보를 불러올 수 없습니다.')
        if (!booksRes.ok) throw new Error('도서 목록을 불러올 수 없습니다.')

        const profileData = await profileRes.json()
        const allBooks = await booksRes.json()

        // 내 작품: authorId가 내 userId와 같은 책
        const mine = allBooks.filter((b) => b.authorId === profileData.userId)

        // 즐겨찾기: localStorage에 저장된 bookId로 책 정보 조회
        let favBooks = []
        if (favoriteIds.length > 0) {
          const favResults = await Promise.all(
            favoriteIds.map((id) =>
              fetch(`${API_BASE}/books/${id}`).then((r) => (r.ok ? r.json() : null))
            )
          )
          favBooks = favResults.filter(Boolean)
        }

        // 팔로잉 작가 정보 조회
        let followingAuthors = []
        if (followingsRes.ok) {
          const followingList = await followingsRes.json()
          const authorResults = await Promise.all(
            followingList.map((f) =>
              fetch(`${API_BASE}/users/${f.followingId}`).then((r) => (r.ok ? r.json() : null))
            )
          )
          followingAuthors = authorResults.filter(Boolean)
        }

        setProfile(profileData)
        setMyBooks(mine)
        setFavorites(favBooks)
        setFollowings(followingAuthors)
      } catch (err) {
        setError(err.message)
        console.error('마이페이지 데이터 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isLoggedIn, token, navigate])

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.wrap}>
          <div style={s.loadingState}>
            <i className="ti ti-loader-2" style={{ fontSize: 38, display: 'block', marginBottom: 12, color: '#9b9b95' }} />
            마이페이지를 불러오는 중입니다.
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={s.page}>
        <div style={s.wrap}>
          <div style={s.errorState}>
            <i className="ti ti-alert-circle" style={s.errorIcon} />
            {error}
          </div>
        </div>
      </div>
    )
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제할까요?')) return
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      alert('삭제에 실패했습니다.')
      return
    }
    localStorage.removeItem(`bookFavorite:${user?.userId ?? 'guest'}:${id}`)
    setMyBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const displayBooks = activeTab === 'mybooks' ? myBooks : favorites

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* 프로필 카드 */}
        {profile && (
          <div style={s.profileCard}>
            <div style={s.profileImage}>
              <i className="ti ti-user" style={s.profileIcon} />
            </div>
            <div style={s.profileInfo}>
              <div style={s.profileName}>{profile.nickname}</div>
              <div style={s.profileEmail}>{profile.email}</div>
            </div>
          </div>
        )}

        {/* 탭 */}
        <div style={s.tabContainer}>
          <button style={s.tab(activeTab === 'mybooks')} onClick={() => setActiveTab('mybooks')}>
            내 작품 ({myBooks.length})
          </button>
          <button style={s.tab(activeTab === 'favorites')} onClick={() => setActiveTab('favorites')}>
            즐겨찾기 ({favorites.length})
          </button>
          <button style={s.tab(activeTab === 'followings')} onClick={() => setActiveTab('followings')}>
            팔로잉 ({followings.length})
          </button>
        </div>

        {/* 도서 목록 */}
        {activeTab === 'followings' ? (
          followings.length > 0 ? (
            <div style={s.authorList}>
              {followings.map((author) => (
                <div
                  key={author.userId}
                  style={s.authorCard}
                  onClick={() => navigate(`/authors/${author.userId}`)}
                >
                  <div style={s.authorAvatar}>
                    {author.nickname?.slice(0, 1).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={s.authorName}>{author.nickname}</div>
                    <div style={s.authorEmail}>{author.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={s.emptyState}>
              <i className="ti ti-user-off" style={s.emptyIcon} />
              팔로잉한 작가가 없습니다.
            </div>
          )
        ) : displayBooks.length > 0 ? (
          <div style={s.gridContainer}>
            {displayBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/books/${book.id}`)}
                onDelete={() => handleDelete(book.id)}
                favoriteTop={activeTab === 'favorites'}
              />
            ))}
          </div>
        ) : (
          <div style={s.emptyState}>
            <i className="ti ti-book-off" style={s.emptyIcon} />
            {activeTab === 'mybooks' ? '작성한 작품이 없습니다.' : '즐겨찾기한 도서가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  )
}
