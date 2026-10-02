const pool = require('../config/db')

// Tồn kho <= ngưỡng này thì cảnh báo "sắp hết"
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 2

// Các trạng thái được tính vào doanh thu (loại đơn chờ xác nhận và đơn đã hủy).
// Muốn chỉ tính đơn đã trả xong thì đổi thành ['returned'].
const REVENUE_STATUSES = ['confirmed', 'delivering', 'renting', 'returned', 'overdue']

// ------------------------------------------------------------
// Staff + Admin: tổng quan nhanh cho dashboard
// ------------------------------------------------------------
async function getOverview(req, res) {
  try {
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS total FROM rental_orders GROUP BY status'
    )
    const orders_by_status = {}
    let total_orders = 0
    for (const r of statusRows) {
      orders_by_status[r.status] = Number(r.total)
      total_orders += Number(r.total)
    }

    const [[productRow]] = await pool.query(
      "SELECT COUNT(*) AS total FROM products WHERE status = 'active'"
    )

    res.json({
      total_orders,
      orders_by_status,
      active_products: Number(productRow.total),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ------------------------------------------------------------
// Staff + Admin: cảnh báo sản phẩm (hết hàng, sắp hết, đơn quá hạn trả)
// ------------------------------------------------------------
async function getStockAlerts(req, res) {
  try {
    const [stockRows] = await pool.query(
      `SELECT id, name, image_url, stock_quantity
       FROM products
       WHERE status = 'active' AND stock_quantity <= ?
       ORDER BY stock_quantity ASC, name ASC`,
      [LOW_STOCK_THRESHOLD]
    )

    const out_of_stock = stockRows.filter((p) => p.stock_quantity <= 0)
    const low_stock = stockRows.filter((p) => p.stock_quantity > 0)

    const [overdue_orders] = await pool.query(
      `SELECT o.id, o.rental_end_date, o.status,
              COALESCE(u.full_name, o.guest_name) AS customer_name,
              COALESCE(u.phone, o.guest_phone) AS customer_phone
       FROM rental_orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE o.status IN ('delivering', 'renting', 'overdue')
         AND o.rental_end_date < CURDATE()
       ORDER BY o.rental_end_date ASC`
    )

    res.json({
      low_stock_threshold: LOW_STOCK_THRESHOLD,
      out_of_stock,
      low_stock,
      overdue_orders,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ------------------------------------------------------------
// Staff + Admin: thống kê sản phẩm - lượt thuê
// Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (tùy chọn, lọc theo ngày đặt đơn)
// ------------------------------------------------------------
async function getProductStats(req, res) {
  const { from, to } = req.query
  let dateCond = ''
  const params = []
  if (from) {
    dateCond += ' AND o.order_date >= ?'
    params.push(from)
  }
  if (to) {
    dateCond += ' AND o.order_date < DATE_ADD(?, INTERVAL 1 DAY)'
    params.push(to)
  }

  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.image_url, p.stock_quantity, p.status,
              c.name AS category_name,
              COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity END), 0) AS total_rented,
              COUNT(DISTINCT o.id) AS order_count,
              COALESCE(SUM(CASE WHEN o.status IN ('delivering','renting','overdue')
                                THEN oi.quantity END), 0) AS currently_out
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN rental_order_items oi ON oi.product_id = p.id
       LEFT JOIN rental_orders o
              ON o.id = oi.order_id AND o.status <> 'cancelled' ${dateCond}
       GROUP BY p.id, p.name, p.image_url, p.stock_quantity, p.status, c.name
       ORDER BY total_rented DESC, p.name ASC`,
      params
    )

    res.json(
      rows.map((r) => ({
        ...r,
        total_rented: Number(r.total_rented),
        order_count: Number(r.order_count),
        currently_out: Number(r.currently_out),
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ------------------------------------------------------------
// Chỉ Admin: thống kê doanh thu theo năm
// ------------------------------------------------------------
async function getRevenueStats(req, res) {
  const year = Number(req.query.year) || new Date().getFullYear()

  try {
    const [monthRows] = await pool.query(
      `SELECT MONTH(order_date) AS month,
              COUNT(*) AS orders,
              COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(deposit_amount), 0) AS deposit
       FROM rental_orders
       WHERE YEAR(order_date) = ? AND status IN (?)
       GROUP BY MONTH(order_date)`,
      [year, REVENUE_STATUSES]
    )

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      orders: 0,
      revenue: 0,
      deposit: 0,
    }))
    for (const r of monthRows) {
      months[r.month - 1] = {
        month: r.month,
        orders: Number(r.orders),
        revenue: Number(r.revenue),
        deposit: Number(r.deposit),
      }
    }

    const total_revenue = months.reduce((s, m) => s + m.revenue, 0)
    const total_orders = months.reduce((s, m) => s + m.orders, 0)

    const [topProducts] = await pool.query(
      `SELECT p.id, p.name,
              SUM(oi.quantity) AS quantity,
              SUM(oi.subtotal) AS revenue
       FROM rental_order_items oi
       JOIN rental_orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE YEAR(o.order_date) = ? AND o.status IN (?)
       GROUP BY p.id, p.name
       ORDER BY revenue DESC
       LIMIT 5`,
      [year, REVENUE_STATUSES]
    )

    const [yearRows] = await pool.query(
      'SELECT DISTINCT YEAR(order_date) AS year FROM rental_orders ORDER BY year DESC'
    )
    const years = yearRows.map((r) => r.year)
    if (!years.includes(year)) years.unshift(year)

    res.json({
      year,
      years,
      total_revenue,
      total_orders,
      months,
      top_products: topProducts.map((p) => ({
        ...p,
        quantity: Number(p.quantity),
        revenue: Number(p.revenue),
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

module.exports = { getOverview, getStockAlerts, getProductStats, getRevenueStats }