import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { verifyVnpayReturn } from '../../services/orderService'

// Trang này nhận redirect từ VNPay (vnp_ReturnUrl trỏ về đây), sau đó gọi API backend
// để xác thực chữ ký và cập nhật trạng thái thanh toán của đơn hàng.
// Cần thêm route cho trang này trong router, ví dụ:
//   <Route path="/payment-result" element={<PaymentResult />} />
export default function PaymentResult() {
  const location = useLocation()
  const [status, setStatus] = useState('checking') // checking | success | failed
  const [message, setMessage] = useState('Đang xác nhận kết quả thanh toán...')
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    if (!location.search) {
      setStatus('failed')
      setMessage('Không có thông tin thanh toán để xác nhận.')
      return
    }

    verifyVnpayReturn(location.search)
      .then((data) => {
        setOrderId(data.orderId ?? null)
        if (data.success) {
          setStatus('success')
          setMessage(`Thanh toán tiền cọc thành công cho đơn #${data.orderId}.`)
        } else {
          setStatus('failed')
          setMessage(data.message || 'Thanh toán không thành công hoặc đã bị hủy.')
        }
      })
      .catch((err) => {
        setStatus('failed')
        setMessage(
          err.response?.data?.message ||
            'Không thể xác nhận kết quả thanh toán. Vui lòng kiểm tra lại đơn hàng của bạn.'
        )
      })
  }, [location.search])

  return (
    <div className="payment-result-page">
      <h1>Kết quả thanh toán</h1>

      {status === 'checking' && <p>{message}</p>}
      {status === 'success' && <p className="success-text">{message}</p>}
      {status === 'failed' && <p className="error-text">{message}</p>}

      <div className="payment-result-actions">
        <Link to="/orders" className="btn-primary">
          Xem đơn thuê của tôi
        </Link>
        {status === 'failed' && orderId && (
          <p className="note-text">
            Đơn #{orderId} vẫn được giữ, bạn có thể chọn thanh toán lại hoặc liên hệ cửa hàng.
          </p>
        )}
      </div>
    </div>
  )
}