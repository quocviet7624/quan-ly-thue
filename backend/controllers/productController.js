const pool = require('../config/db')

function parseImages(row) {
  if (!row) return row
  let images = []
  try {
    images = row.images ? JSON.parse(row.images) : []
  } catch {
    images = []
  }
  return { ...row, images }
}

async function getProducts(req, res) {
  const { category_id, search, all } = req.query
  // "all" = true -> dùng cho trang quản trị (admin), lấy cả sản phẩm discontinued
  // không có "all" -> dùng cho trang khách hàng, chỉ lấy sản phẩm active
  let sql = all ? 'SELECT * FROM products WHERE 1=1' : 'SELECT * FROM products WHERE status = "active"'
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
    res.json(rows.map(parseImages))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function getProductById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    res.json(parseImages(rows[0]))
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
    brand,
    rental_price_per_day,
    deposit_amount,
    images, // mảng URL ảnh, ví dụ ['/uploads/products/abc.jpg', ...]
  } = req.body

  if (!category_id || !name || !rental_price_per_day) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
  }

  const imageList = Array.isArray(images) ? images : []
  const coverImage = imageList[0] || null

  try {
    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, description, image_url, images, brand, rental_price_per_day, deposit_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        description || null,
        coverImage,
        JSON.stringify(imageList),
        brand || null,
        rental_price_per_day,
        deposit_amount || 0,
      ]
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
    brand,
    rental_price_per_day,
    deposit_amount,
    status,
    images,
  } = req.body

  const imageList = Array.isArray(images) ? images : []
  const coverImage = imageList[0] || null

  try {
    const [result] = await pool.query(
      `UPDATE products SET category_id=?, name=?, description=?, image_url=?, images=?, brand=?,
       rental_price_per_day=?, deposit_amount=?, status=? WHERE id=?`,
      [
        category_id,
        name,
        description,
        coverImage,
        JSON.stringify(imageList),
        brand,
        rental_price_per_day,
        deposit_amount,
        status || 'active',
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' })
    }

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

function uploadImages(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Không có file nào được tải lên' })
  }

  const urls = req.files.map((file) => `/uploads/products/${file.filename}`)
  res.json({ urls })
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
}