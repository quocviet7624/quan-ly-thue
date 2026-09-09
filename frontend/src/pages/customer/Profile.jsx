import { useEffect, useState } from 'react'
import { getProfile, updateProfile, changePassword } from '../../services/userService'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwError, setPwError] = useState(null)
  const [pwMessage, setPwMessage] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
        })
      })
      .catch(() => setError('Không tải được thông tin hồ sơ.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)

      // Cập nhật lại tên hiển thị ở Navbar (localStorage)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name: updated.full_name }))

      setMessage('Cập nhật hồ sơ thành công!')
    } catch {
      setError('Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  function handlePwChange(e) {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value })
  }

  async function handlePwSubmit(e) {
    e.preventDefault()
    setPwError(null)
    setPwMessage(null)

    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Mật khẩu mới nhập lại không khớp.')
      return
    }

    setPwSaving(true)
    try {
      await changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      setPwMessage('Đổi mật khẩu thành công!')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Đổi mật khẩu thất bại.')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <p>Đang tải...</p>
  if (error && !profile) return <p className="error-text">{error}</p>

  return (
    <div className="profile-page">
      <h1>Hồ sơ của tôi</h1>

      <div className="profile-grid">
        {/* Cột thông tin cá nhân */}
        <form onSubmit={handleSubmit} className="profile-card">
          <h2>Thông tin cá nhân</h2>

          <label>
            Email
            <input type="email" value={profile.email} disabled />
          </label>

          <label>
            Họ tên
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Số điện thoại
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>

          <label>
            Địa chỉ
            <input name="address" value={form.address} onChange={handleChange} />
          </label>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>

        {/* Cột đổi mật khẩu */}
        <form onSubmit={handlePwSubmit} className="profile-card">
          <h2>Đổi mật khẩu</h2>

          <label>
            Mật khẩu hiện tại
            <input
              type="password"
              name="current_password"
              value={pwForm.current_password}
              onChange={handlePwChange}
              required
            />
          </label>

          <label>
            Mật khẩu mới
            <input
              type="password"
              name="new_password"
              value={pwForm.new_password}
              onChange={handlePwChange}
              required
              minLength={6}
            />
          </label>

          <label>
            Nhập lại mật khẩu mới
            <input
              type="password"
              name="confirm_password"
              value={pwForm.confirm_password}
              onChange={handlePwChange}
              required
              minLength={6}
            />
          </label>

          {pwMessage && <p className="success-text">{pwMessage}</p>}
          {pwError && <p className="error-text">{pwError}</p>}

          <button type="submit" className="btn-primary" disabled={pwSaving}>
            {pwSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}