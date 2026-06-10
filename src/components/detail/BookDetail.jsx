import { useEffect, useMemo, useState, useCallback } from 'react'
import { fmtDate, getCoverColor } from '../list/components/BookCard'

// [실제 운영 환경] 인증 컨텍스트나 전역 상태(Zustand 등)에서 실제 로그인 유저 정보를 가져옵니다.
// 현재는 전역 로그인 세션이 합쳐지기 전이므로 가짜 객체로 Interface만 맞춰둡니다.
function useAuth() {
  return {
    currentUser: {
      id: 1221,            // 백엔드 USER 테이블의 Long 타입 고유 PK
      nickname: "길동"
    },
    isLoggedIn: true
  }
}

const API = `${import.meta.env.VITE_API_BASE_URL}/books`
const COMMENTS_API = `${import.meta.env.VITE_API_BASE_URL}/comments`

// ─────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// 별점 컴포넌트 (표시용 / 입력용)
// ─────────────────────────────────────────────
function StarDisplay({ rating, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`ti ${n <= (rating ?? 0) ? 'ti-star-filled' : 'ti-star'}`}
          style={{ fontSize: size, color: n <= (rating ?? 0) ? '#f59e0b' : '#d4d4d0' }}
        />
      ))}
    </span>
  )
}

function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <span style={{ display: 'inline-flex', gap: 3, lineHeight: 1, cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`ti ${n <= (hovered || value) ? 'ti-star-filled' : 'ti-star'}`}
          style={{
            fontSize: 24,
            color: n <= (hovered || value) ? '#f59e0b' : '#d4d4d0',
            transition: 'color 0.12s',
          }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n === value ? 0 : n)}
        />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────
