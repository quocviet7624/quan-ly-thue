const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin, requireStaff } = require('../middleware/auth')
const {
  getOverview,
  getStockAlerts,
  getProductStats,
  getRevenueStats,
} = require('../controllers/statsController')

// Người cho thuê (staff) + Admin
router.get('/overview', verifyToken, requireStaff, getOverview)
router.get('/stock-alerts', verifyToken, requireStaff, getStockAlerts)
router.get('/products', verifyToken, requireStaff, getProductStats)

// Chỉ Admin
router.get('/revenue', verifyToken, requireAdmin, getRevenueStats)

module.exports = router