const pool = require('../config/db')

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

module.exports = { getUsers, updateUserStatus }