// 평균 별점 집계
// ─────────────────────────────────────────────
function AverageRating({ comments }) {
  const rated = comments.filter((c) => c.rating && c.rating > 0)
  if (rated.length === 0) return null
  const avg = rated.reduce((s, c) => s + c.rating, 0) / rated.length

  return (
    <div style={s.avgRatingWrap}>
      <span style={s.avgScore}>{avg.toFixed(1)}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StarDisplay rating={Math.round(avg)} size={15} />
        <span style={s.avgCount}>별점 {rated.length}개</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 댓글 작성 폼 (POST /books/{bookId}/comments)
// ─────────────────────────────────────────────
function CommentForm({ bookId, onPosted }) {
  const { currentUser } = useAuth()
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) { setError('댓글 내용을 입력해 주세요.'); return }
    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch(`${COMMENTS_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: Number(bookId),    // 단, BOOK.id가 실제로는 Long이니 숫자형이어야 함
          author_id: currentUser.id,
          nickname: currentUser.nickname,
          content: trimmed,
          rating: rating > 0 ? rating : null,
        }),
      })
      if (!res.ok) throw new Error('댓글 등록에 실패했습니다.')
      setContent('')
      setRating(0)
      onPosted?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={s.formWrap}>
      <div style={s.formRatingRow}>
        <span style={s.formLabel}>별점</span>
        <StarInput value={rating} onChange={setRating} />
        {rating > 0 && (
          <span style={s.ratingLabel}>{['', '별로에요', '그저 그래요', '괜찮아요', '좋아요', '최고에요'][rating]}</span>
        )}
      </div>
      <textarea
        style={s.textarea}
        placeholder="이 책에 대한 생각을 남겨주세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
      />
      <div style={s.formBottom}>
        {error && <span style={s.formError}>{error}</span>}
        <span style={{ flex: 1 }} />
        <span style={s.charCount}>{content.length}/500</span>
        <button style={s.submitBtn(submitting)} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 댓글 단건 아이템 (PATCH & DELETE /comments/{id})
// ─────────────────────────────────────────────
function CommentItem({ comment, onDeleted, onUpdated }) {
  const { currentUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [editRating, setEditRating] = useState(comment.rating ?? 0)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSave = async () => {
    const trimmed = editContent.trim()
    if (!trimmed) return
    try {
      setSaving(true)
      const res = await fetch(`${COMMENTS_API}/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          rating: editRating > 0 ? editRating : null,
        }),
      })
      if (!res.ok) throw new Error()
      setEditing(false)
      onUpdated?.()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await fetch(`${COMMENTS_API}/${comment.id}`, { method: 'DELETE' })
    setShowDeleteModal(false)
    onDeleted?.()
  }

  const displayName = comment.nickname ?? '익명 사용자'
  const createdAt = formatDateTime(comment.created_at)

  return (
    <div style={s.commentItem}>
      {showDeleteModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>댓글을 삭제할까요?</div>
            <div style={s.modalDesc}>삭제된 댓글은 복구할 수 없습니다.</div>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowDeleteModal(false)}>취소</button>
              <button style={s.dangerBtn} onClick={handleDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.commentHeader}>
        <div style={s.commentAvatar}>{displayName?.slice(0, 1).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.commentAuthor}>{displayName}</div>
          <div style={s.commentDate}>{createdAt}</div>
        </div>

        {/* UX 권한 검증: 내가 쓴 댓글(author_id와 내 고유 id 일치)일 때만 수정/삭제 버튼 노출 */}
        {comment.author_id === currentUser?.id && (
          <div style={s.commentActions}>
            <button style={s.commentActionBtn} onClick={() => { setEditing(true); setEditContent(comment.content); setEditRating(comment.rating ?? 0) }}>
              <i className="ti ti-edit" style={{ fontSize: 13 }} />
            </button>
            <button style={s.commentActionBtn} onClick={() => setShowDeleteModal(true)}>
              <i className="ti ti-trash" style={{ fontSize: 13, color: '#c0392b' }} />
            </button>
          </div>
        )}
      </div>

      {comment.rating > 0 && !editing && (
        <div style={{ marginBottom: 6 }}>
          <StarDisplay rating={comment.rating} size={13} />
        </div>
      )}

      {editing ? (
        <div style={{ marginTop: 6 }}>
          <div style={{ ...s.formRatingRow, marginBottom: 8 }}>
            <span style={s.formLabel}>별점</span>
            <StarInput value={editRating} onChange={setEditRating} />
          </div>
          <textarea
            style={{ ...s.textarea, minHeight: 72 }}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
            <button style={s.cancelBtn} onClick={() => setEditing(false)}>취소</button>
            <button style={s.dangerBtn} onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <p style={s.commentContent}>{comment.content}</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// 스타일 가이드 오브젝트
// ─────────────────────────────────────────────
const s = {
  page: { minHeight: 'calc(100vh - 64px)', background: '#eeece6' },
  topbar: { background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.12)', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6b67', background: 'none', border: 'none', cursor: 'pointer' },
  topActions: { display: 'flex', gap: 8 },
  editBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1a1a18', color: '#fff' },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.22)', cursor: 'pointer', background: '#fff', color: '#c0392b' },
  inner: { padding: 24 },
  wrap: { maxWidth: 980, margin: '0 auto' },
  status: { padding: 60, textAlign: 'center', color: '#6b6b67', fontSize: 14 },
  statusIcon: { fontSize: 38, display: 'block', marginBottom: 12 },
  hero: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden', display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', marginBottom: 16 },
  coverPanel: { borderRight: '0.5px solid rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column' },
  coverBox: (bg) => ({ height: 360, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }),
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' },
  favoriteBtn: (active) => ({ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: active ? '#fff7e8' : '#fff', border: `0.5px solid ${active ? '#f59e0b' : 'rgba(0,0,0,0.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? '#f59e0b' : '#9b9b95' }),
  coverMeta: { padding: 14, display: 'grid', gap: 8, fontSize: 12, color: '#6b6b67' },
  coverEditBtn: { marginTop: 4, padding: '9px 0', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.22)', background: '#fff', color: '#1a1a18', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  infoWrap: { padding: '28px 30px', minWidth: 0 },
  genreTag: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 11px', borderRadius: 20, background: '#f5f5f4', color: '#6b6b67', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: 700, color: '#1a1a18', lineHeight: 1.25, marginBottom: 8, wordBreak: 'keep-all' },
  author: { fontSize: 16, color: '#6b6b67', marginBottom: 24 },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 },
  metaItem: { background: '#f8f7f4', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '12px 13px', minWidth: 0 },
  metaLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b6b67', marginBottom: 5 },
  metaValue: { fontSize: 14, fontWeight: 600, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  contentCard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 14, padding: 26, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#1a1a18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 },
  contentText: { fontSize: 15, color: '#1a1a18', lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' },
  commentsCard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 14, padding: 26, marginBottom: 16 },
  commentsTitleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  avgRatingWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#f8f7f4', borderRadius: 10, padding: '8px 14px', border: '0.5px solid rgba(0,0,0,0.08)' },
  avgScore: { fontSize: 28, fontWeight: 700, color: '#1a1a18', lineHeight: 1 },
  avgCount: { fontSize: 11, color: '#9b9b95' },
  formWrap: { background: '#f8f7f4', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 },
  formRatingRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  formLabel: { fontSize: 12, color: '#6b6b67', minWidth: 24 },
  ratingLabel: { fontSize: 12, color: '#f59e0b', fontWeight: 600 },
  textarea: { width: '100%', minHeight: 80, padding: '10px 12px', fontSize: 14, color: '#1a1a18', lineHeight: 1.7, border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, background: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  formBottom: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  formError: { fontSize: 12, color: '#c0392b' },
  charCount: { fontSize: 11, color: '#b4b4b0' },
  submitBtn: (disabled) => ({ padding: '8px 18px', borderRadius: 8, border: 'none', background: disabled ? '#ccc' : '#1a1a18', color: '#fff', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer' }),
  divider: { border: 'none', borderTop: '0.5px solid rgba(0,0,0,0.08)', margin: '4px 0 18px' },
  commentItem: { padding: '16px 0', borderBottom: '0.5px solid rgba(0,0,0,0.07)' },
  commentHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  commentAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#1a1a18', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  commentAuthor: { fontSize: 13, fontWeight: 600, color: '#1a1a18', lineHeight: 1.3 },
  commentDate: { fontSize: 11, color: '#b4b4b0', marginTop: 2 },
  commentActions: { display: 'flex', gap: 4, marginLeft: 'auto' },
  commentActionBtn: { width: 28, height: 28, borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.15)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  commentContent: { fontSize: 14, color: '#3a3a38', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' },
  emptyComments: { padding: '32px 0', textAlign: 'center', color: '#b4b4b0', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 14, padding: '28px 28px 20px', width: 360, boxShadow: '0 18px 60px rgba(0,0,0,0.22)' },
  modalTitle: { fontSize: 17, fontWeight: 700, color: '#1a1a18', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#6b6b67', lineHeight: 1.6, marginBottom: 20 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { fontSize: 13, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', border: '0.5px solid rgba(0,0,0,0.22)', background: '#fff', color: '#1a1a18' },
  dangerBtn: { fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#1a1a18', color: '#fff', cursor: 'pointer' },
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function BookDetail({ id, onBack, onEdit, onEditCover, onDeleted }) {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [favorite, setFavorite] = useState(() => localStorage.getItem(`bookFavorite:${id}`) === 'true')
  const [views, setViews] = useState(0)

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)

  // 도서 단건 조회
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API}/${id}`)
        if (!res.ok) throw new Error('책 정보를 찾을 수 없습니다.')
        const data = await res.json()
        const nextViews = Number(data.viewCount || 0) + 1
        setBook(data)
        setViews(nextViews)
        setTimeout(() => {
          fetch(`${API}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ viewCount: nextViews }),
          }).catch((e) => console.warn('조회수 백그라운드 우회 처리:', e))
        }, 300)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // 특정 도서 댓글 조회 (GET /books/{id}/comments)
  const loadComments = useCallback(async () => {
    try {
      setCommentsLoading(true)
      const res = await fetch(`${COMMENTS_API}?book_id=${id}`)
      if (!res.ok) return
      const data = await res.json()
      setComments(Array.isArray(data) ? data : (data.content ?? []))
    } catch {
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  useEffect(() => { loadComments() }, [loadComments])

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
              <br />이 작업은 되돌릴 수 없습니다.
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
                  onClick={() => setFavorite((p) => !p)}
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

          <section style={s.commentsCard}>
            <div style={s.commentsTitleRow}>
              <div style={s.sectionTitle} >
                <i className="ti ti-message-circle" />
                댓글 {comments.length > 0 && <span style={{ color: '#9b9b95', fontWeight: 400 }}>({comments.length})</span>}
              </div>
              <AverageRating comments={comments} />
            </div>

            <CommentForm bookId={id} onPosted={loadComments} />

            <hr style={s.divider} />

            {commentsLoading ? (
              <div style={s.emptyComments}>
                <i className="ti ti-loader-2" style={{ fontSize: 22, display: 'block', marginBottom: 8 }} />
                댓글을 불러오는 중...
              </div>
            ) : comments.length === 0 ? (
              <div style={s.emptyComments}>
                <i className="ti ti-message-off" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  onDeleted={loadComments}
                  onUpdated={loadComments}
                />
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
