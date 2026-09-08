import { useEffect, useState } from 'react'
import { getMyOrders } from '../../services/orderService'

const statusLabel = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  delivering: 'Đang giao',
  renting: 'Đang thuê',
  returned: 'Đã trả',
  cancelled: 'Đã hủy',
  overdue: 'Quá hạn',
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Đang tải...</p>
  if (orders.length === 0) return <p>Bạn chưa có đơn thuê nào.</p>

  return (
    <div className="orders-page">
      <h1>Đơn thuê của tôi</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
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
              <td>{o.rental_start_date}</td>
              <td>{o.rental_end_date}</td>
              <td>{Number(o.total_amount).toLocaleString('vi-VN')} đ</td>
              <td>
                <span className={`status-badge status-${o.status}`}>
                  {statusLabel[o.status] || o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}