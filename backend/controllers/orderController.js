const pool = require('../config/db')
const vnpayConfig = require('../config/vnpay')
const { buildPaymentUrl, verifyReturn } = require('../utils/vnpayUtil')

function calcDays(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)))
}

const VALID_PAYMENT_METHODS = ['vnpay', 'cod', 'store']
const VALID_STATUSES = [
  'pending', 'confirmed', 'delivering', 'renting', 'returned', 'cancelled', 'overdue',
]

// Các trạng thái mà khi đơn CHUYỂN VÀO đó, thiết bị coi như không còn bị "giữ chỗ"
// nữa (khách hủy, hoặc đã trả xong) → cần cộng lại tồn kho.
const STOCK_RESTORE_STATUSES = ['cancelled', 'returned']

// Ghi các dòng order_items thực sự (dùng orderId đã biết) + trừ kho.
async function insertItemsAndDeductStock(connection, orderId, itemRows) {
  for (const item of itemRows) {
    await connection.query(
      `INSERT INTO rental_order_items (order_id, product_id, quantity, unit_price_per_day, days, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.quantity, item.unit_price_per_day, item.days, item.subtotal]
    )
    await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [item.quantity, item.product_id]
    )
  }
}

// Kiểm tra tồn kho + tính tổng tiền, KHÔNG insert (dùng để tính trước khi biết orderId).
async function validateAndCalcItems(connection, items, days) {
  let totalAmount = 0
  let totalDeposit = 0
  const itemRows = []

  for (const item of items) {
    const [productRows] = await connection.query(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [item.product_id]
    )
    if (productRows.length === 0) throw new Error('Sản phẩm không tồn tại')
    const product = productRows[0]

    if (product.stock_quantity < item.quantity) {
      throw new Error(
        `Sản phẩm "${product.name}" không đủ hàng (còn ${product.stock_quantity}, cần ${item.quantity})`
      )
    }

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

  return { itemRows, totalAmount, totalDeposit }
}

// ============================================================
// Khách hàng tự đặt (đăng nhập web)
// ============================================================
async function createOrder(req, res) {
  const userId = req.user.id
  const { rental_start_date, rental_end_date, items, payment_method } = req.body

  if (!rental_start_date || !rental_end_date || !items?.length) {
    return res.status(400).json({ message: 'Thiếu thông tin đơn thuê' })
  }

  const paymentMethod = VALID_PAYMENT_METHODS.includes(payment_method) ? payment_method : 'store'

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const days = calcDays(rental_start_date, rental_end_date)
    const { itemRows, totalAmount, totalDeposit } = await validateAndCalcItems(
      connection,
      items,
      days
    )

    const [orderResult] = await connection.query(
      `INSERT INTO rental_orders
        (user_id, guest_name, guest_phone, rental_start_date, rental_end_date, total_amount, deposit_amount, status, payment_method, payment_status)
       VALUES (?, NULL, NULL, ?, ?, ?, ?, 'pending', ?, 'unpaid')`,
      [userId, rental_start_date, rental_end_date, totalAmount, totalDeposit, paymentMethod]
    )
    const orderId = orderResult.insertId

    await insertItemsAndDeductStock(connection, orderId, itemRows)

    let paymentUrl = null
    if (paymentMethod === 'vnpay') {
      let ipAddr =
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1'
      if (ipAddr === '::1') ipAddr = '127.0.0.1'
      if (ipAddr.startsWith('::ffff:')) ipAddr = ipAddr.replace('::ffff:', '')

      const { paymentUrl: url, vnp_TxnRef } = buildPaymentUrl(vnpayConfig, {
        orderId,
        amount: totalDeposit,
        orderInfo: `Thanh toan coc don thue so ${orderId}`,
        ipAddr,
      })
      paymentUrl = url

      await connection.query('UPDATE rental_orders SET vnpay_txn_ref = ? WHERE id = ?', [
        vnp_TxnRef,
        orderId,
      ])
    }

    await connection.commit()
    res.status(201).json({
      id: orderId,
      total_amount: totalAmount,
      deposit_amount: totalDeposit,
      payment_method: paymentMethod,
      paymentUrl,
    })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: err.message || 'Lỗi khi tạo đơn thuê' })
  } finally {
    connection.release()
  }
}

// ============================================================
// Admin tạo đơn tại quầy cho khách vãng lai (không cần tài khoản)
// ============================================================
async function createOrderAdmin(req, res) {
  const {
    guest_name,
    guest_phone,
    rental_start_date,
    rental_end_date,
    items,
    payment_method,
    status,
  } = req.body

  if (!guest_name || !guest_phone) {
    return res.status(400).json({ message: 'Vui lòng nhập tên và số điện thoại khách hàng' })
  }
  if (!rental_start_date || !rental_end_date || !items?.length) {
    return res.status(400).json({ message: 'Thiếu thông tin đơn thuê' })
  }

  const paymentMethod = VALID_PAYMENT_METHODS.includes(payment_method) ? payment_method : 'store'
  const initialStatus = VALID_STATUSES.includes(status) ? status : 'confirmed'

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const days = calcDays(rental_start_date, rental_end_date)
    const { itemRows, totalAmount, totalDeposit } = await validateAndCalcItems(
      connection,
      items,
      days
    )

    const [orderResult] = await connection.query(
      `INSERT INTO rental_orders
        (user_id, guest_name, guest_phone, rental_start_date, rental_end_date, total_amount, deposit_amount, status, payment_method, payment_status)
       VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid')`,
      [
        guest_name,
        guest_phone,
        rental_start_date,
        rental_end_date,
        totalAmount,
        totalDeposit,
        initialStatus,
        paymentMethod,
      ]
    )
    const orderId = orderResult.insertId

    await insertItemsAndDeductStock(connection, orderId, itemRows)

    await connection.commit()
    res.status(201).json({
      id: orderId,
      total_amount: totalAmount,
      deposit_amount: totalDeposit,
    })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: err.message || 'Lỗi khi tạo đơn thuê tại quầy' })
  } finally {
    connection.release()
  }
}

