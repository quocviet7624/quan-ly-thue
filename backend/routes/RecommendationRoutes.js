const pool = require('../config/db')

function parseImages(row) {
  let images = []
  if (Array.isArray(row.images)) images = row.images
  else if (typeof row.images === 'string' && row.images) {
    try {
      images = JSON.parse(row.images)
    } catch {
      images = []
    }
  }
  return { ...row, images }
}

// Người thuê: gợi ý sản phẩm dựa trên lịch sử thuê.
// - Ưu tiên sản phẩm cùng danh mục với những gì đã thuê (trọng số = số lượng đã thuê)
// - Cộng điểm theo độ phổ biến (tổng lượt thuê toàn shop)
// - Chưa có lịch sử → gợi ý sản phẩm được thuê nhiều nhất
async function getRecommendations(req, res) {
  const userId = req.user.id
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20)

  try {
    const [history] = await pool.query(
      `SELECT p.category_id, oi.product_id, SUM(oi.quantity) AS qty
       FROM rental_orders o
       JOIN rental_order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = ? AND o.status <> 'cancelled'
       GROUP BY p.category_id, oi.product_id`,
      [userId]
    )

    const categoryWeight = {}
    const rentedIds = new Set()
    for (const h of history) {
      categoryWeight[h.category_id] = (categoryWeight[h.category_id] || 0) + Number(h.qty)
      rentedIds.add(h.product_id)
    }

    const [candidates] = await pool.query(
      `SELECT p.*, COALESCE(pop.cnt, 0) AS rent_count
       FROM products p
       LEFT JOIN (
         SELECT oi.product_id, SUM(oi.quantity) AS cnt
         FROM rental_order_items oi
         JOIN rental_orders o ON o.id = oi.order_id
         WHERE o.status <> 'cancelled'
         GROUP BY oi.product_id
       ) pop ON pop.product_id = p.id
       WHERE p.status = 'active' AND p.stock_quantity > 0`
    )

    const hasHistory = history.length > 0
    let pool_ = candidates
    if (hasHistory) {
      const unseen = candidates.filter((p) => !rentedIds.has(p.id))
      if (unseen.length > 0) pool_ = unseen
    }

    const scored = pool_
      .map((p) => {
        const catScore = categoryWeight[p.category_id] || 0
        return {
          ...parseImages(p),
          rent_count: Number(p.rent_count),
          score: catScore * 10 + Number(p.rent_count),
          reason: catScore > 0 ? 'Cùng danh mục bạn từng thuê' : 'Được thuê nhiều',
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...rest }) => rest)

    res.json({ based_on_history: hasHistory, items: scored })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

module.exports = { getRecommendations }