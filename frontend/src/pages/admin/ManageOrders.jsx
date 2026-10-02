import { useEffect, useMemo, useState } from 'react'
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  createOrderAdmin,
  updateOrder,
  getOrderById,
} from '../../services/orderService'
import { getProducts } from '../../services/productService'

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'delivering', label: 'Đang giao' },
  { value: 'renting', label: 'Đang thuê' },
  { value: 'returned', label: 'Đã trả' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'overdue', label: 'Quá hạn' },
]

const paymentMethodOptions = [
  { value: 'store', label: 'Tại cửa hàng' },
  { value: 'cod', label: 'COD' },
  { value: 'vnpay', label: 'VNPay' },
]

function getStatusLabel(value) {
  return statusOptions.find((s) => s.value === value)?.label || value
}

const emptyItem = { product_id: '', quantity: 1 }

const emptyForm = {
  guest_name: '',
  guest_phone: '',
  rental_start_date: '',
  rental_end_date: '',
  payment_method: 'store',
  status: 'confirmed',
  items: [{ ...emptyItem }],
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false)

  function loadOrders() {
    setLoading(true)
    getAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
    getProducts({ all: true }).then(setProducts).catch(() => {})
  }, [])

  async function handleStatusChange(id, status) {
    await updateOrderStatus(id, status)
    loadOrders()
  }

  async function handleDelete(id) {
    if (!confirm(`Xóa đơn thuê #${id}? Hành động này không thể hoàn tác.`)) return
    try {
      await deleteOrder(id)
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa đơn thuê này.')
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter ? o.status === statusFilter : true
      const keyword = search.trim().toLowerCase()
      const displayName = o.user_name || o.guest_name || ''
      const matchSearch = keyword
        ? String(o.id).includes(keyword) ||
          displayName.toLowerCase().includes(keyword) ||
          (o.guest_phone || '').includes(keyword)
        : true
      return matchStatus && matchSearch
    })
  }, [orders, search, statusFilter])

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
  }

  const hasActiveFilters = search || statusFilter

  // ---------- Modal: tạo đơn tại quầy / sửa đơn ----------

  function openCreateModal() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setShowModal(true)
  }

  async function openEditModal(order) {
    setEditingId(order.id)
    setFormError(null)
    setShowModal(true)
    setLoadingOrderDetail(true)
    try {
      const detail = await getOrderById(order.id)
      setForm({
        guest_name: detail.guest_name || detail.user_name || '',
        guest_phone: detail.guest_phone || '',
        rental_start_date: detail.rental_start_date,
        rental_end_date: detail.rental_end_date,
        payment_method: detail.payment_method || 'store',
        status: detail.status,
        items: detail.items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
      })
    } catch {
      setFormError('Không tải được chi tiết đơn để sửa.')
    } finally {
      setLoadingOrderDetail(false)
    }
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleItemChange(index, field, value) {
    setForm((prev) => {
      const items = prev.items.map((it, i) =>
        i === index ? { ...it, [field]: value } : it
      )
      return { ...prev, items }
    })
  }

  function addItemRow() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }))
  }

  function removeItemRow(index) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!editingId && (!form.guest_name.trim() || !form.guest_phone.trim())) {
      setFormError('Vui lòng nhập tên và số điện thoại khách hàng.')
      return
    }
    if (!form.rental_start_date || !form.rental_end_date) {
      setFormError('Vui lòng chọn ngày thuê và ngày trả.')
      return
    }
    if (form.rental_end_date < form.rental_start_date) {
      setFormError('Ngày trả phải sau hoặc bằng ngày thuê.')
      return
    }
    const items = form.items
      .filter((it) => it.product_id)
      .map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) || 1 }))
    if (items.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 sản phẩm.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateOrder(editingId, {
          guest_name: form.guest_name,
          guest_phone: form.guest_phone,
          rental_start_date: form.rental_start_date,
          rental_end_date: form.rental_end_date,
          payment_method: form.payment_method,
          items,
        })
      } else {
        await createOrderAdmin({
          guest_name: form.guest_name,
          guest_phone: form.guest_phone,
          rental_start_date: form.rental_start_date,
          rental_end_date: form.rental_end_date,
          payment_method: form.payment_method,
          status: form.status,
          items,
        })
      }
      closeModal()
      loadOrders()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý đơn thuê</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Tạo đơn tại quầy
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên hoặc SĐT khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="btn-clear-filter" onClick={handleClearFilters}>
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {!loading && (
        <p className="products-result-count">{filteredOrders.length} đơn thuê</p>
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày thuê</th>
              <th>Ngày trả</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  {o.user_name || o.guest_name || `Khách #${o.user_id}`}
                  {o.guest_phone && (
                    <>
                      <br />
                      <span className="note-text">{o.guest_phone}</span>
                    </>
                  )}
                  {!o.user_id && !o.guest_name && null}
                  {o.guest_name && <span className="guest-badge"> (vãng lai)</span>}
                </td>
                <td>{o.rental_start_date}</td>
                <td>{o.rental_end_date}</td>
                <td>{Number(o.total_amount).toLocaleString('vi-VN')} đ</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className={`status-select status-select-${o.status}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => openEditModal(o)}>Sửa</button>
                  <button className="btn-delete-row" onClick={() => handleDelete(o.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7">Không tìm thấy đơn thuê nào phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? `Sửa đơn #${editingId}` : 'Tạo đơn tại quầy'}</h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            {loadingOrderDetail ? (
              <p className="note-text" style={{ padding: 20 }}>
                Đang tải chi tiết đơn...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                {formError && <p className="error-text">{formError}</p>}

                <div className="modal-form-row">
                  <label>
                    Tên khách hàng *
                    <input
                      name="guest_name"
                      value={form.guest_name}
                      onChange={handleFormChange}
                      placeholder="Nguyễn Văn A"
                      required={!editingId}
                    />
                  </label>
                  <label>
                    Số điện thoại *
                    <input
                      name="guest_phone"
                      value={form.guest_phone}
                      onChange={handleFormChange}
                      placeholder="09xxxxxxxx"
                      required={!editingId}
                    />
                  </label>
                </div>

                <div className="modal-form-row">
                  <label>
                    Ngày thuê *
                    <input
                      type="date"
                      name="rental_start_date"
                      value={form.rental_start_date}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Ngày trả *
                    <input
                      type="date"
                      name="rental_end_date"
                      value={form.rental_end_date}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                </div>

                <div className="order-form-items">
                  <p className="review-form-label">Sản phẩm thuê *</p>
                  {form.items.map((item, index) => (
                    <div className="order-form-item-row" key={index}>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (còn {p.stock_quantity})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-delete-row"
                        onClick={() => removeItemRow(index)}
                        disabled={form.items.length === 1}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addItemRow} className="btn-add-item-row">
                    + Thêm sản phẩm
                  </button>
                </div>

                <div className="modal-form-row">
                  <label>
                    Phương thức thanh toán
                    <select
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleFormChange}
                    >
                      {paymentMethodOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {!editingId && (
                    <label>
                      Trạng thái ban đầu
                      <select name="status" value={form.status} onChange={handleFormChange}>
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo đơn'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}