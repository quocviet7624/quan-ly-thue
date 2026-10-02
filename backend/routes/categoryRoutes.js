const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')

// Ai cũng xem được danh mục (để lọc sản phẩm, đổ vào form sản phẩm)
router.get('/', getCategories)

// Chỉ Admin được quản lý danh mục
router.post('/', verifyToken, requireAdmin, createCategory)
router.put('/:id', verifyToken, requireAdmin, updateCategory)
router.delete('/:id', verifyToken, requireAdmin, deleteCategory)

module.exports = router