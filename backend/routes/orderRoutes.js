const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin, requireStaff } = require('../middleware/auth')
const {
  createOrder,
  createOrderAdmin,
  updateOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  vnpayReturn,
} = require('../controllers/orderController')

// QUAN TRỌNG: route tĩnh phải khai báo TRƯỚC route động '/:id'.
router.get('/vnpay-return', vnpayReturn)

// ---- Người thuê: đặt thuê + xem đơn của mình ----
router.post('/', verifyToken, createOrder)
router.get('/me', verifyToken, getMyOrders)

// ---- Người cho thuê (staff) + Admin: tạo đơn tại quầy ----
// '/admin' giữ lại làm alias để không vỡ frontend cũ.
router.post(['/counter', '/admin'], verifyToken, requireStaff, createOrderAdmin)

// ---- Người cho thuê (staff) + Admin: xử lý đơn ----
router.get('/', verifyToken, requireStaff, getAllOrders)
router.put('/:id', verifyToken, requireStaff, updateOrder)
router.patch('/:id/status', verifyToken, requireStaff, updateOrderStatus)

// Người thuê chỉ xem được đơn của chính mình (kiểm tra trong controller)
router.get('/:id', verifyToken, getOrderById)

// ---- Chỉ Admin: xóa đơn ----
router.delete('/:id', verifyToken, requireAdmin, deleteOrder)

module.exports = router