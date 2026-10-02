import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../services/authService'
import AuthHero from '../../components/AuthHero'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(form)
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch {
      setError('Đăng ký thất bại. Email có thể đã được sử dụng.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthHero
        heading="Tạo tài khoản"
        highlight="chỉ trong 1 phút"
        description="Đăng ký miễn phí để bắt đầu thuê mọi thứ bạn cần, từ đồ dùng hằng ngày đến thiết bị chuyên dụng."
      />

      <div className="auth-panel">
        <form onSubmit={handleSubmit} className="auth-form">
          <h1>Đăng ký</h1>
          <p className="auth-form-sub">Điền thông tin bên dưới để tạo tài khoản mới</p>

          {error && <p className="error-text">{error}</p>}

          <label>
            Họ tên
            <input
              name="full_name"
              placeholder="Nguyễn Văn A"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="ban@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Số điện thoại
            <input
              name="phone"
              placeholder="0900 000 000"
              value={form.phone}
              onChange={handleChange}
            />
          </label>

          <label>
            Mật khẩu
            <div className="auth-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  )
}