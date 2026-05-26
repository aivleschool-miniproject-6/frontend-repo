import { useState, useEffect } from 'react'

const API = 'http://localhost:5000/books'

const GENRES = ['소설', '인문', '에세이', '경제/경영', 'IT/컴퓨터', '자기계발']

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#eeece6' },
  topbar: {
    background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.12)',
    padding: '0 20px', height: 52,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
    color: '#6b6b67', background: 'none', border: 'none', cursor: 'pointer',
  },
  inner: { flex: 1, overflow: 'auto', padding: 24 },
  wrap: { maxWidth: 680, margin: '0 auto' },
  pageTitle: { fontSize: 18, fontWeight: 500, color: '#1a1a18', marginBottom: 6 },
  pageSub: { fontSize: 13, color: '#6b6b67', marginBottom: 20 },
  card: {
    background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12, padding: 24, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 500, color: '#6b6b67',
    marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
  },
  formGroup: { marginBottom: 14 },
  label: {
    fontSize: 12, color: '#6b6b67',
    display: 'block', marginBottom: 5,
  },
  req: { color: '#e74c3c' },
  input: (err) => ({
    width: '100%', padding: '8px 12px',
    border: `0.5px solid ${err ? '#e74c3c' : 'rgba(0,0,0,0.22)'}`,
    borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a1a18', outline: 'none',
  }),
  textarea: (err) => ({
    width: '100%', padding: '8px 12px',
    border: `0.5px solid ${err ? '#e74c3c' : 'rgba(0,0,0,0.22)'}`,
    borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a1a18',
    minHeight: 110, resize: 'vertical', lineHeight: 1.6, outline: 'none',
  }),
  select: {
    width: '100%', padding: '8px 12px',
    border: '0.5px solid rgba(0,0,0,0.22)',
    borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a1a18', outline: 'none',
  },
  errMsg: { fontSize: 11, color: '#e74c3c', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 },
  charCount: { fontSize: 11, color: '#6b6b67', textAlign: 'right', marginTop: 3 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  foot: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: {
    fontSize: 13, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    border: '0.5px solid rgba(0,0,0,0.22)', background: '#fff', color: '#1a1a18',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    background: '#1a1a18', color: '#fff', border: 'none',
  },
  banner: {
    background: '#fef9e7', border: '0.5px solid #f0c040',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#7d6608',
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
  },
}

export default function BookFormPage({ mode, id, onBack, onSaved }) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    title: '', author: '', content: '', genre: '',
    publisher: '', pubDate: '', price: '', pages: '', isbn: '',
  })
  const [errors, setErrors] = useState({})
  const [changed, setChanged] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // 수정 모드: 기존 데이터 로딩
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await fetch(`${API}/${id}`)
        const data = await res.json()
        setForm({
          title: data.title || '',
          author: data.author || '',
          content: data.content || '',
          genre: data.genre || '',
          publisher: data.publisher || '',
          pubDate: data.pubDate || '',
          price: data.price || '',
          pages: data.pages || '',
          isbn: data.isbn || '',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
    setChanged(true)
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = '제목은 필수 입력 항목입니다.'
    if (!form.author.trim()) e.author = '저자는 필수 입력 항목입니다.'
    if (!form.content.trim()) e.content = '도서 내용은 필수 입력 항목입니다.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const now = new Date().toISOString()
    const body = {
      ...form,
      price: form.price ? Number(form.price) : null,
      pages: form.pages ? Number(form.pages) : null,
      updatedAt: now,
      ...(isEdit ? {} : { createdAt: now, coverImageUrl: '', viewCount: 0 }),
    }

    if (isEdit) {
      await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    onSaved()
  }

  if (loading) return <div style={{ padding: 40, color: '#6b6b67' }}>불러오는 중...</div>

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={onBack}>
          <i className="ti ti-arrow-left" /> {isEdit ? '상세 페이지로' : '도서 목록으로'}
        </button>
        <div />
      </div>

      <div style={s.inner}>
        <div style={s.wrap}>
          <div style={s.pageTitle}>{isEdit ? '도서 수정' : '새 도서 등록'}</div>
          {isEdit && <div style={s.pageSub}>ID {id}</div>}

          {isEdit && changed && (
            <div style={s.banner}>
              <i className="ti ti-info-circle" /> 변경된 내용이 있습니다. 저장하기 버튼을 눌러 반영하세요.
            </div>
          )}

          {/* 기본 정보 */}
          <div style={s.card}>
            <div style={s.sectionTitle}>
              <i className="ti ti-info-circle" /> 기본 정보
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: '#e74c3c' }}>* 필수</span>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>제목 <span style={s.req}>*</span></label>
              <input style={s.input(errors.title)} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="도서 제목" />
              {errors.title && <div style={s.errMsg}><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.title}</div>}
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>저자 <span style={s.req}>*</span></label>
                <input style={s.input(errors.author)} value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="저자명" />
                {errors.author && <div style={s.errMsg}><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.author}</div>}
              </div>
              <div>
                <label style={s.label}>장르</label>
                <select style={s.select} value={form.genre} onChange={(e) => set('genre', e.target.value)}>
                  <option value="">장르 선택</option>
                  {GENRES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>
                도서 내용 <span style={s.req}>*</span>
                <span style={{ fontWeight: 400, marginLeft: 4, color: '#6b6b67' }}>(AI 표지 생성에 활용됩니다)</span>
              </label>
              <textarea
                style={s.textarea(errors.content)}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="줄거리, 주제, 핵심 내용을 입력하세요."
                maxLength={500}
              />
              {errors.content && <div style={s.errMsg}><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.content}</div>}
              <div style={s.charCount}>{form.content.length} / 500자</div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div style={s.card}>
            <div style={s.sectionTitle}>
              <i className="ti ti-list-details" /> 상세 정보
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>(선택)</span>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>출판사</label>
                <input style={s.input()} value={form.publisher} onChange={(e) => set('publisher', e.target.value)} placeholder="출판사명" />
              </div>
              <div>
                <label style={s.label}>출판일</label>
                <input style={s.input()} type="date" value={form.pubDate} onChange={(e) => set('pubDate', e.target.value)} />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>가격 (원)</label>
                <input style={s.input()} type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="예: 16000" />
              </div>
              <div>
                <label style={s.label}>페이지 수</label>
                <input style={s.input()} type="number" value={form.pages} onChange={(e) => set('pages', e.target.value)} placeholder="예: 280" />
              </div>
            </div>
            <div>
              <label style={s.label}>ISBN</label>
              <input style={s.input()} value={form.isbn} onChange={(e) => set('isbn', e.target.value)} placeholder="13자리 ISBN" maxLength={13} />
            </div>
          </div>

          <div style={s.foot}>
            <button style={s.cancelBtn} onClick={onBack}>취소</button>
            <button style={s.saveBtn} onClick={handleSave}>
              <i className="ti ti-check" /> {isEdit ? '저장하기' : '등록하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
