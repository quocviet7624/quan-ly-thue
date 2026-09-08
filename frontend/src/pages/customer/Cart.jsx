import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'

export default function Cart() {
  const [cart, setCart] = useState([])
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  function removeItem(index) {
    const updated = cart.filter((_, i) => i !== index)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  function calcDays(item) {
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  }

  const total = cart.reduce(
    (sum, item) => sum + item.product.rental_price_per_day * item.quantity * calcDays(item),
    0
  )

  async function handleCheckout() {
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
    }

    try {
      await createOrder(payload)
      localStorage.removeItem('cart')
      setCart([])
      alert('Đặt thuê thành công!')
      navigate('/orders')
    } catch {
      alert('Đặt thuê thất bại. Vui lòng thử lại.')
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
            <th>Thành tiền</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>{item.startDate}</td>
              <td>{item.endDate}</td>
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
      <h3>Tổng cộng: {total.toLocaleString('vi-VN')} đ</h3>
      <button className="btn-primary" onClick={handleCheckout}>
        Xác nhận đặt thuê
      </button>
    </div>
  )
}