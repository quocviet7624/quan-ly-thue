import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductById } from '../../services/productService'
import { getReviewsByProduct, createReview } from '../../services/reviewService'
import { useAuth } from '../../context/AuthContext'
import { SERVER_ORIGIN } from '../../services/api'

function resolveImageUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `${SERVER_ORIGIN}${url}`
}

function getTodayStr() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

function StarDisplay({ value, size = 16 }) {
  return (
    <span className="star-display" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </span>
  )
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <span className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= (hover || value) ? 'star-filled' : 'star-empty'}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState(null)

  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ total: 0, average: '0.0' })
  const [loadingReviews, setLoadingReviews] = useState(true)

  const [ratingInput, setRatingInput] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState(null)
  const [reviewError, setReviewError] = useState(null)

  const todayStr = getTodayStr()

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        setProduct(data)
        const firstImage = data.images?.[0] || data.image_url
        setActiveImage(firstImage)
      })
      .catch(() => setError('Không tải được sản phẩm.'))
  }, [id])

  function loadReviews() {
    setLoadingReviews(true)
    getReviewsByProduct(id)
      .then((data) => {
        setReviews(data.reviews)
        setReviewSummary({ total: data.total, average: data.average })
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false))
  }

  useEffect(() => {
    loadReviews()
  }, [id])

  function calcDays() {
    if (!startDate || !endDate) return 0
    const s = new Date(startDate)
    const e = new Date(endDate)
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)))
  }

  function goToPrevImage() {
    if (!product?.images?.length) return
    const idx = product.images.indexOf(activeImage)
    const prevIdx = idx <= 0 ? product.images.length - 1 : idx - 1
    setActiveImage(product.images[prevIdx])
  }

  function goToNextImage() {
    if (!product?.images?.length) return
    const idx = product.images.indexOf(activeImage)
    const nextIdx = idx === product.images.length - 1 ? 0 : idx + 1
    setActiveImage(product.images[nextIdx])
  }

  const days = calcDays()
  const estimatedTotal = product ? product.rental_price_per_day * quantity * (days || 1) : 0
  const stock = product ? Number(product.stock_quantity) : 0
  const isOutOfStock = product && stock <= 0

  function handleStartDateChange(e) {
    const value = e.target.value
    setStartDate(value)
    if (endDate && value && endDate < value) {
      setEndDate('')
    }
  }

  function handleQuantityChange(e) {
    let value = Number(e.target.value) || 1
    if (value < 1) value = 1
    if (stock > 0 && value > stock) value = stock
    setQuantity(value)
  }

  function handleAddToCart() {
    if (isOutOfStock) {
      alert('Sản phẩm hiện đã hết hàng.')
      return
    }
    if (!startDate || !endDate) {
      alert('Vui lòng chọn ngày thuê và ngày trả')
      return
    }
    if (startDate < todayStr) {
      alert('Ngày thuê không được là ngày trong quá khứ')
      return
    }
    if (endDate < startDate) {
      alert('Ngày trả phải sau hoặc bằng ngày thuê')
      return
    }
    if (quantity > stock) {
      alert(`Chỉ còn ${stock} sản phẩm trong kho.`)
      return
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product, quantity: Number(quantity), startDate, endDate })
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Đã thêm vào giỏ hàng!')
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    setReviewError(null)
    setReviewMessage(null)

    if (ratingInput === 0) {
      setReviewError('Vui lòng chọn số sao đánh giá.')
      return
    }

    setSubmittingReview(true)
    try {
      await createReview(id, { rating: ratingInput, comment: commentInput })
      setReviewMessage('Cảm ơn bạn đã đánh giá!')
      setRatingInput(0)
      setCommentInput('')
      loadReviews()
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gửi đánh giá thất bại.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (error) return <p className="error-text">{error}</p>
  if (!product) return <p>Đang tải...</p>

  const hasMultipleImages = product.images && product.images.length > 1

  return (
    <div className="product-detail-page">
      {/* Khối thông tin sản phẩm */}
      <div className="product-detail-card">
        <div className="product-detail-image">
          <img
            src={resolveImageUrl(activeImage) || 'https://placehold.co/500x400?text=No+Image'}
            alt={product.name}
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                className="detail-image-nav detail-image-nav-prev"
                onClick={goToPrevImage}
                aria-label="Ảnh trước"
              >
                ‹
              </button>
              <button
                type="button"
                className="detail-image-nav detail-image-nav-next"
                onClick={goToNextImage}
                aria-label="Ảnh sau"
              >
                ›
              </button>
            </>
          )}

          {hasMultipleImages && (
            <div className="thumbnail-row">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={resolveImageUrl(img)}
                  alt={`Ảnh ${i + 1}`}
                  className={`thumbnail-item ${activeImage === img ? 'thumbnail-active' : ''}`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>

          <div className="product-rating-summary">
            <StarDisplay value={Number(reviewSummary.average)} size={18} />
            <span className="rating-average-text">{reviewSummary.average}</span>
            <span className="rating-count-text">({reviewSummary.total} đánh giá)</span>
          </div>

          <p className="product-detail-desc">{product.description}</p>

          {isOutOfStock ? (
            <span className="stock-badge stock-badge-out">Hết hàng</span>
          ) : (
            <span className="stock-badge stock-badge-in">Còn {stock} sản phẩm</span>
          )}

          <div className="product-price-box">
            <p className="product-price-big">
              {Number(product.rental_price_per_day).toLocaleString('vi-VN')} đ
              <span> / ngày</span>
            </p>
            <p className="product-deposit-text">
              Tiền cọc: {Number(product.deposit_amount).toLocaleString('vi-VN')} đ
            </p>
          </div>

          <div className="rental-form">
            <div className="rental-form-row">
              <label>
                Ngày thuê
                <input
                  type="date"
                  value={startDate}
                  min={todayStr}
                  onChange={handleStartDateChange}
                  disabled={isOutOfStock}
                />
              </label>
              <label>
                Ngày trả
                <input
                  type="date"
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isOutOfStock}
                />
              </label>
            </div>
            <label>
              Số lượng {!isOutOfStock && <span className="stock-hint">(tối đa {stock})</span>}
              <input
                type="number"
                min="1"
                max={stock || 1}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isOutOfStock}
              />
            </label>

            {days > 0 && !isOutOfStock && (
              <p className="rental-estimate">
                Tạm tính: <strong>{estimatedTotal.toLocaleString('vi-VN')} đ</strong> cho {days} ngày
              </p>
            )}

            <button
              onClick={handleAddToCart}
              className="btn-primary btn-add-to-cart-detail"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Hết hàng' : '🛒 Thêm vào giỏ'}
            </button>
          </div>
        </div>
      </div>

      {/* Khối đánh giá & nhận xét */}
      <div className="reviews-section">
        <h2>Đánh giá từ khách hàng</h2>

        {isAuthenticated ? (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <p className="review-form-label">Đánh giá của bạn:</p>
            <StarInput value={ratingInput} onChange={setRatingInput} />

            <textarea
              placeholder="Chia sẻ trải nghiệm của bạn về thiết bị này..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={3}
            />

            {reviewError && <p className="error-text">{reviewError}</p>}
            {reviewMessage && <p className="success-text">{reviewMessage}</p>}

            <button type="submit" className="btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        ) : (
          <p className="note-text">Vui lòng đăng nhập để gửi đánh giá cho sản phẩm này.</p>
        )}

        <div className="review-list">
          {loadingReviews && <p>Đang tải đánh giá...</p>}

          {!loadingReviews && reviews.length === 0 && (
            <p className="note-text">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}

          {reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-item-header">
                <strong>{r.full_name}</strong>
                <StarDisplay value={r.rating} size={14} />
                <span className="review-date">
                  {new Date(r.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}