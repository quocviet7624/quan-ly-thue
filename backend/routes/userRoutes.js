const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const {
  getUsers,
  updateUserStatus,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController')

// Hồ sơ cá nhân - đặt trước route có :id để tránh xung đột
router.get('/me', verifyToken, getProfile)
router.put('/me', verifyToken, updateProfile)
router.put('/me/password', verifyToken, changePassword)

// Quản lý người dùng - dành cho admin
router.get('/', verifyToken, requireAdmin, getUsers)
router.patch('/:id/status', verifyToken, requireAdmin, updateUserStatus)

module.exports = router