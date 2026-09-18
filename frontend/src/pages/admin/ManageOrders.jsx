import { useEffect, useMemo, useState } from 'react'
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../services/orderService'

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'delivering', label: 'Đang giao' },
  { value: 'renting', label: 'Đang thuê' },
  { value: 'returned', label: 'Đã trả' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'overdue', label: 'Quá hạn' },
]

function getStatusLabel(value) {
  return statusOptions.find((s) => s.value === value)?.label || value
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  function loadOrders() {
    setLoading(true)
    getAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
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
      const matchSearch = keyword
        ? String(o.id).includes(keyword) ||
          (o.user_name || '').toLowerCase().includes(keyword)
        : true
      return matchStatus && matchSearch
    })
  }, [orders, search, statusFilter])

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
  }

  const hasActiveFilters = search || statusFilter

  return (
    <div className="admin-page">
      <h1>Quản lý đơn thuê</h1>

      <div className="admin-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
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
                <td>{o.user_name || o.user_id}</td>
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
    </div>
  )
}