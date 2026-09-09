const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const { getUsers, updateUserStatus } = require('../controllers/userController')

router.get('/', verifyToken, requireAdmin, getUsers)
router.patch('/:id/status', verifyToken, requireAdmin, updateUserStatus)

module.exports = router