// ============================================================
// Admin sửa toàn bộ đơn (ngày thuê/trả, sản phẩm, thông tin khách, thanh toán).
// KHÔNG đổi trạng thái ở đây — trạng thái vẫn đổi qua updateOrderStatus như cũ.
// ============================================================
async function updateOrder(req, res) {
  const orderId = req.params.id
  const { guest_name, guest_phone, rental_start_date, rental_end_date, items, payment_method } =
    req.body

  if (!rental_start_date || !rental_end_date || !items?.length) {
    return res.status(400).json({ message: 'Thiếu thông tin đơn thuê' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [orderRows] = await connection.query(
      'SELECT * FROM rental_orders WHERE id = ? FOR UPDATE',
      [orderId]
    )
    if (orderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Không tìm thấy đơn' })
    }
    const order = orderRows[0]

    // Đơn đã hủy/đã trả thì không còn "giữ chỗ" kho — chỉ những đơn đang hoạt
    // động mới cần restore kho cũ rồi trừ kho mới.
    const holdsStock = !STOCK_RESTORE_STATUSES.includes(order.status)

    if (holdsStock) {
      const [oldItems] = await connection.query(
        'SELECT product_id, quantity FROM rental_order_items WHERE order_id = ?',
        [orderId]
      )
      for (const oldItem of oldItems) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [oldItem.quantity, oldItem.product_id]
        )
      }
    }

    await connection.query('DELETE FROM rental_order_items WHERE order_id = ?', [orderId])

    const days = calcDays(rental_start_date, rental_end_date)
    let totalAmount = 0
    let totalDeposit = 0
    let itemRows = []

    if (holdsStock) {
      const result = await validateAndCalcItems(connection, items, days)
      itemRows = result.itemRows
      totalAmount = result.totalAmount
      totalDeposit = result.totalDeposit
      await insertItemsAndDeductStock(connection, orderId, itemRows)
    } else {
      // Đơn đã hủy/trả: chỉ cập nhật lại số liệu cho đúng, không đụng vào kho.
      for (const item of items) {
        const [productRows] = await connection.query('SELECT * FROM products WHERE id = ?', [
          item.product_id,
        ])
        if (productRows.length === 0) throw new Error('Sản phẩm không tồn tại')
        const product = productRows[0]
        const subtotal = product.rental_price_per_day * item.quantity * days
        totalAmount += subtotal
        totalDeposit += product.deposit_amount * item.quantity
        await connection.query(
          `INSERT INTO rental_order_items (order_id, product_id, quantity, unit_price_per_day, days, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, product.id, item.quantity, product.rental_price_per_day, days, subtotal]
        )
      }
    }

    const paymentMethod = VALID_PAYMENT_METHODS.includes(payment_method)
      ? payment_method
      : order.payment_method

    await connection.query(
      `UPDATE rental_orders
       SET guest_name = ?, guest_phone = ?, rental_start_date = ?, rental_end_date = ?,
           total_amount = ?, deposit_amount = ?, payment_method = ?
       WHERE id = ?`,
      [
        guest_name ?? order.guest_name,
        guest_phone ?? order.guest_phone,
        rental_start_date,
        rental_end_date,
        totalAmount,
        totalDeposit,
        paymentMethod,
        orderId,
      ]
    )

    await connection.commit()
    res.json({ message: 'Cập nhật đơn thuê thành công', total_amount: totalAmount, deposit_amount: totalDeposit })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: err.message || 'Lỗi khi cập nhật đơn thuê' })
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
  // LEFT JOIN vì đơn của khách vãng lai không có user_id.
  let sql = `
    SELECT o.*, u.full_name AS user_name
    FROM rental_orders o
    LEFT JOIN users u ON u.id = o.user_id
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

async function restoreStockForOrder(connection, orderId) {
  const [items] = await connection.query(
    'SELECT product_id, quantity FROM rental_order_items WHERE order_id = ?',
    [orderId]
  )
  for (const item of items) {
    await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [item.quantity, item.product_id]
    )
  }
}

async function updateOrderStatus(req, res) {
  const { status } = req.body
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [orderRows] = await connection.query(
      'SELECT status FROM rental_orders WHERE id = ? FOR UPDATE',
      [req.params.id]
    )
    if (orderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Không tìm thấy đơn' })
    }
    const currentStatus = orderRows[0].status

    const isEnteringRestoreStatus =
      STOCK_RESTORE_STATUSES.includes(status) && !STOCK_RESTORE_STATUSES.includes(currentStatus)

    if (isEnteringRestoreStatus) {
      await restoreStockForOrder(connection, req.params.id)
    }

    await connection.query('UPDATE rental_orders SET status = ? WHERE id = ?', [
      status,
      req.params.id,
    ])

    await connection.commit()
    res.json({ message: 'Cập nhật trạng thái thành công' })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  } finally {
    connection.release()
  }
}

async function deleteOrder(req, res) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [orderRows] = await connection.query(
      'SELECT status FROM rental_orders WHERE id = ? FOR UPDATE',
      [req.params.id]
    )
    if (orderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Không tìm thấy đơn' })
    }

    if (!STOCK_RESTORE_STATUSES.includes(orderRows[0].status)) {
      await restoreStockForOrder(connection, req.params.id)
    }

    await connection.query('DELETE FROM rental_orders WHERE id = ?', [req.params.id])

    await connection.commit()
    res.json({ message: 'Xóa đơn thuê thành công' })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: 'Không thể xóa đơn thuê này' })
  } finally {
    connection.release()
  }
}

async function vnpayReturn(req, res) {
  const query = req.query
  const isValid = verifyReturn(vnpayConfig.vnp_HashSecret, query)

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' })
  }

  const txnRef = query.vnp_TxnRef
  const orderId = txnRef ? txnRef.split('_')[0] : null
  const responseCode = query.vnp_ResponseCode

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Không xác định được đơn hàng' })
  }

  try {
    if (responseCode === '00') {
      await pool.query(
        `UPDATE rental_orders
         SET payment_status = 'paid', paid_at = NOW(), status = IF(status = 'pending', 'confirmed', status)
         WHERE id = ?`,
        [orderId]
      )
      return res.json({ success: true, orderId: Number(orderId) })
    }

    await pool.query(`UPDATE rental_orders SET payment_status = 'failed' WHERE id = ?`, [orderId])
    return res.json({
      success: false,
      orderId: Number(orderId),
      message: 'Giao dịch không thành công hoặc đã bị hủy trên VNPay.',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thanh toán' })
  }
}

module.exports = {
  createOrder,
  createOrderAdmin,
  updateOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  vnpayReturn,
}