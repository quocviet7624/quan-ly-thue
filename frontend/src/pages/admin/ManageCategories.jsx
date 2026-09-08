import { useEffect, useState } from 'react'
import { getCategories, deleteCategory } from '../../services/categoryService'

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  function loadCategories() {
    setLoading(true)
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  async function handleDelete(id) {
    if (!confirm('Xóa danh mục này?')) return
    await deleteCategory(id)
    loadCategories()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý danh mục</h1>
        <button className="btn-primary">+ Thêm danh mục</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <button>Sửa</button>
                  <button onClick={() => handleDelete(c.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4">Chưa có danh mục nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}