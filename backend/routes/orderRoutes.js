const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController')

router.post('/', verifyToken, createOrder)
router.get('/me', verifyToken, getMyOrders)
router.get('/', verifyToken, requireAdmin, getAllOrders)
router.get('/:id', verifyToken, getOrderById)
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus)
router.delete('/:id', verifyToken, requireAdmin, deleteOrder)

module.exports = router