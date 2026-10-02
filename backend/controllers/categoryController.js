const pool = require('../config/db')

async function getCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function createCategory(req, res) {
  const name = (req.body.name || '').trim()
  const description = (req.body.description || '').trim() || null
  if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' })

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    )
    res.status(201).json({ id: result.insertId, name, description })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tên danh mục đã tồn tại' })
    }
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateCategory(req, res) {
  const { id } = req.params
  const name = (req.body.name || '').trim()
  const description = (req.body.description || '').trim() || null
  if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' })

  try {
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' })
    }
    res.json({ id: Number(id), name, description })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tên danh mục đã tồn tại' })
    }
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' })
    }
    res.json({ message: 'Xóa thành công' })
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res
        .status(409)
        .json({ message: 'Không thể xóa danh mục đang có sản phẩm' })
    }
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory }