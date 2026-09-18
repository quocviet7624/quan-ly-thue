const pool = require('../config/db')

function calcDays(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)))
}

async function createOrder(req, res) {
  const userId = req.user.id
  const { rental_start_date, rental_end_date, items } = req.body

  if (!rental_start_date || !rental_end_date || !items?.length) {
    return res.status(400).json({ message: 'Thiếu thông tin đơn thuê' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const days = calcDays(rental_start_date, rental_end_date)
    let totalAmount = 0
    let totalDeposit = 0
    const itemRows = []

    for (const item of items) {
      const [productRows] = await connection.query('SELECT * FROM products WHERE id = ?', [
        item.product_id,
      ])
      if (productRows.length === 0) throw new Error('Sản phẩm không tồn tại')
      const product = productRows[0]

      const subtotal = product.rental_price_per_day * item.quantity * days
      totalAmount += subtotal
      totalDeposit += product.deposit_amount * item.quantity

      itemRows.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price_per_day: product.rental_price_per_day,
        days,
        subtotal,
      })
    }

    const [orderResult] = await connection.query(
      `INSERT INTO rental_orders (user_id, rental_start_date, rental_end_date, total_amount, deposit_amount, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, rental_start_date, rental_end_date, totalAmount, totalDeposit]
    )
    const orderId = orderResult.insertId

    for (const item of itemRows) {
      await connection.query(
        `INSERT INTO rental_order_items (order_id, product_id, quantity, unit_price_per_day, days, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price_per_day, item.days, item.subtotal]
      )
    }

    await connection.commit()
    res.status(201).json({ id: orderId, total_amount: totalAmount, deposit_amount: totalDeposit })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: err.message || 'Lỗi khi tạo đơn thuê' })
  } finally {
    connection.release()
  }
}

async function getMyOrders(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM rental_orders WHERE user_id = ? ORDER BY order_date DESC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function getAllOrders(req, res) {
  const { status } = req.query
  let sql = `
    SELECT o.*, u.full_name AS user_name
    FROM rental_orders o
    JOIN users u ON u.id = o.user_id
  `
  const params = []
  if (status) {
    sql += ' WHERE o.status = ?'
    params.push(status)
  }
  sql += ' ORDER BY o.order_date DESC'

  try {
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function getOrderById(req, res) {
  try {
    const [orderRows] = await pool.query('SELECT * FROM rental_orders WHERE id = ?', [
      req.params.id,
    ])
    if (orderRows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn' })

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name
       FROM rental_order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    )

    res.json({ ...orderRows[0], items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateOrderStatus(req, res) {
  const { status } = req.body
  const validStatuses = [
    'pending', 'confirmed', 'delivering', 'renting', 'returned', 'cancelled', 'overdue',
  ]
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
  }

  try {
    await pool.query('UPDATE rental_orders SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ message: 'Cập nhật trạng thái thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
async function deleteOrder(req, res) {
  try {
    await pool.query('DELETE FROM rental_orders WHERE id = ?', [req.params.id])
    res.json({ message: 'Xóa đơn thuê thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Không thể xóa đơn thuê này' })
  }
}

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus, deleteOrder }