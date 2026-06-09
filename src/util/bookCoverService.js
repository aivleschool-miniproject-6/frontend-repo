// 스타일 프롬프트 프리셋
export const STYLE_PRESETS = {
  '수채화': 'Line Art (clean lines, delicate watercolor bleeding effects, minimalist aesthetic, subtle textures, high artistic quality)',
  '3D애니메이션': '3D Animated style (vibrant colors, expressive characters, soft volumetric lighting, detailed clay-like rendering, rich textures)',
  '유화': 'Oil Painting Classic (visible heavy brushstrokes, rich impasto texture, deep color palette, classic chiaroscuro lighting, canvas texture)',
  '미니멀리즘': 'Modern Minimalism (bold geometric shapes, flat design elements, high contrast, elegant negative space, corporate vector art style)',
  '빈티지': 'vintage pulp fiction (gritty textures, bold halftone patterns, dramatic chiaroscuro lighting, exaggerated character expressions, retro color palette)',
  '일러스트': 'Warm Anime Illustration style (soft pastel colors, whimsical character design, hand-drawn textures, warm nostalgic lighting, dreamy atmosphere)'
};
// 배경 프롬프트 프리셋
export const BACKGROUND_PRESETS = {
  '베이지': 'Muted Warm Beige background (subtle watercolor paper texture, organic warm tones)',
  '사이버틱': 'Dark Cyber Minimal background (deep obsidian dark space, neon light trails)',
  '화이트': 'Pure Clean White background (sharp cast shadows, absolute clinical whitespace)',
  '레트로': 'Retro Gradient background (vibrant sunset gradient with subtle grain texture)',
  '자연': 'Lush Nature background (soft-focus forest with dappled sunlight, natural textures)',
  '추상': 'Abstract Geometric background (bold geometric shapes in complementary colors, dynamic composition)'
};

// 조명 프롬프트 프리셋
export const LIGHTING_PRESETS = {
  '자연광': 'Soft Diffused Daylight (gentle natural lighting coming from top-left, pastel palette)',
  '대비광': 'Cinematic High-Contrast (strong rim lighting, deep dramatic shadows)',
  '따뜻한광': 'Warm Golden Hour (rich golden tones, long soft shadows, warm highlights)',
};

// 타이포그래피 프롬프트 프리셋
export const TYPOGRAPHY_PRESETS = {
  '클래식 명조': 'Serif Classic Typography layout (book title written in elegant Serif typeface at top-center in large letters)',
  '모던 고딕': 'Sans-Serif Minimal Typography layout (book title positioned dynamically in the center space)',
  '감성 손글씨': 'Handwritten Script Typography layout (book title in flowing handwritten script, artistically integrated with the illustration)',
};

// 품질 유지를 위한 방어벽 키워드 (고정값)
const TECHNICAL_DEFAULT = '85mm portrait lens at f/1.8, razor-sharp focus, cinematic background bokeh.';
const NEGATIVE_DEFAULT = 'low quality, blurry, distorted text, garbled letters, misspelled text, watermark.';


// 프롬프트 조립 함수: 책 정보와 옵션을 받아서 최종 프롬프트 문자열로 조립하여 반환
export function buildStructuredPrompt(book, options) {
  const stylePrompt = STYLE_PRESETS[options.style] || STYLE_PRESETS['수채화']; // 기본값 수채화
  const backgroundPrompt = BACKGROUND_PRESETS[options.background] || BACKGROUND_PRESETS['베이지']; // 기본값 베이지
  const lightingPrompt = LIGHTING_PRESETS[options.lighting] || LIGHTING_PRESETS['자연광']; // 기본값 자연광
  const typographyPrompt = TYPOGRAPHY_PRESETS[options.typography] || TYPOGRAPHY_PRESETS['클래식 명조']; // 기본값 클래식 명조

  // 대문자 구획 태그 형식으로 조립
  return `
[STYLE]
${stylePrompt}
[SUBJECT]
A professional book cover design. Main theme concept: ${book.content}. Title: "${book.title}". Author: "${book.author}".
[BACKGROUND]
${backgroundPrompt}
[LIGHTING]
${lightingPrompt}
[TYPOGRAPHY]
${typographyPrompt}
[TECHNICAL]
${TECHNICAL_DEFAULT}
[NEGATIVE]
${NEGATIVE_DEFAULT}
`.trim();
}


// API 직접 호출에서 백엔드로 변경
export async function generateBookCover(bookId, prompt, selectedOptions) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/cover/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookId: Number(bookId),
      prompt,
      selectedOptions
    })
  })

  if (!response.ok) {
    throw new Error(`이미지 생성 실패 (Status: ${response.status})`)
  }

  const data = await response.json()
  // 응답: { images: [base64_1, base64_2, base64_3] }
  return data.images || []
}

export async function compressImageDataUrl(dataUrl, maxBytes = 75000) {
  if (!dataUrl?.startsWith('data:image/')) return dataUrl || '';
  if (dataUrl.length <= maxBytes) return dataUrl;

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 압축할 수 없습니다.'));
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const aspect = image.height / image.width || 1.5;
  const widths = [360, 320, 280, 240, 200, 180];
  const qualities = [0.72, 0.62, 0.52, 0.42, 0.34];

  for (const width of widths) {
    canvas.width = width;
    canvas.height = Math.round(width * aspect);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of qualities) {
      const compressed = canvas.toDataURL('image/jpeg', quality);
      if (compressed.length <= maxBytes) return compressed;
    }
  }

  return canvas.toDataURL('image/jpeg', 0.28);
}
