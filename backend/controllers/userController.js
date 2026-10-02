const pool = require('../config/db')
const bcrypt = require('bcryptjs')

const VALID_ROLES = ['customer', 'staff', 'admin']
const VALID_STATUSES = ['active', 'locked']

// ============================================================
// Admin: quản lý tài khoản - phân quyền
// ============================================================
async function getUsers(req, res) {
  const { role, search } = req.query
  let sql =
    'SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE 1=1'
  const params = []

  if (role && VALID_ROLES.includes(role)) {
    sql += ' AND role = ?'
    params.push(role)
  }
  if (search) {
    sql += ' AND (full_name LIKE ? OR email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }
  sql += ' ORDER BY id DESC'

  try {
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// Admin phân quyền: customer (Người thuê) / staff (Người cho thuê) / admin
async function updateUserRole(req, res) {
  const { role } = req.body
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Vai trò không hợp lệ' })
  }
  // Không cho tự đổi quyền của chính mình (tránh mất hết admin)
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự thay đổi vai trò của chính mình' })
  }

  try {
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [
      role,
      req.params.id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }
    res.json({ message: 'Cập nhật vai trò thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateUserStatus(req, res) {
  const { status } = req.body
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
  }
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình' })
  }

  try {
    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [
      status,
      req.params.id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ============================================================
// Người dùng bất kỳ: quản lý hồ sơ
// ============================================================
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
  updateUserRole,
  updateUserStatus,
  getProfile,
  updateProfile,
  changePassword,
}