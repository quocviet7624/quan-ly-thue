const pool = require('../config/db')

async function getProducts(req, res) {
  const { category_id, search } = req.query
  let sql = 'SELECT * FROM products WHERE status = "active"'
  const params = []

  if (category_id) {
    sql += ' AND category_id = ?'
    params.push(category_id)
  }
  if (search) {
    sql += ' AND name LIKE ?'
    params.push(`%${search}%`)
  }
  sql += ' ORDER BY id DESC'

  try {
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function getProductById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function createProduct(req, res) {
  const {
    category_id,
    name,
    description,
    image_url,
    brand,
    rental_price_per_day,
    deposit_amount,
  } = req.body

  if (!category_id || !name || !rental_price_per_day) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, description, image_url, brand, rental_price_per_day, deposit_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, description || null, image_url || null, brand || null, rental_price_per_day, deposit_amount || 0]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateProduct(req, res) {
  const { id } = req.params
  const {
    category_id,
    name,
    description,
    image_url,
    brand,
    rental_price_per_day,
    deposit_amount,
    status,
  } = req.body

  try {
    await pool.query(
      `UPDATE products SET category_id=?, name=?, description=?, image_url=?, brand=?,
       rental_price_per_day=?, deposit_amount=?, status=? WHERE id=?`,
      [category_id, name, description, image_url, brand, rental_price_per_day, deposit_amount, status || 'active', id]
    )
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function deleteProduct(req, res) {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
    res.json({ message: 'Xóa thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Không thể xóa, sản phẩm có thể đang có đơn thuê liên quan' })
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct }