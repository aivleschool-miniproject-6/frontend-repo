import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const s = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#eeece6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a18',
    marginBottom: 28,
    textAlign: 'center',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1a1a18',
  },
  input: {
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid rgba(0,0,0,0.18)',
    borderRadius: 8,
    outline: 'none',
    background: '#fafaf9',
  },
  submitBtn: {
    width: '100%',
    padding: '12px 0',
    fontSize: 15,
    fontWeight: 600,
    background: '#1a1a18',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 8,
  },
  error: {
    fontSize: 13,
    color: '#c0392b',
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    color: '#6b6b67',
    textAlign: 'center',
  },
  link: {
    color: '#1a1a18',
    fontWeight: 600,
    textDecoration: 'none',
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/mypage', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>로그인</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>이메일</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>비밀번호</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div style={s.footer}>
          계정이 없으신가요?{' '}
          <Link to="/signup" style={s.link}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
