import { Link } from 'react-router-dom'
import { SERVER_ORIGIN } from '../services/api'

function resolveImageUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `${SERVER_ORIGIN}${url}`
}

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={resolveImageUrl(product.image_url) || 'https://placehold.co/300x200?text=No+Image'}
        alt={product.name}
      />
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-price">
          {Number(product.rental_price_per_day).toLocaleString('vi-VN')} đ / ngày
        </p>
        <Link to={`/products/${product.id}`} className="btn-view">
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}