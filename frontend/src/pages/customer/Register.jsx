import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../services/authService'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await register(form)
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch {
      setError('Đăng ký thất bại. Email có thể đã được sử dụng.')
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Đăng ký</h1>
        {error && <p className="error-text">{error}</p>}
        <label>
          Họ tên
          <input name="full_name" value={form.full_name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Số điện thoại
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="btn-primary">
          Đăng ký
        </button>
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}