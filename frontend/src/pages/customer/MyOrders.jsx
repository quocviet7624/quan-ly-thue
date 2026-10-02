import { useEffect, useState } from 'react'
import { getMyOrders, getOrderById } from '../../services/orderService'

const statusLabel = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  delivering: 'Đang giao',
  renting: 'Đang thuê',
  returned: 'Đã trả',
  cancelled: 'Đã hủy',
  overdue: 'Quá hạn',
}

const paymentMethodLabel = {
  vnpay: 'VNPay',
  cod: 'COD (khi nhận hàng)',
  store: 'Tại cửa hàng',
}

const paymentStatusLabel = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
}

function getTodayStr() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

function formatDateVN(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function getRentalTypeLabel(startDate, todayStr) {
  if (!startDate) return null
  return startDate === todayStr ? 'Lấy ngay hôm nay' : `Đặt trước — từ ${formatDateVN(startDate)}`
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [detailCache, setDetailCache] = useState({})
  const [loadingDetailId, setLoadingDetailId] = useState(null)

  const todayStr = getTodayStr()

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  async function toggleDetail(orderId) {
    if (expandedId === orderId) {
      setExpandedId(null)
      return
    }
    setExpandedId(orderId)

    if (!detailCache[orderId]) {
      setLoadingDetailId(orderId)
      try {
        const data = await getOrderById(orderId)
        setDetailCache((prev) => ({ ...prev, [orderId]: data }))
      } catch {
        setDetailCache((prev) => ({ ...prev, [orderId]: { items: [], error: true } }))
      } finally {
        setLoadingDetailId(null)
      }
    }
  }

  if (loading) return <p>Đang tải...</p>
  if (orders.length === 0) return <p className="note-text">Bạn chưa có đơn thuê nào.</p>

  return (
    <div className="orders-page">
      <h1>Đơn thuê của tôi</h1>

      <div className="order-list">
        {orders.map((o) => {
          const isExpanded = expandedId === o.id
          const detail = detailCache[o.id]

          return (
            <div className="order-card" key={o.id}>
              <div className="order-card-header">
                <div className="order-card-id-block">
                  <span className="order-card-id">Đơn #{o.id}</span>
                  <span className="rental-type-badge">
                    {getRentalTypeLabel(o.rental_start_date, todayStr)}
                  </span>
                </div>
                <span className={`status-badge status-${o.status}`}>
                  {statusLabel[o.status] || o.status}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-card-dates">
                  <span>Thuê: <strong>{formatDateVN(o.rental_start_date)}</strong></span>
                  <span className="order-card-dates-sep">→</span>
                  <span>Trả: <strong>{formatDateVN(o.rental_end_date)}</strong></span>
                </div>

                <div className="order-card-amounts">
                  <div className="order-amount-item">
                    <span className="order-amount-label">Tiền thuê</span>
                    <span className="order-amount-value">
                      {Number(o.total_amount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="order-amount-item">
                    <span className="order-amount-label">Tiền cọc</span>
                    <span className="order-amount-value order-amount-deposit">
                      {Number(o.deposit_amount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="order-amount-item order-amount-grand">
                    <span className="order-amount-label">Tổng cần thanh toán</span>
                    <span className="order-amount-value">
                      {(Number(o.total_amount) + Number(o.deposit_amount)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <div className="payment-cell">
                  <span>{paymentMethodLabel[o.payment_method] || o.payment_method}</span>
                  <span className={`payment-status-badge payment-status-${o.payment_status}`}>
                    {paymentStatusLabel[o.payment_status] || o.payment_status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="order-detail-toggle"
                onClick={() => toggleDetail(o.id)}
              >
                {isExpanded ? 'Ẩn chi tiết ▲' : 'Xem chi tiết đơn thuê ▼'}
              </button>

              {isExpanded && (
                <div className="order-detail-panel">
                  {loadingDetailId === o.id && <p className="note-text">Đang tải chi tiết...</p>}

                  {detail?.error && (
                    <p className="error-text">Không tải được chi tiết đơn này.</p>
                  )}

                  {detail?.items?.length > 0 && (
                    <table className="order-detail-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>SL</th>
                          <th>Đơn giá / ngày</th>
                          <th>Số ngày</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>{Number(item.unit_price_per_day).toLocaleString('vi-VN')} đ</td>
                            <td>{item.days}</td>
                            <td>{Number(item.subtotal).toLocaleString('vi-VN')} đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {detail && !detail.error && detail.items?.length === 0 && (
                    <p className="note-text">Đơn này không có sản phẩm nào.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}