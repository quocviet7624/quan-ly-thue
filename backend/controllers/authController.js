const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function register(req, res) {
  const { full_name, email, phone, password } = req.body
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email đã được sử dụng' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone || null, password_hash, 'customer']
    )

    res.status(201).json({ message: 'Đăng ký thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    if (user.status === 'locked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' })
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

module.exports = { register, login }