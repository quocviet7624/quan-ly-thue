const express = require('express')
const router = express.Router()
const { verifyToken, requireAdmin } = require('../middleware/auth')
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', verifyToken, requireAdmin, createProduct)
router.put('/:id', verifyToken, requireAdmin, updateProduct)
router.delete('/:id', verifyToken, requireAdmin, deleteProduct)

module.exports = router