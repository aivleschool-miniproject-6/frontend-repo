const API_BASE = import.meta.env.VITE_API_BASE_URL

export async function getPresets(token) {
  const res = await fetch(`${API_BASE}/presets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('프리셋 목록 조회 실패')
  return res.json()
}

export async function createPreset(token, preset) {
  const res = await fetch(`${API_BASE}/presets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preset),
  })

  if (!res.ok) throw new Error('프리셋 저장 실패')
  return res.json()
}

export async function updatePreset(token, id, preset) {
  const res = await fetch(`${API_BASE}/presets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preset),
  })

  if (!res.ok) throw new Error('프리셋 수정 실패')
  return res.json()
}

export async function deletePreset(token, id) {
  const res = await fetch(`${API_BASE}/presets/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('프리셋 삭제 실패')
}