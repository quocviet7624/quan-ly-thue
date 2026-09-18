const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
} = require('../controllers/productController')

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/upload', verifyToken, requireAdmin, upload.array('images', 8), uploadImages)
router.post('/', verifyToken, requireAdmin, createProduct)
router.put('/:id', verifyToken, requireAdmin, updateProduct)
router.delete('/:id', verifyToken, requireAdmin, deleteProduct)

module.exports = router