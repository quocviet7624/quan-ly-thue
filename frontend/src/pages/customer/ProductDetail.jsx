import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductById } from '../../services/productService'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .catch(() => setError('Không tải được sản phẩm.'))
  }, [id])

  function handleAddToCart() {
    if (!startDate || !endDate) {
      alert('Vui lòng chọn ngày thuê và ngày trả')
      return
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product, quantity: Number(quantity), startDate, endDate })
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Đã thêm vào giỏ hàng!')
  }

  if (error) return <p className="error-text">{error}</p>
  if (!product) return <p>Đang tải...</p>

  return (
    <div className="product-detail">
      <img src={product.image_url || 'https://placehold.co/500x350?text=No+Image'} alt={product.name} />
      <div className="product-detail-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="product-price">
          {Number(product.rental_price_per_day).toLocaleString('vi-VN')} đ / ngày
        </p>
        <p>Tiền cọc: {Number(product.deposit_amount).toLocaleString('vi-VN')} đ</p>

        <div className="rental-form">
          <label>
            Ngày thuê
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            Ngày trả
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <label>
            Số lượng
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <button onClick={handleAddToCart} className="btn-primary">
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  )
}