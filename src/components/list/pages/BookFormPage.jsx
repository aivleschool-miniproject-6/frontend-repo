import { useState, useEffect } from 'react'
import './BookFormPage.css'

import {
  STYLE_PRESETS,
  BACKGROUND_PRESETS,
  LIGHTING_PRESETS,
  TYPOGRAPHY_PRESETS,
  compressImageDataUrl,
} from '../../../util/bookCoverService'

import {
  getPresets,
  createPreset,
  deletePreset,
} from '../../../api/presetApi'

import { useAuth } from '../../../context/AuthContext'

const API = `${import.meta.env.VITE_API_BASE_URL}/books`

const GENRES = ['소설', '인문', '에세이', '경제/경영', 'IT/컴퓨터', '자기계발']

export default function BookFormPage({ mode, id, onBack, onSaved }) {
  const isEdit = mode === 'edit'

  const auth = useAuth()
  const user = auth?.user

  const token =
    auth?.token ||
    auth?.accessToken ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token')

  // 하나의 숫자로 묶어 다루기
  const [form, setForm] = useState({
    title: '',
    author: '',
    content: '',
    genre: '',
    publisher: '',
    pubDate: '',
    price: '',
    pages: '',
    isbn: '',
  })

  const [errors, setErrors] = useState({})
  const [changed, setChanged] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  const [aiOptions, setAiOptions] = useState({
    style: '수채화',
    background: '베이지',
    lighting: '자연광',
    typography: '클래식 명조',
  })

  // 1. 모델과 퀄리티 상태 추가
  const [apiConfig, setApiConfig] = useState({
    model: 'gpt-image-2',
    quality: 'Medium',
  })

  const [aiPrompt, setAiPrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState([null, null, null])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  const [presets, setPresets] = useState([])
  const [presetName, setPresetName] = useState('')
  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false)
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)

  // 2. 모델 변경 시 예외처리 핸들러 추가
  const handleModelChange = (modelName) => {
    setApiConfig((prev) => ({
      model: modelName,
      quality: modelName === 'dall-e-3' ? 'High' : prev.quality,
    }))
  }

  const normalizePresetList = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.presets)) return data.presets
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  const sortPresets = (data) => {
    return [...normalizePresetList(data)].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id)
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id)

      return dateB - dateA
    })
  }

  const buildPresetPayload = () => ({
    name: presetName.trim(),
    model: apiConfig.model,
    quality: apiConfig.quality,
    style: aiOptions.style,
    background: aiOptions.background,
    lighting: aiOptions.lighting,
    typography: aiOptions.typography,
  })

  const handleOpenSavePresetModal = () => {
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    if (presets.length >= 5) {
      alert('프리셋은 최대 5개까지 저장할 수 있습니다.')
      return
    }

    setPresetName('')
    setIsSavePresetModalOpen(true)
  }

  const handleCloseSavePresetModal = () => {
    setPresetName('')
    setIsSavePresetModalOpen(false)
  }

  const handleOpenPresetModal = () => {
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    setIsPresetModalOpen(true)
  }

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert('프리셋 이름을 입력해주세요.')
      return
    }

    if (presets.length >= 5) {
      alert('프리셋은 최대 5개까지 저장할 수 있습니다.')
      return
    }

    try {
      console.log('프리셋 저장 token:', token)
      console.log('프리셋 저장 payload:', buildPresetPayload())

      const savedPreset = await createPreset(token, buildPresetPayload())

      setPresets((prev) => sortPresets([savedPreset, ...prev]))
      setPresetName('')
      setIsSavePresetModalOpen(false)

      alert('프리셋이 저장되었습니다.')
    } catch (error) {
      console.error(error)
      alert(error.message || '프리셋 저장에 실패했습니다.')
    }
  }

  const handleApplyPreset = (preset) => {
    setApiConfig({
      model: preset.model || 'gpt-image-2',
      quality: preset.quality || 'Medium',
    })

    setAiOptions({
      style: preset.style || aiOptions.style,
      background: preset.background || aiOptions.background,
      lighting: preset.lighting || aiOptions.lighting,
      typography: preset.typography || aiOptions.typography,
    })

    setIsPresetModalOpen(false)
  }

  const handleDeletePreset = async (presetId) => {
    if (!window.confirm('이 프리셋을 삭제할까요?')) return

    try {
      await deletePreset(token, presetId)

      setPresets((prev) => prev.filter((preset) => preset.id !== presetId))
    } catch (error) {
      console.error(error)
      alert(error.message || '프리셋 삭제에 실패했습니다.')
    }
  }

  // 수정 모드: 기존 데이터 로딩
  useEffect(() => {
    if (!isEdit) return

    const load = async () => {
      try {
        /////fetch
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
      } catch (err) {
        console.error('데이터를 불러오는 데 실패했습니다.', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, isEdit])

  useEffect(() => {
    if (!token) return

    const loadPresets = async () => {
      try {
        const data = await getPresets(token)
        setPresets(sortPresets(data))
      } catch (error) {
        console.error('프리셋 목록 조회 실패:', error)
      }
    }

    loadPresets()
  }, [token])

  const set = (key, val) => {
    // 1. 기존의 객체 속성들을 불변성을 유지하며 복사
    setForm((prev) => ({ ...prev, [key]: val }))

    // 2. 변경을 원하는 키값만 덮어쓰기
    setChanged(true)

    // 값이 입력되면 해당 필드의 에러 메시지는 실시간으로 삭제
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }))
    }
  }

  const validate = () => {
    const e = {}

    if (!form.title.trim()) e.title = '제목은 필수 입력 항목입니다.'
    if (!form.author.trim()) e.author = '저자는 필수 입력 항목입니다.'
    if (!form.genre) e.genre = '장르는 필수 입력 항목입니다.'

    if (!form.content.trim()) {
      e.content = '도서 내용은 필수 입력 항목입니다.'
    } else if (form.content.length > 500) {
      // 도서 내용 최대 500자 제한
      e.content = '도서 내용은 500자까지 작성 가능합니다.'
    }

    // 선택 항목 유효성 검사
    if (form.price && Number(form.price) < 0) {
      e.price = '가격은 0원 이상이어야 합니다.'
    }

    if (form.pages && Number(form.pages) <= 0) {
      e.pages = '페이지 수는 1페이지 이상이어야 합니다.'
    }

    if (form.isbn && form.isbn.trim()) {
      const cleanIsbn = form.isbn.replace(/[^0-9]/g, '')

      if (cleanIsbn.length !== 13) {
        e.isbn = 'ISBN은 정확히 13자리 숫자여야 합니다.'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('어떤 스타일의 표지를 원하시는지 프롬프트를 작성해주세요!')
      return
    }

    try {
      setIsGenerating(true)
      setSelectedImageIndex(null)
      setGeneratedImages([null, null, null])

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/cover/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          model: apiConfig.model,
          quality: apiConfig.quality,
          title: form.title,
          genre: form.genre,
          author: form.author,
          content: form.content,
          prompt: aiPrompt,
          style: aiOptions.style,
          background: aiOptions.background,
          lighting: aiOptions.lighting,
          typography: aiOptions.typography,
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`이미지 생성 요청 실패 (Status: ${response.status}) - ${errBody}`)
      }

      const data = await response.json()
      setGeneratedImages(data.images)
    } catch (error) {
      console.error('이미지 생성 실패:', error)
      alert(`이미지 생성 중 오류가 발생했습니다: ${error.message}`)
      setGeneratedImages([null, null, null])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!validate()) return

    try {
      const now = new Date().toISOString()

      const coverImageUrl = (!isEdit && selectedImageIndex !== null)
        ? await compressImageDataUrl(generatedImages[selectedImageIndex])
        : ''

      const body = {
        ...form,
        price: form.price ? Number(form.price) : null,
        pages: form.pages ? Number(form.pages) : null,
        updatedAt: now,
        ...(isEdit ? {} : { createdAt: now, coverImageUrl, authorId: user?.userId ?? null }),
      }

      /////fetch
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

      const res = isEdit
        ? await fetch(`${API}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(body),
          })
        : await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(body),
          })

      if (!res.ok) {
        alert('저장에 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.')
        return
      }

      onSaved()
    } catch (error) {
      console.error(error)
      alert('네트워크 전송 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <div className="book-form-loading">불러오는 중...</div>
  }

  return (
    <div className="book-form-page">
      <div className="book-form-topbar">
        <button className="book-form-back-btn" onClick={onBack}>
          <i className="ti ti-arrow-left" />
          {isEdit ? '상세 페이지로' : '도서 목록으로'}
        </button>
        <div />
      </div>

      <div className="book-form-inner">
        <div className="book-form-wrap">
          <div className="book-form-page-title">
            {isEdit ? '도서 수정' : '새 도서 등록'}
          </div>

          {isEdit && <div className="book-form-page-sub">ID {id}</div>}

          {isEdit && changed && (
            <div className="book-form-banner">
              <i className="ti ti-info-circle" />
              변경된 내용이 있습니다. 저장하기 버튼을 눌러 반영하세요.
            </div>
          )}

          {/* 기본 정보 */}
          <div className="book-form-card">
            <div className="book-form-section-title">
              <i className="ti ti-info-circle" />
              기본 정보
              <span className="book-form-required-info">* 필수</span>
            </div>

            <div className="book-form-group">
              <label className="book-form-label">
                제목 <span className="book-form-required">*</span>
              </label>
              <input
                className={`book-form-input ${errors.title ? 'is-error' : ''}`}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="도서 제목"
              />
              {errors.title && (
                <div className="book-form-error">
                  <i className="ti ti-alert-circle" />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="book-form-row">
              <div>
                <label className="book-form-label">
                  저자 <span className="book-form-required">*</span>
                </label>
                <input
                  className={`book-form-input ${errors.author ? 'is-error' : ''}`}
                  value={form.author}
                  onChange={(e) => set('author', e.target.value)}
                  placeholder="저자명"
                />
                {errors.author && (
                  <div className="book-form-error">
                    <i className="ti ti-alert-circle" />
                    {errors.author}
                  </div>
                )}
              </div>

              <div>
                <label className="book-form-label">
                  장르 <span className="book-form-required">*</span>
                </label>
                <select
                  className={`book-form-select ${errors.genre ? 'is-error' : ''}`}
                  value={form.genre}
                  onChange={(e) => set('genre', e.target.value)}
                >
                  <option value="">장르 선택</option>
                  {GENRES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                {errors.genre && (
                  <div className="book-form-error">
                    <i className="ti ti-alert-circle" />
                    {errors.genre}
                  </div>
                )}
              </div>
            </div>

            <div className="book-form-group">
              <label className="book-form-label">
                도서 내용 <span className="book-form-required">*</span>
                <span className="book-form-label-note">
                  (AI 표지 생성에 활용됩니다)
                </span>
              </label>
              <textarea
                className={`book-form-textarea ${errors.content ? 'is-error' : ''}`}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="줄거리, 주제, 핵심 내용을 입력하세요."
                maxLength={500}
              />
              {errors.content && (
                <div className="book-form-error">
                  <i className="ti ti-alert-circle" />
                  {errors.content}
                </div>
              )}
              <div className="book-form-char-count">
                {form.content.length} / 500자
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="book-form-card">
            <div className="book-form-section-title">
              <i className="ti ti-list-details" />
              상세 정보
              <span className="book-form-optional">(선택)</span>
            </div>

            <div className="book-form-row">
              <div>
                <label className="book-form-label">출판사</label>
                <input
                  className="book-form-input"
                  value={form.publisher}
                  onChange={(e) => set('publisher', e.target.value)}
                  placeholder="출판사명"
                />
              </div>

              <div>
                <label className="book-form-label">출판일</label>
                <input
                  className="book-form-input"
                  type="date"
                  value={form.pubDate}
                  min="0000-01-01"
                  max="9999-12-31"
                  onChange={(e) => set('pubDate', e.target.value)}
                />
              </div>
            </div>

            <div className="book-form-row">
              <div>
                <label className="book-form-label">가격 (원)</label>
                <input
                  className={`book-form-input ${errors.price ? 'is-error' : ''}`}
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="예: 16000"
                />
                {errors.price && (
                  <div className="book-form-error">
                    <i className="ti ti-alert-circle" />
                    {errors.price}
                  </div>
                )}
              </div>

              <div>
                <label className="book-form-label">페이지 수</label>
                <input
                  className={`book-form-input ${errors.pages ? 'is-error' : ''}`}
                  type="number"
                  value={form.pages}
                  onChange={(e) => set('pages', e.target.value)}
                  placeholder="예: 280"
                />
                {errors.pages && (
                  <div className="book-form-error">
                    <i className="ti ti-alert-circle" />
                    {errors.pages}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="book-form-label">ISBN</label>
              <input
                className={`book-form-input ${errors.isbn ? 'is-error' : ''}`}
                value={form.isbn}
                onChange={(e) => set('isbn', e.target.value)}
                placeholder="13자리 ISBN"
                maxLength={13}
              />
              {errors.isbn && (
                <div className="book-form-error">
                  <i className="ti ti-alert-circle" />
                  {errors.isbn}
                </div>
              )}
            </div>
          </div>

          {/* AI 표지 생성 - 등록 모드 전용 */}
          {!isEdit && (
            <div className="book-form-card">
              <div className="ai-cover-header">
                <div className="ai-cover-title">
                  <i className="ti ti-wand" />
                  AI 표지 생성
                  <span className="ai-cover-optional">(선택)</span>
                </div>

                <div className="preset-top-buttons">
                  <button
                    type="button"
                    className="preset-top-button"
                    onClick={handleOpenSavePresetModal}
                  >
                    저장
                  </button>

                  <button
                    type="button"
                    className="preset-top-button"
                    onClick={handleOpenPresetModal}
                  >
                    프리셋
                  </button>
                </div>
              </div>

              {/* AI 모델 선택 버튼 렌더링 */}
              <div className="book-form-group">
                <label className="book-form-label">AI 모델</label>
                <div className="option-button-group">
                  {['gpt-image-2', 'gpt-image-1', 'dall-e-3'].map((model) => (
                    <button
                      key={model}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleModelChange(model)}
                      className={`option-chip ${apiConfig.model === model ? 'is-selected' : ''}`}
                    >
                      {model === 'gpt-image-2'
                        ? 'GPT Image 2'
                        : model === 'gpt-image-1'
                          ? 'GPT Image 1'
                          : 'DALL-E 3'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 이미지 퀄리티 선택 버튼 렌더링 */}
              <div className="book-form-group">
                <label className="book-form-label">이미지 퀄리티</label>
                <div className="option-button-group">
                  {['Low', 'Medium', 'High'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        if (apiConfig.model === 'dall-e-3' && q !== 'High') {
                          alert('DALL-E 3 모델은 고품질 모델이므로 High 퀄리티만 선택 가능합니다.')
                          return
                        }

                        setApiConfig((p) => ({ ...p, quality: q }))
                      }}
                      className={`option-chip ${apiConfig.quality === q ? 'is-selected' : ''}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="book-form-group">
                <label className="book-form-label">스타일</label>
                <div className="option-button-group">
                  {Object.keys(STYLE_PRESETS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setAiOptions((p) => ({ ...p, style: key }))}
                      className={`option-chip ${aiOptions.style === key ? 'is-selected' : ''}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="book-form-group">
                <label className="book-form-label">배경 / 조명</label>
                <div className="option-button-group">
                  {Object.keys(BACKGROUND_PRESETS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setAiOptions((p) => ({ ...p, background: key }))}
                      className={`option-chip ${aiOptions.background === key ? 'is-selected' : ''}`}
                    >
                      {key}
                    </button>
                  ))}

                  <span className="option-divider">|</span>

                  {Object.keys(LIGHTING_PRESETS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setAiOptions((p) => ({ ...p, lighting: key }))}
                      className={`option-chip ${aiOptions.lighting === key ? 'is-selected' : ''}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="book-form-group">
                <label className="book-form-label">타이포그래피</label>
                <div className="option-button-group">
                  {Object.keys(TYPOGRAPHY_PRESETS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setAiOptions((p) => ({ ...p, typography: key }))}
                      className={`option-chip ${aiOptions.typography === key ? 'is-selected' : ''}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="book-form-group">
                <label className="book-form-label">프롬프트</label>
                <textarea
                  className="book-form-textarea"
                  disabled={isGenerating}
                  placeholder="어떤 느낌의 표지를 원하시나요? 객체, 색감, 분위기 등을 자유롭게 적어주세요."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`generate-cover-button ${isGenerating ? 'is-generating' : ''}`}
              >
                {isGenerating ? '이미지 생성 중...' : '표지 후보 3장 생성하기'}
              </button>

              <div className="generated-image-list">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    onClick={() => generatedImages[i] && setSelectedImageIndex(i)}
                    className={`generated-image-card ${selectedImageIndex === i ? 'is-selected' : ''} ${generatedImages[i] ? 'is-clickable' : ''}`}
                  >
                    {isGenerating ? (
                      <span className="generated-image-placeholder is-loading">생성 중...</span>
                    ) : generatedImages[i] ? (
                      <img
                        src={generatedImages[i]}
                        alt={`표지 후보 ${i + 1}`}
                        className="generated-image"
                      />
                    ) : (
                      <span className="generated-image-placeholder">Preview {i + 1}</span>
                    )}
                  </div>
                ))}
              </div>

              {selectedImageIndex !== null && (
                <div className="selected-cover-message">
                  ✓ {selectedImageIndex + 1}번 이미지가 표지로 등록됩니다.
                </div>
              )}
            </div>
          )}

          <div className="book-form-foot">
            <button className="book-form-cancel-btn" onClick={onBack}>
              취소
            </button>

            <button className="book-form-save-btn" onClick={handleSave}>
              <i className="ti ti-check" />
              {isEdit ? '저장하기' : '등록하기'}
            </button>
          </div>
        </div>
      </div>

      {isSavePresetModalOpen && (
        <div className="preset-modal-overlay">
          <div className="save-preset-modal">
            <button
              type="button"
              className="preset-modal-close"
              onClick={handleCloseSavePresetModal}
            >
              ×
            </button>

            <div className="preset-modal-title">저장 창</div>

            <div className="preset-name-row">
              <label className="preset-name-label">프리셋 이름 :</label>
              <input
                className="preset-name-input"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="예: 해피목요일"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePreset()
                }}
              />
            </div>

            <button
              type="button"
              className="preset-modal-save-button"
              onClick={handleSavePreset}
            >
              저장
            </button>
          </div>
        </div>
      )}

      {isPresetModalOpen && (
        <div className="preset-modal-overlay">
          <div className="preset-list-modal">
            <button
              type="button"
              className="preset-modal-close"
              onClick={() => setIsPresetModalOpen(false)}
            >
              ×
            </button>

            <div className="preset-modal-title">프리셋 창</div>

            {presets.length === 0 ? (
              <div className="empty-preset-text">
                저장된 프리셋이 없습니다.
              </div>
            ) : (
              <div className="preset-list">
                {presets.map((preset) => (
                  <div key={preset.id} className="preset-card">
                    <div className="preset-card-title">{preset.name}</div>

                    <div className="preset-info">
                      <div>
                        AI 모델 : {
                          preset.model === 'gpt-image-2'
                            ? 'GPT Image 2'
                            : preset.model === 'gpt-image-1'
                              ? 'GPT Image 1'
                              : 'DALL-E 3'
                        }
                      </div>
                      <div>이미지 퀄리티 : {preset.quality}</div>
                      <div>스타일 : {preset.style}</div>
                      <div>배경 : {preset.background}</div>
                      <div>조명 : {preset.lighting}</div>
                      <div>타이포그래피 : {preset.typography}</div>
                    </div>

                    <div className="preset-card-buttons">
                      <button
                        type="button"
                        className="preset-select-button"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        선택
                      </button>

                      <button
                        type="button"
                        className="preset-delete-button"
                        onClick={() => handleDeletePreset(preset.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}