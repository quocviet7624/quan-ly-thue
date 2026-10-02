import { useEffect, useState } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService'

const EMPTY_FORM = { name: '', description: '' }

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal: editing === null => thêm mới, editing = object => sửa
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function openEdit(category) {
    setEditing(category)
    setForm({ name: category.name, description: category.description || '' })
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên danh mục')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() }
      if (editing) {
        await updateCategory(editing.id, payload)
      } else {
        await createCategory(payload)
      }
      setModalOpen(false)
      loadCategories()
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa danh mục này?')) return
    try {
      await deleteCategory(id)
      loadCategories()
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa danh mục')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý danh mục</h1>
        <button className="btn-primary" onClick={openCreate}>
          + Thêm danh mục
        </button>
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
                  <button onClick={() => openEdit(c)}>Sửa</button>
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

      {modalOpen && (
        <div style={styles.overlay} onClick={closeModal}>
          <form
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <h2 style={{ marginTop: 0 }}>
              {editing ? 'Sửa danh mục' : 'Thêm danh mục'}
            </h2>

            <label style={styles.label}>
              Tên danh mục *
              <input
                style={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
                autoFocus
              />
            </label>

            <label style={styles.label}>
              Mô tả
              <textarea
                style={{ ...styles.input, minHeight: 80 }}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            {error && <p style={{ color: 'crimson', margin: '8px 0' }}>{error}</p>}

            <div style={styles.actions}>
              <button type="button" onClick={closeModal} disabled={saving}>
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    color: '#222',
    padding: 24,
    borderRadius: 8,
    width: 420,
    maxWidth: '90%',
  },
  label: { display: 'block', marginBottom: 12, fontSize: 14 },
  input: {
    display: 'block',
    width: '100%',
    marginTop: 4,
    padding: '8px 10px',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: 4,
    font: 'inherit',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
}