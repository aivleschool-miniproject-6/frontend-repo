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

const BookCoverEditor = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()

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

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const targetId = id || 101
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/${targetId}`)

        if (!response.ok) throw new Error('책 데이터를 불러오지 못했습니다.')

        const data = await response.json()
        setHasCover(!!data.coverImageUrl)
      } catch (error) {
        console.error('DB 연동 에러:', error)
      }
    }

    fetchBookData()
  }, [id])

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

  const handleQualityChange = (qualityLevel) => {
    if (isGenerating) return

    if (apiConfig.model === 'dall-e-3' && qualityLevel !== 'High') {
      alert('DALL-E 3 모델은 고품질 모델이므로 High 퀄리티만 선택 가능합니다.')
      return
    }

    setApiConfig((prev) => ({
      ...prev,
      quality: qualityLevel,
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

      const requestBody = {
        model: apiConfig.model,
        quality: apiConfig.quality,
        prompt: userPrompt,
        style: selectedOptions.style,
        background: selectedOptions.background,
        lighting: selectedOptions.lighting,
        typography: selectedOptions.typography,
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/${id}/cover/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestBody),
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
    if (isGenerating) return

    if (selectedImageIndex === null) {
      alert('저장할 표지 이미지를 선택해주세요.')
      return
    }

    try {
      const targetId = id || 101
      const coverImageUrl = await compressImageDataUrl(generatedImages[selectedImageIndex])

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
              className={`${styles.imageSlot} ${selectedImageIndex === index ? styles.activeSlot : ''}`}
              onClick={() => {
                if (isGenerating) return
                if (generatedImages[index]) {
                  setSelectedImageIndex(index)
                }
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
        <div className={styles.optionsRow}>
          <h3 className={styles.label}>AI 모델</h3>
          <div className={styles.tagGroup}>
            {['gpt-image-2', 'gpt-image-1', 'dall-e-3'].map((model) => (
              <button
                key={model}
                type="button"
                disabled={isGenerating}
                className={`${styles.tag} ${apiConfig.model === model ? styles.activeTag : ''}`}
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
                className={`${styles.tag} ${apiConfig.quality === qualityLevel ? styles.activeTag : ''}`}
                onClick={() => handleQualityChange(qualityLevel)}
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
                className={`${styles.tag} ${selectedOptions.style === key ? styles.activeTag : ''}`}
                onClick={() => handleTagSelect('style', key)}
              >
                {key.toUpperCase()}
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
                className={`${styles.tag} ${selectedOptions.background === key ? styles.activeTag : ''}`}
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
                className={`${styles.tag} ${selectedOptions.lighting === key ? styles.activeTag : ''}`}
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
                className={`${styles.tag} ${selectedOptions.typography === key ? styles.activeTag : ''}`}
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
            placeholder="어떤 느낌의 표지를 원하시나요? 객체, 색감, 분위기 등을 자유롭게 적어주세요. (예: 어두운 숲 속 한가운데 밝게 빛나는 랜턴 하나)"
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
            {isGenerating ? '이미지 생성 중 (잠시만 기다려주세요)...' : '표지 후보 3장 생성하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookCoverEditor