import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'

const PAYMENT_METHODS = [
  { value: 'vnpay', label: 'Thanh toán online qua VNPay' },
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'store', label: 'Thanh toán tại cửa hàng' },
]

function getTodayStr() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

function formatDateVN(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

// Không cần thêm cột DB mới: chỉ cần so sánh ngày thuê với hôm nay để biết
// đây là đơn "lấy ngay" (ngày thuê = hôm nay) hay "đặt trước" (ngày thuê ở tương lai).
function getRentalTypeLabel(startDate, todayStr) {
  if (!startDate) return null
  if (startDate === todayStr) return 'Lấy ngay hôm nay'
  return `Đặt trước — bắt đầu ${formatDateVN(startDate)}`
}

export default function Cart() {
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('store')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const todayStr = getTodayStr()

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  function persistCart(updated) {
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  function removeItem(index) {
    persistCart(cart.filter((_, i) => i !== index))
  }

  function changeQuantity(index, delta) {
    const updated = cart.map((item, i) => {
      if (i !== index) return item
      const newQuantity = Math.max(1, Number(item.quantity) + delta)
      return { ...item, quantity: newQuantity }
    })
    persistCart(updated)
  }

  function calcDays(item) {
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  }

  const totalRental = cart.reduce(
    (sum, item) => sum + item.product.rental_price_per_day * item.quantity * calcDays(item),
    0
  )

  const totalDeposit = cart.reduce(
    (sum, item) => sum + item.product.deposit_amount * item.quantity,
    0
  )

  const grandTotal = totalRental + totalDeposit

  async function handleCheckout() {
    setError(null)

    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (cart.length === 0) return

    const payload = {
      rental_start_date: cart[0].startDate,
      rental_end_date: cart[0].endDate,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      payment_method: paymentMethod,
    }

    setSubmitting(true)
    try {
      const result = await createOrder(payload)

      if (result.paymentUrl) {
        // Chuyển sang cổng thanh toán VNPay, giỏ hàng sẽ được xóa sau khi
        // thanh toán xong (xử lý ở trang /payment-result) để tránh mất dữ liệu
        // nếu người dùng hủy giao dịch giữa chừng.
        window.location.href = result.paymentUrl
        return
      }

      localStorage.removeItem('cart')
      setCart([])
      alert('Đặt thuê thành công!')
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt thuê thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return <p>Giỏ hàng đang trống.</p>

  return (
    <div className="cart-page">
      <h1>Giỏ hàng</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>SL</th>
            <th>Ngày thuê</th>
            <th>Ngày trả</th>
            <th>Hình thức</th>
            <th>Thành tiền</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{item.product.name}</td>
              <td>
                <div className="cart-quantity-control">
                  <button
                    type="button"
                    onClick={() => changeQuantity(i, -1)}
                    disabled={item.quantity <= 1}
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(i, 1)}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{item.startDate}</td>
              <td>{item.endDate}</td>
              <td>
                <span className="rental-type-badge">
                  {getRentalTypeLabel(item.startDate, todayStr)}
                </span>
              </td>
              <td>
                {(
                  item.product.rental_price_per_day * item.quantity * calcDays(item)
                ).toLocaleString('vi-VN')}{' '}
                đ
              </td>
              <td>
                <button onClick={() => removeItem(i)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary-box">
        <p>Tiền thuê: <strong>{totalRental.toLocaleString('vi-VN')} đ</strong></p>
        <p>Tiền cọc: <strong>{totalDeposit.toLocaleString('vi-VN')} đ</strong></p>
        <p className="cart-grand-total">
          Tổng cần thanh toán: <strong>{grandTotal.toLocaleString('vi-VN')} đ</strong>
        </p>
      </div>

      <fieldset className="payment-method-group">
        <legend>Phương thức thanh toán</legend>
        {PAYMENT_METHODS.map((m) => (
          <label key={m.value} className="payment-method-option">
            <input
              type="radio"
              name="payment_method"
              value={m.value}
              checked={paymentMethod === m.value}
              onChange={() => setPaymentMethod(m.value)}
            />
            {m.label}
          </label>
        ))}
      </fieldset>

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" onClick={handleCheckout} disabled={submitting}>
        {submitting ? 'Đang xử lý...' : 'Xác nhận đặt thuê'}
      </button>
    </div>
  )
}