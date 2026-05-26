import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './editor.module.css'
import {
  STYLE_PRESETS,
  BACKGROUND_PRESETS,
  LIGHTING_PRESETS,
  TYPOGRAPHY_PRESETS,
  buildStructuredPrompt,
  generateBookCover,
} from '../../util/bookCoverService'

const BookCoverEditor = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [dbBookInfo, setDbBookInfo] = useState({
    title: '',
    author: '',
    originalContent: '',
  })

  const [userPrompt, setUserPrompt] = useState('')

  const [selectedOptions, setSelectedOptions] = useState({
    style: 'miki',
    background: 'beige',
    lighting: 'daylight',
    typography: 'serif',
  })

  const [generatedImages, setGeneratedImages] = useState([null, null, null])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const targetId = id || 101;
        const response = await fetch(`http://localhost:5000/books/${targetId}`);
        
        if (!response.ok) throw new Error('책 데이터를 불러오지 못했습니다.');
        
        const data = await response.json();
        
        setDbBookInfo({
          title: data.title,
          author: data.author,
          originalContent: data.content,
        });
      } catch (error) {
        console.error('DB 연동 에러:', error);
      }
    };

    fetchBookData();
  }, [id]);

  const handleTagSelect = (category, key) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: key,
    }))
  }

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      alert('어떤 스타일의 표지를 원하시는지 프롬프트를 작성해주세요!')
      return
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    if (!apiKey) {
      alert('.env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.')
      return
    }

    try {
      setIsGenerating(true)
      setSelectedImageIndex(null) 
      setGeneratedImages([null, null, null]) 

      const combinedInfo = {
        title: dbBookInfo.title,
        author: dbBookInfo.author,
        content: `[Book Story]: ${dbBookInfo.originalContent} / [User Design Request]: ${userPrompt}`
      }

      const finalPrompt = buildStructuredPrompt(combinedInfo, selectedOptions)
      
      const generatePromises = [
        generateBookCover(apiKey, finalPrompt),
        generateBookCover(apiKey, finalPrompt),
        generateBookCover(apiKey, finalPrompt)
      ];

      const newImages = await Promise.all(generatePromises);
      setGeneratedImages(newImages);

    } catch (error) {
      console.error(error)
      alert(`이미지 생성 중 오류가 발생했습니다: ${error.message}`)
      setGeneratedImages([null, null, null])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (selectedImageIndex === null) {
      alert('저장할 표지 이미지를 선택해주세요.');
      return;
    }

    try {
      const targetId = id || 101;
      const response = await fetch(`http://localhost:5000/books/${targetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverImageUrl: generatedImages[selectedImageIndex]
        }),
      });

      if (response.ok) {
        alert('✨ 표지가 성공적으로 수정되었습니다!');
        navigate(-1);
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      console.error(error);
      alert('표지 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
    

      <div className={styles.glassContainer}>
        <div className={styles.previewSection}>
          {[0, 1, 2].map((index) => (
            <div 
              key={index} 
              className={`${styles.imageSlot} ${selectedImageIndex === index ? styles.activeSlot : ''}`}
              onClick={() => generatedImages[index] && setSelectedImageIndex(index)}
              style={{ cursor: generatedImages[index] ? 'pointer' : 'default' }}
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
            <button className={styles.applyBtn} onClick={handleSave}>
              ✨ 선택한 이미지로 표지 수정 반영하기
            </button>
          </div>
        )}
      </div>

      <div className={styles.controlPanel}>
        <div className={styles.optionsRow}>
          <h3 className={styles.label}>스타일</h3>
          <div className={styles.tagGroup}>
            {Object.keys(STYLE_PRESETS).map((key) => (
              <button
                key={key}
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
            placeholder="어떤 느낌의 표지를 원하시나요? 객체, 색감, 분위기 등을 자유롭게 적어주세요. (예: 어두운 숲 속 한가운데 밝게 빛나는 랜턴 하나)"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
        </div>

        <div className={styles.actionRow}>
          <button className={styles.generateBtn} onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '이미지 생성 중 (잠시만 기다려주세요)...' : '표지 후보 3장 생성하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookCoverEditor