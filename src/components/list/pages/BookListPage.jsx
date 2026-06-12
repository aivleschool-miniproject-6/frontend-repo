import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import BookListItem from '../components/BookListItem'
import AdvancedSearchPanel, { DEFAULT_ADVANCED_FILTERS, PRICE_MAX } from '../../common/AdvancedSearchPanel'
import styles from './BookListPage.module.css'

const API = `${import.meta.env.VITE_API_BASE_URL}/books`
const ALL = 'ALL'
const FAVORITES = 'FAVORITES'

function toTime(value) {
  const time = value ? new Date(value).getTime() : 0
  return Number.isNaN(time) ? 0 : time
}

function readFavoriteIds(userId) {
  const prefix = `bookFavorite:${userId ?? 'guest'}:`
  const ids = new Set()
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix) && localStorage.getItem(key) === 'true') {
      ids.add(key.replace(prefix, ''))
    }
  }
  return ids
}

export default function BookListPage({ onClickNew, onClickBook }) {
  const [searchParams] = useSearchParams()
  const { user, token } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [genre, setGenre] = useState(ALL)
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [view, setView] = useState('grid')
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds(user?.userId))
  const [sortBy, setSortBy] = useState('register')
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    ['publisher', 'pubDateFrom', 'pubDateTo', 'priceMin', 'priceMax', 'minRating'].some((k) => searchParams.has(k))
  )
  const [advFilters, setAdvFilters] = useState(() => ({
    publisher: searchParams.get('publisher') || DEFAULT_ADVANCED_FILTERS.publisher,
    pubDateFrom: searchParams.get('pubDateFrom') || DEFAULT_ADVANCED_FILTERS.pubDateFrom,
    pubDateTo: searchParams.get('pubDateTo') || DEFAULT_ADVANCED_FILTERS.pubDateTo,
    priceMin: Number(searchParams.get('priceMin') ?? DEFAULT_ADVANCED_FILTERS.priceMin),
    priceMax: Number(searchParams.get('priceMax') ?? DEFAULT_ADVANCED_FILTERS.priceMax),
    minRating: Number(searchParams.get('minRating') ?? DEFAULT_ADVANCED_FILTERS.minRating),
  }))

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
    setAdvFilters({
      publisher: searchParams.get('publisher') || DEFAULT_ADVANCED_FILTERS.publisher,
      pubDateFrom: searchParams.get('pubDateFrom') || DEFAULT_ADVANCED_FILTERS.pubDateFrom,
      pubDateTo: searchParams.get('pubDateTo') || DEFAULT_ADVANCED_FILTERS.pubDateTo,
      priceMin: Number(searchParams.get('priceMin') ?? DEFAULT_ADVANCED_FILTERS.priceMin),
      priceMax: Number(searchParams.get('priceMax') ?? DEFAULT_ADVANCED_FILTERS.priceMax),
      minRating: Number(searchParams.get('minRating') ?? DEFAULT_ADVANCED_FILTERS.minRating),
    })
    setAdvancedOpen(
      ['publisher', 'pubDateFrom', 'pubDateTo', 'priceMin', 'priceMax', 'minRating'].some((k) => searchParams.has(k))
    )
  }, [searchParams])

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
    const refresh = () => setFavoriteIds(readFavoriteIds(user?.userId))
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
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      alert('삭제에 실패했습니다.')
      return
    }
    localStorage.removeItem(`bookFavorite:${user?.userId ?? 'guest'}:${id}`)
    setFavoriteIds(readFavoriteIds(user?.userId))
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const hasAdvanced = useMemo(() => {
    const d = DEFAULT_ADVANCED_FILTERS
    return (
      advFilters.publisher !== d.publisher ||
      advFilters.pubDateFrom !== d.pubDateFrom ||
      advFilters.pubDateTo !== d.pubDateTo ||
      advFilters.priceMin !== d.priceMin ||
      advFilters.priceMax !== d.priceMax ||
      advFilters.minRating !== d.minRating
    )
  }, [advFilters])

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase()
    const lowerPublisher = advFilters.publisher.toLowerCase()
    return books.filter((book) => {
      const genreOk =
        genre === ALL || (genre === FAVORITES ? favoriteIds.has(String(book.id)) : book.genre === genre)
      const queryOk =
        !query ||
        book.title?.toLowerCase().includes(lowerQuery) ||
        book.author?.toLowerCase().includes(lowerQuery)
      const publisherOk =
        !advFilters.publisher || book.publisher?.toLowerCase().includes(lowerPublisher)
      const priceOk =
        (book.price == null || book.price >= advFilters.priceMin) &&
        (book.price == null || advFilters.priceMax === PRICE_MAX || book.price <= advFilters.priceMax)
      const pubDateFromOk =
        !advFilters.pubDateFrom || (book.pubDate && book.pubDate >= advFilters.pubDateFrom)
      const pubDateToOk =
        !advFilters.pubDateTo || (book.pubDate && book.pubDate <= advFilters.pubDateTo)
      const ratingOk =
        advFilters.minRating === 0 ||
        (book.averageRating ?? 0) >= advFilters.minRating
      return genreOk && queryOk && publisherOk && priceOk && pubDateFromOk && pubDateToOk && ratingOk
    })
  }, [books, genre, favoriteIds, query, advFilters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'title') return arr.sort((a, b) => a.title?.localeCompare(b.title || '', 'ko'))
    if (sortBy === 'price') return arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    return arr.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt) || Number(b.id) - Number(a.id))
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
            <button
              className={`${styles.advBtn} ${advancedOpen ? styles.advBtnActive : ''} ${hasAdvanced ? styles.advBtnDot : ''}`}
              onClick={() => setAdvancedOpen((v) => !v)}
              title="상세검색"
              type="button"
            >
              <i className="ti ti-adjustments-horizontal" />
            </button>
          </div>
        </div>

        {advancedOpen && (
          <AdvancedSearchPanel
            filters={advFilters}
            onChange={setAdvFilters}
            onReset={() => setAdvFilters(DEFAULT_ADVANCED_FILTERS)}
          />
        )}

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