import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' || user.role === 'staff' ? '/admin' : '/')
    } catch {
      setError('Email hoặc mật khẩu không đúng.')
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Đăng nhập</h1>
        {error && <p className="error-text">{error}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn-primary">
          Đăng nhập
        </button>
        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  )
}