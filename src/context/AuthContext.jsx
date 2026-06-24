import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'auth'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStorage())

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // { accessToken, tokenType, userId, email, nickname }
    const data = await res.json()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setAuth(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }, [])

  const value = {
    user: auth
      ? { userId: auth.userId, email: auth.email, nickname: auth.nickname }
      : null,
    token: auth?.accessToken ?? null,
    isLoggedIn: !!auth?.accessToken,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
