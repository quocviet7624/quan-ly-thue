import { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '../../services/orderService'

const statusOptions = [
  'pending',
  'confirmed',
  'delivering',
  'renting',
  'returned',
  'cancelled',
  'overdue',
]

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="admin-page">
      <h1>Quản lý đơn thuê</h1>

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
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
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
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6">Chưa có đơn thuê nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}