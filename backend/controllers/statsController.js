const pool = require('../config/db')

async function getOverviewStats(req, res) {
  try {
    const [[productCount]] = await pool.query(
      `SELECT COUNT(*) AS count FROM products WHERE status = 'active'`
    )
    const [[categoryCount]] = await pool.query(`SELECT COUNT(*) AS count FROM categories`)
    const [[orderCount]] = await pool.query(
      `SELECT COUNT(*) AS count FROM rental_orders WHERE status = 'returned'`
    )
    const [[reviewStats]] = await pool.query(
      `SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews`
    )

    res.json({
      productCount: productCount.count,
      categoryCount: categoryCount.count,
      completedOrders: orderCount.count,
      averageRating: Number(reviewStats.average).toFixed(1),
      reviewCount: reviewStats.count,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

module.exports = { getOverviewStats }