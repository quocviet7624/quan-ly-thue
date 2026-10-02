const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const { chat } = require('../controllers/chatController')

// Người thuê và Người cho thuê đều dùng được (phải đăng nhập để tránh lạm dụng API key)
router.post('/', verifyToken, chat)

module.exports = router