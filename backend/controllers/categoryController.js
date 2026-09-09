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
  const { name, description } = req.body
  if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' })

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    )
    res.status(201).json({ id: result.insertId, name, description })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function updateCategory(req, res) {
  const { id } = req.params
  const { name, description } = req.body

  try {
    await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
      name,
      description,
      id,
    ])
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [id])
    res.json({ message: 'Xóa thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Không thể xóa danh mục đang có sản phẩm' })
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory }