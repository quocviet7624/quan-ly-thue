import { useEffect, useState } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import { SERVER_ORIGIN } from '../../services/api'

const emptyForm = {
  category_id: '',
  name: '',
  description: '',
  brand: '',
  rental_price_per_day: '',
  deposit_amount: '',
  status: 'active',
  images: [], // mảng URL ảnh đã upload (đường dẫn tương đối từ server)
}

function resolveImageUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `${SERVER_ORIGIN}${url}`
}

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState(null)

  function loadProducts() {
    setLoading(true)
    // "all: true" để admin thấy cả sản phẩm đã ngừng cho thuê (discontinued),
    // không chỉ sản phẩm active như trang khách hàng.
    getProducts({ all: true })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
    getCategories().then(setCategories).catch(() => {})
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openCreateModal() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setShowModal(true)
  }

  function openEditModal(product) {
    setEditingId(product.id)
    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      rental_price_per_day: product.rental_price_per_day,
      deposit_amount: product.deposit_amount,
      status: product.status,
      images: Array.isArray(product.images) ? product.images : [],
    })
    setFormError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setFormError(null)
    try {
      const urls = await uploadProductImages(files)
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (err) {
      setFormError(err.response?.data?.message || 'Tải ảnh lên thất bại.')
    } finally {
      setUploading(false)
      e.target.value = '' // reset input để chọn lại cùng file nếu cần
    }
  }

  function removeImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category_id || !form.name || !form.rental_price_per_day) {
      setFormError('Vui lòng nhập đủ Danh mục, Tên sản phẩm và Giá thuê/ngày.')
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        ...form,
        rental_price_per_day: Number(form.rental_price_per_day),
        deposit_amount: Number(form.deposit_amount) || 0,
      }

      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }

      closeModal()
      loadProducts()
    } catch (err) {
      // In lỗi ra console để dễ debug khi cần (status code, message backend trả về...)
      console.error('Lưu sản phẩm thất bại:', err.response?.status, err.response?.data)
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa sản phẩm này?')) return
    try {
      await deleteProduct(id)
      loadProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa sản phẩm này.')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý sản phẩm</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Giá/ngày</th>
              <th>Tiền cọc</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={
                      resolveImageUrl(p.images?.[0] || p.image_url) ||
                      'https://placehold.co/50x50?text=No+Img'
                    }
                    alt={p.name}
                    className="admin-table-thumb"
                  />
                </td>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{Number(p.rental_price_per_day).toLocaleString('vi-VN')} đ</td>
                <td>{Number(p.deposit_amount).toLocaleString('vi-VN')} đ</td>
                <td>
                  <span className={`status-badge status-${p.status}`}>{p.status}</span>
                </td>
                <td>
                  <button onClick={() => openEditModal(p)}>Sửa</button>
                  <button onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="7">Chưa có sản phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <p className="error-text">{formError}</p>}

              <label>
                Danh mục *
                <select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tên sản phẩm *
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>

              <label>
                Mô tả
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </label>

              <label>
                Hình ảnh sản phẩm (có thể chọn nhiều ảnh)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>

              {uploading && <p className="note-text">Đang tải ảnh lên...</p>}

              {form.images.length > 0 && (
                <div className="image-preview-grid">
                  {form.images.map((url, index) => (
                    <div className="image-preview-item" key={url + index}>
                      <img src={resolveImageUrl(url)} alt={`Ảnh ${index + 1}`} />
                      {index === 0 && <span className="image-cover-badge">Ảnh bìa</span>}
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label>
                Thương hiệu
                <input name="brand" value={form.brand} onChange={handleChange} />
              </label>

              <div className="modal-form-row">
                <label>
                  Giá thuê/ngày (đ) *
                  <input
                    type="number"
                    name="rental_price_per_day"
                    value={form.rental_price_per_day}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </label>

                <label>
                  Tiền cọc (đ)
                  <input
                    type="number"
                    name="deposit_amount"
                    value={form.deposit_amount}
                    onChange={handleChange}
                    min="0"
                  />
                </label>
              </div>

              {editingId && (
                <label>
                  Trạng thái
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Đang cho thuê</option>
                    <option value="discontinued">Ngừng cho thuê</option>
                  </select>
                </label>
              )}

              <div className="modal-actions">
                <button type="button" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={saving || uploading}>
                  {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}