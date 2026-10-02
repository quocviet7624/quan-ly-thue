const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController')

// Hồ sơ cá nhân (mọi vai trò) - đặt trước route có :id để tránh xung đột
router.get('/me', verifyToken, getProfile)
router.put('/me', verifyToken, updateProfile)
router.put('/me/password', verifyToken, changePassword)

// Quản lý tài khoản - phân quyền: chỉ Admin
router.get('/', verifyToken, requireAdmin, getUsers)
router.patch('/:id/role', verifyToken, requireAdmin, updateUserRole)
router.patch('/:id/status', verifyToken, requireAdmin, updateUserStatus)

module.exports = router