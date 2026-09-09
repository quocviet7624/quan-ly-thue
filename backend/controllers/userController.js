const pool = require('../config/db')
const bcrypt = require('bcryptjs')

async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, status, created_at FROM users ORDER BY id DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateUserStatus(req, res) {
  const { status } = req.body
  if (!['active', 'locked'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
  }

  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function getProfile(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateProfile(req, res) {
  const { full_name, phone, address } = req.body
  if (!full_name) return res.status(400).json({ message: 'Họ tên không được để trống' })

  try {
    await pool.query('UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?', [
      full_name,
      phone || null,
      address || null,
      req.user.id,
    ])
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, address, role FROM users WHERE id = ?',
      [req.user.id]
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body
  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' })
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự trở lên' })
  }

  try {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [
      req.user.id,
    ])
    const match = await bcrypt.compare(current_password, rows[0].password_hash)
    if (!match) return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' })

    const newHash = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id])
    res.json({ message: 'Đổi mật khẩu thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

module.exports = {
  getUsers,
  updateUserStatus,
  getProfile,
  updateProfile,
  changePassword,
}