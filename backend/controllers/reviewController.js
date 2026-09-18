const pool = require('../config/db')

async function getReviewsByProduct(req, res) {
  const { productId } = req.params
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    )

    const [summaryRows] = await pool.query(
      `SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS average
       FROM reviews WHERE product_id = ?`,
      [productId]
    )

    res.json({
      reviews,
      total: summaryRows[0].total,
      average: Number(summaryRows[0].average).toFixed(1),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function createReview(req, res) {
  const { productId } = req.params
  const { rating, comment } = req.body
  const userId = req.user.id

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' })
  }

  try {
    // Mỗi khách chỉ được đánh giá 1 lần cho mỗi sản phẩm - nếu đã có thì cập nhật lại
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )

    if (existing.length > 0) {
      await pool.query('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?', [
        rating,
        comment || null,
        existing[0].id,
      ])
    } else {
      await pool.query(
        'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
        [userId, productId, rating, comment || null]
      )
    }

    res.status(201).json({ message: 'Đánh giá thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function getRecentReviews(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name, p.name AS product_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       WHERE r.rating >= 4 AND r.comment IS NOT NULL AND r.comment <> ''
       ORDER BY r.created_at DESC
       LIMIT 6`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
module.exports = { getReviewsByProduct, createReview, getRecentReviews }