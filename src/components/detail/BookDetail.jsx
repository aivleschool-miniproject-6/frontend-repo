import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtDate, getCoverColor } from '../list/components/BookCard'

const API = 'http://localhost:5000/books'

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatWon(value) {
  if (value === null || value === undefined || value === '') return '-'
  return `${Number(value).toLocaleString()}원`
}

const s = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#eeece6',
  },
  topbar: {
    background: '#fff',
    borderBottom: '0.5px solid rgba(0,0,0,0.12)',
    padding: '0 20px',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6b6b67',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  topActions: {
    display: 'flex',
    gap: 8,
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: '#1a1a18',
    color: '#fff',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 14px',
    borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.22)',
    cursor: 'pointer',
    background: '#fff',
    color: '#c0392b',
  },
  inner: {
    padding: 24,
  },
  wrap: {
    maxWidth: 980,
    margin: '0 auto',
  },
  status: {
    padding: 60,
    textAlign: 'center',
    color: '#6b6b67',
    fontSize: 14,
  },
  statusIcon: {
    fontSize: 38,
    display: 'block',
    marginBottom: 12,
  },
  hero: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr)',
    marginBottom: 16,
  },
  coverPanel: {
    borderRight: '0.5px solid rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
  },
  coverBox: (bg) => ({
    height: 360,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }),
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  favoriteBtn: (active) => ({
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: active ? '#fff7e8' : '#fff',
    border: `0.5px solid ${active ? '#f59e0b' : 'rgba(0,0,0,0.18)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: active ? '#f59e0b' : '#9b9b95',
  }),
  coverMeta: {
    padding: 14,
    display: 'grid',
    gap: 8,
    fontSize: 12,
    color: '#6b6b67',
  },
  coverEditBtn: {
    marginTop: 4,
    padding: '9px 0',
    borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.22)',
    background: '#fff',
    color: '#1a1a18',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoWrap: {
    padding: '28px 30px',
    minWidth: 0,
  },
  genreTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    padding: '4px 11px',
    borderRadius: 20,
    background: '#f5f5f4',
    color: '#6b6b67',
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    color: '#1a1a18',
    lineHeight: 1.25,
    marginBottom: 8,
    wordBreak: 'keep-all',
  },
  author: {
    fontSize: 16,
    color: '#6b6b67',
    marginBottom: 24,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  metaItem: {
    background: '#f8f7f4',
    border: '0.5px solid rgba(0,0,0,0.08)',
    borderRadius: 10,
    padding: '12px 13px',
    minWidth: 0,
  },
  metaLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#6b6b67',
    marginBottom: 5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a18',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  contentCard: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14,
    padding: 26,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a18',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  contentText: {
    fontSize: 15,
    color: '#1a1a18',
    lineHeight: 1.85,
    whiteSpace: 'pre-wrap',
    wordBreak: 'keep-all',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: '28px 28px 20px',
    width: 360,
    boxShadow: '0 18px 60px rgba(0,0,0,0.22)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1a1a18',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#6b6b67',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    fontSize: 13,
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    border: '0.5px solid rgba(0,0,0,0.22)',
    background: '#fff',
    color: '#1a1a18',
  },
  dangerBtn: {
    fontSize: 13,
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#1a1a18',
    color: '#fff',
    cursor: 'pointer',
  },
}

export default function BookDetail({ id, onBack, onEdit, onEditCover, onDeleted }) {
  const viewedBookIds = useRef(new Set())
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [favorite, setFavorite] = useState(() => localStorage.getItem(`bookFavorite:${id}`) === 'true')
  const [views, setViews] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API}/${id}`)
        if (!res.ok) throw new Error('책 정보를 찾을 수 없습니다.')
        const data = await res.json()
        const currentViews = Number(data.viewCount || 0)

        if (viewedBookIds.current.has(String(id))) {
          setBook(data)
          setViews(currentViews)
          return
        }

        viewedBookIds.current.add(String(id))
        const nextViews = currentViews + 1
        const patchRes = await fetch(`${API}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ viewCount: nextViews }),
        })

        if (!patchRes.ok) throw new Error('조회수 업데이트에 실패했습니다.')
        const updatedBook = await patchRes.json()

        setBook(updatedBook)
        setViews(Number(updatedBook.viewCount || nextViews))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  useEffect(() => {
    setFavorite(localStorage.getItem(`bookFavorite:${id}`) === 'true')
  }, [id])

  useEffect(() => {
    localStorage.setItem(`bookFavorite:${id}`, String(favorite))
    window.dispatchEvent(new Event('bookFavoriteChange'))
  }, [favorite, id])

  const coverColor = useMemo(() => getCoverColor(book?.genre), [book?.genre])

  const handleDelete = async () => {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    setShowDeleteModal(false)
    onDeleted?.()
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.status}>
          <i className="ti ti-loader-2" style={s.statusIcon} />
          책 정보를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div style={s.page}>
        <div style={s.topbar}>
          <button style={s.backBtn} onClick={onBack}>
            <i className="ti ti-arrow-left" /> 도서 목록으로
          </button>
        </div>
        <div style={s.status}>
          <i className="ti ti-book-off" style={s.statusIcon} />
          {error || '책 정보가 없습니다.'}
        </div>
      </div>
    )
  }

  const meta = [
    { icon: 'ti-building', label: '출판사', value: book.publisher || '-' },
    { icon: 'ti-calendar', label: '출판일', value: book.pubDate ? fmtDate(book.pubDate) : '-' },
    { icon: 'ti-currency-won', label: '가격', value: formatWon(book.price) },
    { icon: 'ti-book-2', label: '페이지', value: book.pages ? `${book.pages.toLocaleString()}쪽` : '-' },
    { icon: 'ti-barcode', label: 'ISBN', value: book.isbn || '-' },
    { icon: 'ti-eye', label: '조회수', value: `${views.toLocaleString()}회` },
  ]

  return (
    <div style={s.page}>
      {showDeleteModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>도서를 삭제할까요?</div>
            <div style={s.modalDesc}>
              <strong>{book.title}</strong> 정보가 목록에서 삭제됩니다.
              <br />
              이 작업은 되돌릴 수 없습니다.
            </div>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowDeleteModal(false)}>취소</button>
              <button style={s.dangerBtn} onClick={handleDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.topbar}>
        <button style={s.backBtn} onClick={onBack}>
          <i className="ti ti-arrow-left" /> 도서 목록으로
        </button>
        <div style={s.topActions}>
          <button style={s.deleteBtn} onClick={() => setShowDeleteModal(true)}>
            <i className="ti ti-trash" /> 삭제
          </button>
          <button style={s.editBtn} onClick={onEdit}>
            <i className="ti ti-edit" /> 수정
          </button>
        </div>
      </div>

      <div style={s.inner}>
        <div style={s.wrap}>
          <section style={s.hero}>
            <div style={s.coverPanel}>
              <div style={s.coverBox(coverColor.bg)}>
                {book.coverImageUrl ? (
                  <img src={book.coverImageUrl} alt={book.title} style={s.coverImg} />
                ) : (
                  <i className="ti ti-book" style={{ fontSize: 92, color: coverColor.ic }} />
                )}
                <button
                  style={s.favoriteBtn(favorite)}
                  onClick={() => setFavorite((prev) => !prev)}
                  title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                >
                  <i className={`ti ${favorite ? 'ti-star-filled' : 'ti-star'}`} style={{ fontSize: 17 }} />
                </button>
              </div>
              <div style={s.coverMeta}>
                <span>등록일 {formatDateTime(book.createdAt)}</span>
                <span>수정일 {formatDateTime(book.updatedAt)}</span>
                <button style={s.coverEditBtn} onClick={onEditCover}>
                  <i className="ti ti-sparkles" style={{ fontSize: 15 }} />
                  AI 표지수정
                </button>
              </div>
            </div>

            <div style={s.infoWrap}>
              <span style={s.genreTag}>
                <i className="ti ti-category" style={{ fontSize: 14 }} />
                {book.genre || '미분류'}
              </span>
              <h1 style={s.title}>{book.title}</h1>
              <div style={s.author}>{book.author || '저자 미상'}</div>

              <div style={s.metaGrid}>
                {meta.map((item) => (
                  <div key={item.label} style={s.metaItem}>
                    <div style={s.metaLabel}>
                      <i className={`ti ${item.icon}`} style={{ fontSize: 14 }} />
                      {item.label}
                    </div>
                    <div style={s.metaValue}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={s.contentCard}>
            <div style={s.sectionTitle}>
              <i className="ti ti-align-left" /> 도서 소개
            </div>
            <div style={s.contentText}>{book.content || '등록된 소개가 없습니다.'}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
