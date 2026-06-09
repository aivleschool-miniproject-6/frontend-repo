import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BookCard from '../components/BookCard'
import { compressImageDataUrl } from '../../../util/bookCoverService'

const API_BASE = import.meta.env.VITE_API_BASE_URL

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
  profileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 14,
    color: '#6b6b67',
    lineHeight: 1.5,
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
  loadingState: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#6b6b67',
    fontSize: 14,
  },
  loadingIcon: {
    fontSize: 38,
    display: 'block',
    marginBottom: 12,
    color: '#9b9b95',
    animation: 'spin 1s linear infinite',
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
  const [user, setUser] = useState(null)
  const [myBooks, setMyBooks] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('mybooks') // 'mybooks' | 'favorites'

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 3개 API 병렬 호출
        const [userRes, booksRes, favRes] = await Promise.all([
          fetch(`${API_BASE}/users/1`), // TODO: 사용자 ID는 실제 로그인 시스템에 맞게 조정 필요 (현재는 1로 고정)
          fetch(`${API_BASE}/users/1/books`),
          fetch(`${API_BASE}/users/1/favorites`),
        ])

        if (!userRes.ok) throw new Error('사용자 정보를 불러올 수 없습니다.')
        if (!booksRes.ok) throw new Error('내 작품을 불러올 수 없습니다.')
        if (!favRes.ok) throw new Error('즐겨찾기를 불러올 수 없습니다.')

        const userData = await userRes.json()
        const booksData = await booksRes.json()
        const favsData = await favRes.json()

        // 프로필 이미지 압축
        if (userData.profileImageUrl) {
          userData.profileImageUrl = await compressImageDataUrl(userData.profileImageUrl)
        }

        // 책 ID에서 실제 책 정보 조회
        const getBookDetails = async (bookIdArray) => {
          if (!Array.isArray(bookIdArray) || bookIdArray.length === 0) return []
          const bookIds = bookIdArray.map(item => item.book)
          const bookDetailPromises = bookIds.map(id => fetch(`${API_BASE}/books/${id}`).then(r => r.json()))
          return await Promise.all(bookDetailPromises)
        }

        const myBooksDetails = await getBookDetails(booksData)
        const favoritesDetails = await getBookDetails(favsData)

        setUser(userData)
        setMyBooks(Array.isArray(myBooksDetails) ? myBooksDetails : [])
        setFavorites(Array.isArray(favoritesDetails) ? favoritesDetails : [])
      } catch (err) {
        setError(err.message)
        console.error('마이페이지 데이터 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.wrap}>
          <div style={s.loadingState}>
            <i className="ti ti-loader-2" style={s.loadingIcon} />
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

  const displayBooks = activeTab === 'mybooks' ? myBooks : favorites
  const tabCounts = {
    mybooks: myBooks.length,
    favorites: favorites.length,
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* 프로필 카드 */}
        {user && (
          <div style={s.profileCard}>
            <div style={s.profileImage}>
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.name} style={s.profileImg} />
              ) : (
                <i className="ti ti-user" style={s.profileIcon} />
              )}
            </div>
            <div style={s.profileInfo}>
              <div style={s.profileName}>{user.name || '사용자'}</div>
              <div style={s.profileEmail}>{user.email || '-'}</div>
              {user.bio && <div style={s.profileBio}>{user.bio}</div>}
            </div>
          </div>
        )}

        {/* 탭 */}
        <div style={s.tabContainer}>
          <button
            style={s.tab(activeTab === 'mybooks')}
            onClick={() => setActiveTab('mybooks')}
          >
            내 작품 ({tabCounts.mybooks})
          </button>
          <button
            style={s.tab(activeTab === 'favorites')}
            onClick={() => setActiveTab('favorites')}
          >
            즐겨찾기 ({tabCounts.favorites})
          </button>
        </div>

        {/* 도서 목록 */}
        {displayBooks.length > 0 ? (
          <div style={s.gridContainer}>
            {displayBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/books/${book.id}`)}
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