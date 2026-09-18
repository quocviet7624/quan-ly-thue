const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const { getReviewsByProduct, createReview, getRecentReviews } = require('../controllers/reviewController')

router.get('/recent', getRecentReviews)
router.get('/product/:productId', getReviewsByProduct)
router.post('/product/:productId', verifyToken, createReview)

module.exports = router