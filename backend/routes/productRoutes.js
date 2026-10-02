const express = require('express')
const router = express.Router()
const { verifyToken, requireStaff } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
} = require('../controllers/productController')

// Ai cũng xem được sản phẩm
router.get('/', getProducts)
router.get('/:id', getProductById)

// Người cho thuê (staff) + Admin: quản lý sản phẩm
router.post('/upload', verifyToken, requireStaff, upload.array('images', 8), uploadImages)
router.post('/', verifyToken, requireStaff, createProduct)
router.put('/:id', verifyToken, requireStaff, updateProduct)
router.delete('/:id', verifyToken, requireStaff, deleteProduct)

module.exports = router