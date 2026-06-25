import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './editor.module.css'

import {
  STYLE_PRESETS,
  BACKGROUND_PRESETS,
  LIGHTING_PRESETS,
  TYPOGRAPHY_PRESETS,
  compressImageDataUrl,
} from '../../util/bookCoverService'

import {
  getPresets,
  createPreset,
  deletePreset,
} from '../../api/presetApi'

const BookCoverEditor = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const auth = useAuth()

  const token =
    auth?.token ||
    auth?.accessToken ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token')

  const [hasCover, setHasCover] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')

  const [selectedOptions, setSelectedOptions] = useState({
    style: '수채화',
    background: '베이지',
    lighting: '자연광',
    typography: '클래식 명조',
  })

  const [apiConfig, setApiConfig] = useState({
    model: 'gpt-image-2',
    quality: 'Medium',
  })

  const [generatedImages, setGeneratedImages] = useState([null, null, null])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  const [presets, setPresets] = useState([])
  const [presetName, setPresetName] = useState('')
  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false)
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)

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
    style: selectedOptions.style,
    background: selectedOptions.background,
    lighting: selectedOptions.lighting,
    typography: selectedOptions.typography,
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

    setSelectedOptions({
      style: preset.style || selectedOptions.style,
      background: preset.background || selectedOptions.background,
      lighting: preset.lighting || selectedOptions.lighting,
      typography: preset.typography || selectedOptions.typography,
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

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const targetId = id || 101

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/books/${targetId}`
        )

        if (!response.ok) {
          throw new Error('책 데이터를 불러오지 못했습니다.')
        }

        const data = await response.json()

        setHasCover(!!data.coverImageUrl)
      } catch (error) {
        console.error('DB 연동 에러:', error)
      }
    }

    fetchBookData()
  }, [id])

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

  const handleTagSelect = (category, key) => {
    if (isGenerating) return

    setSelectedOptions((prev) => ({
      ...prev,
      [category]: key,
    }))
  }

  const handleModelChange = (modelName) => {
    if (isGenerating) return

    setApiConfig((prev) => ({
      model: modelName,
      quality: modelName === 'dall-e-3' ? 'High' : prev.quality,
    }))
  }

  const handleGenerate = async () => {
    if (isGenerating) return

    if (!userPrompt.trim()) {
      alert('어떤 스타일의 표지를 원하시는지 프롬프트를 작성해주세요!')
      return
    }

    try {
      setIsGenerating(true)
      setSelectedImageIndex(null)
      setGeneratedImages([null, null, null])

      const targetId = id || 101

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/books/${targetId}/cover/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            model: apiConfig.model,
            quality: apiConfig.quality,
            prompt: userPrompt,
            style: selectedOptions.style,
            background: selectedOptions.background,
            lighting: selectedOptions.lighting,
            typography: selectedOptions.typography,
          }),
        }
      )

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`이미지 생성 요청 실패 (Status: ${response.status}) - ${errBody}`)
      }

      const data = await response.json()
      setGeneratedImages(data.images || [null, null, null])
    } catch (error) {
      console.error('이미지 생성 실패:', error)
      alert(`이미지 생성 중 오류가 발생했습니다: ${error.message}`)
      setGeneratedImages([null, null, null])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (isGenerating) return

    if (selectedImageIndex === null) {
      alert('저장할 표지 이미지를 선택해주세요.')
      return
    }

    try {
      const targetId = id || 101
      const selectedImage = generatedImages[selectedImageIndex]

      if (!selectedImage) {
        alert('선택한 이미지가 없습니다.')
        return
      }

      const coverImageUrl = await compressImageDataUrl(selectedImage)

      const saveEndpoint = hasCover
        ? `${import.meta.env.VITE_API_BASE_URL}/books/${targetId}/cover-editor`
        : `${import.meta.env.VITE_API_BASE_URL}/books/${targetId}/cover`

      const response = await fetch(saveEndpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          coverImageUrl,
        }),
      })

      if (response.ok) {
        alert('표지가 성공적으로 수정되었습니다!')
        navigate(-1)
      } else {
        throw new Error('저장 실패')
      }
    } catch (error) {
      console.error(error)
      alert('표지 저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.glassContainer}>
        <div className={styles.previewSection}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`${styles.imageSlot} ${
                selectedImageIndex === index ? styles.activeSlot : ''
              }`}
              onClick={() => {
                if (isGenerating) return
                if (generatedImages[index]) setSelectedImageIndex(index)
              }}
              style={{
                cursor: isGenerating
                  ? 'not-allowed'
                  : generatedImages[index]
                    ? 'pointer'
                    : 'default',
              }}
            >
              {isGenerating ? (
                <div className={styles.loadingSpinner}>생성 중...</div>
              ) : generatedImages[index] ? (
                <img
                  src={generatedImages[index]}
                  alt={`생성된 표지 후보 ${index + 1}`}
                  className={styles.generatedImg}
                />
              ) : (
                <span className={styles.slotText}>Preview {index + 1}</span>
              )}
            </div>
          ))}
        </div>

        {selectedImageIndex !== null && (
          <div className={styles.applyWrapper}>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleSave}
              disabled={isGenerating}
            >
              ✨ 선택한 이미지로 표지 수정 반영하기
            </button>
          </div>
        )}
      </div>

      <div className={styles.controlPanel}>
        <div className={styles.editorHeader}>
          <div>
            <div className={styles.editorTitle}>
              <i className="ti ti-wand" />
              AI 표지 편집
            </div>

            <p className={styles.editorSubTitle}>
              자주 사용하는 생성 옵션은 프리셋으로 저장해둘 수 있습니다.
            </p>
          </div>

          <div className={styles.presetTopButtons}>
            <button
              type="button"
              className={styles.presetTopButton}
              onClick={handleOpenSavePresetModal}
            >
              저장
            </button>

            <button
              type="button"
              className={styles.presetTopButton}
              onClick={handleOpenPresetModal}
            >
              프리셋
            </button>
          </div>
        </div>

        <div className={styles.optionsRow}>
          <h3 className={styles.label}>AI 모델</h3>

          <div className={styles.tagGroup}>
            {['gpt-image-2', 'gpt-image-1', 'dall-e-3'].map((model) => (
              <button
                key={model}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${
                  apiConfig.model === model ? styles.activeTag : ''
                }`}
                onClick={() => handleModelChange(model)}
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

        <div className={styles.optionsRow}>
          <h3 className={styles.label}>이미지 퀄리티</h3>

          <div className={styles.tagGroup}>
            {['Low', 'Medium', 'High'].map((qualityLevel) => (
              <button
                key={qualityLevel}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${
                  apiConfig.quality === qualityLevel ? styles.activeTag : ''
                }`}
                onClick={() => {
                  if (isGenerating) return

                  if (apiConfig.model === 'dall-e-3' && qualityLevel !== 'High') {
                    alert('DALL-E 3 모델은 고품질 모델이므로 High 퀄리티만 선택 가능합니다.')
                    return
                  }

                  setApiConfig((prev) => ({
                    ...prev,
                    quality: qualityLevel,
                  }))
                }}
              >
                {qualityLevel}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.optionsRow}>
          <h3 className={styles.label}>스타일</h3>

          <div className={styles.tagGroup}>
            {Object.keys(STYLE_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${
                  selectedOptions.style === key ? styles.activeTag : ''
                }`}
                onClick={() => handleTagSelect('style', key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.optionsRow}>
          <h3 className={styles.label}>배경 / 조명</h3>

          <div className={styles.tagGroup}>
            {Object.keys(BACKGROUND_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${
                  selectedOptions.background === key ? styles.activeTag : ''
                }`}
                onClick={() => handleTagSelect('background', key)}
              >
                {key}
              </button>
            ))}

            <span className={styles.divider}>|</span>

            {Object.keys(LIGHTING_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${
                  selectedOptions.lighting === key ? styles.activeTag : ''
                }`}
                onClick={() => handleTagSelect('lighting', key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.optionsRow}>
          <h3 className={styles.label}>타이포그래피</h3>

          <div className={styles.tagGroup}>
            {Object.keys(TYPOGRAPHY_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${
                  selectedOptions.typography === key ? styles.activeTag : ''
                }`}
                onClick={() => handleTagSelect('typography', key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.promptRow}>
          <h3 className={styles.label}>프롬프트</h3>

          <textarea
            className={styles.promptInput}
            disabled={isGenerating}
            placeholder="어떤 느낌의 표지를 원하시나요? 객체, 색감, 분위기 등을 자유롭게 적어주세요. 예: 어두운 숲 속 한가운데 밝게 빛나는 랜턴 하나"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? '이미지 생성 중...' : '표지 후보 3장 생성하기'}
          </button>
        </div>
      </div>

      {isSavePresetModalOpen && (
        <div className={styles.presetModalOverlay}>
          <div className={styles.savePresetModal}>
            <button
              type="button"
              className={styles.presetModalClose}
              onClick={handleCloseSavePresetModal}
            >
              ×
            </button>

            <div className={styles.presetModalTitle}>저장 창</div>

            <div className={styles.presetNameRow}>
              <label className={styles.presetNameLabel}>프리셋 이름 :</label>

              <input
                className={styles.presetNameInput}
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
              className={styles.presetModalSaveButton}
              onClick={handleSavePreset}
            >
              저장
            </button>
          </div>
        </div>
      )}

      {isPresetModalOpen && (
        <div className={styles.presetModalOverlay}>
          <div className={styles.presetListModal}>
            <button
              type="button"
              className={styles.presetModalClose}
              onClick={() => setIsPresetModalOpen(false)}
            >
              ×
            </button>

            <div className={styles.presetModalTitle}>프리셋 창</div>

            {presets.length === 0 ? (
              <div className={styles.emptyPresetText}>
                저장된 프리셋이 없습니다.
              </div>
            ) : (
              <div className={styles.presetList}>
                {presets.map((preset) => (
                  <div key={preset.id} className={styles.presetCard}>
                    <div className={styles.presetCardTitle}>
                      {preset.name}
                    </div>

                    <div className={styles.presetInfo}>
                      <div>
                        AI 모델 :{' '}
                        {preset.model === 'gpt-image-2'
                          ? 'GPT Image 2'
                          : preset.model === 'gpt-image-1'
                            ? 'GPT Image 1'
                            : 'DALL-E 3'}
                      </div>

                      <div>이미지 퀄리티 : {preset.quality}</div>
                      <div>스타일 : {preset.style}</div>
                      <div>배경 : {preset.background}</div>
                      <div>조명 : {preset.lighting}</div>
                      <div>타이포그래피 : {preset.typography}</div>
                    </div>

                    <div className={styles.presetCardButtons}>
                      <button
                        type="button"
                        className={styles.presetSelectButton}
                        onClick={() => handleApplyPreset(preset)}
                      >
                        선택
                      </button>

                      <button
                        type="button"
                        className={styles.presetDeleteButton}
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

export default BookCoverEditor