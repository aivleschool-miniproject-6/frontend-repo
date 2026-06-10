import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL

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
  inputRow: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid rgba(0,0,0,0.18)',
    borderRadius: 8,
    outline: 'none',
    background: '#fafaf9',
    minWidth: 0,
  },
  checkBtn: {
    flexShrink: 0,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    background: '#f5f5f4',
    color: '#1a1a18',
    border: '1px solid rgba(0,0,0,0.18)',
    borderRadius: 8,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  checkBtnDisabled: {
    flexShrink: 0,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    background: '#f5f5f4',
    color: '#aaa',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 8,
    cursor: 'default',
    whiteSpace: 'nowrap',
  },
  checkBtnConfirmed: {
    flexShrink: 0,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    background: '#f5f5f4',
    color: '#aaa',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 8,
    cursor: 'default',
    whiteSpace: 'nowrap',
  },
  hint: (type) => ({
    fontSize: 12,
    color: type === 'ok' ? '#27ae60' : '#c0392b',
    marginTop: 2,
  }),
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
  submitBtnDisabled: {
    width: '100%',
    padding: '12px 0',
    fontSize: 15,
    fontWeight: 600,
    background: '#aaa',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'default',
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

export default function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordConfirmStatus, setPasswordConfirmStatus] = useState(null) // null | 'ok' | 'mismatch'
  const [passwordTouched, setPasswordTouched] = useState(false)

  const [emailCheck, setEmailCheck] = useState(null)     // null | 'ok' | 'taken'
  const [nicknameCheck, setNicknameCheck] = useState(null)
  const [emailFormatError, setEmailFormatError] = useState(false)

  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingNickname, setCheckingNickname] = useState(false)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const PASSWORD_RULES = [
    { label: '8자 이상', test: (v) => v.length >= 8 },
    { label: '대문자 포함', test: (v) => /[A-Z]/.test(v) },
    { label: '숫자 포함', test: (v) => /[0-9]/.test(v) },
    { label: '특수문자 포함', test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
  ]
  const isValidPassword = (val) => PASSWORD_RULES.every((r) => r.test(val))

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailCheck(null)
    setEmailFormatError(false)
  }

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) setEmailFormatError(true)
    else setEmailFormatError(false)
  }

  const handleNicknameChange = (e) => {
    setNickname(e.target.value)
    setNicknameCheck(null)
  }

  const handleCheckEmail = async () => {
    if (!email) return
    setCheckingEmail(true)
    try {
      const res = await fetch(`${API_BASE}/users/check-email?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setEmailCheck(data.available ? 'ok' : 'taken')
    } catch {
      setEmailCheck('taken')
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleCheckNickname = async () => {
    if (!nickname) return
    setCheckingNickname(true)
    try {
      const res = await fetch(`${API_BASE}/users/check-nickname?nickname=${encodeURIComponent(nickname)}`)
      const data = await res.json()
      setNicknameCheck(data.available ? 'ok' : 'taken')
    } catch {
      setNicknameCheck('taken')
    } finally {
      setCheckingNickname(false)
    }
  }

  const canSubmit = emailCheck === 'ok' && nicknameCheck === 'ok' && isValidPassword(password) && passwordConfirmStatus === 'ok' && !loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || '회원가입에 실패했습니다.')
      }

      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>회원가입</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>

          {/* 이메일 */}
          <div style={s.field}>
            <label style={s.label}>이메일</label>
            <div style={s.inputRow}>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="이메일을 입력하세요"
                required
                autoFocus
              />
              <button
                type="button"
                style={emailCheck === 'ok' ? s.checkBtnConfirmed : email && !checkingEmail && !emailFormatError ? s.checkBtn : s.checkBtnDisabled}
                onClick={handleCheckEmail}
                disabled={!email || checkingEmail || emailCheck === 'ok' || emailFormatError}
              >
                {checkingEmail ? '확인 중' : emailCheck === 'ok' ? '확인완료' : '중복확인'}
              </button>
            </div>
            {emailFormatError && <span style={s.hint('err')}>올바른 이메일 형식이 아닙니다.</span>}
            {!emailFormatError && emailCheck === 'taken' && <span style={s.hint('err')}>이미 사용 중인 이메일입니다.</span>}
          </div>

          {/* 닉네임 */}
          <div style={s.field}>
            <label style={s.label}>닉네임</label>
            <div style={s.inputRow}>
              <input
                style={s.input}
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임을 입력하세요"
                required
              />
              <button
                type="button"
                style={nicknameCheck === 'ok' ? s.checkBtnConfirmed : nickname && !checkingNickname ? s.checkBtn : s.checkBtnDisabled}
                onClick={handleCheckNickname}
                disabled={!nickname || checkingNickname || nicknameCheck === 'ok'}
              >
                {checkingNickname ? '확인 중' : nicknameCheck === 'ok' ? '확인완료' : '중복확인'}
              </button>
            </div>
            {nicknameCheck === 'taken' && <span style={s.hint('err')}>이미 사용 중인 닉네임입니다.</span>}
          </div>

          {/* 비밀번호 */}
          <div style={s.field}>
            <label style={s.label}>비밀번호</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordConfirmStatus(null) }}
              onBlur={() => setPasswordTouched(true)}
              placeholder="비밀번호를 입력하세요"
              required
            />
            {passwordTouched && PASSWORD_RULES.map((rule) =>
              !rule.test(password) && (
                <span key={rule.label} style={s.hint('err')}>{rule.label}이 필요합니다.</span>
              )
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div style={s.field}>
            <label style={s.label}>비밀번호 확인</label>
            <input
              style={s.input}
              type="password"
              value={passwordConfirm}
              onChange={(e) => { setPasswordConfirm(e.target.value); setPasswordConfirmStatus(null) }}
              onBlur={() => { if (passwordConfirm) setPasswordConfirmStatus(password === passwordConfirm ? 'ok' : 'mismatch') }}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {passwordConfirmStatus === 'ok' && <span style={s.hint('ok')}>비밀번호가 일치합니다.</span>}
            {passwordConfirmStatus === 'mismatch' && <span style={s.hint('err')}>비밀번호가 일치하지 않습니다.</span>}
          </div>

          <button
            style={canSubmit ? s.submitBtn : s.submitBtnDisabled}
            type="submit"
            disabled={!canSubmit}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <div style={s.footer}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={s.link}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
