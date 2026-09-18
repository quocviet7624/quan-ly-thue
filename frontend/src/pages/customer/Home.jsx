import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import { getRecentReviews } from '../../services/reviewService'
import { getOverviewStats } from '../../services/statsService'
import ImageCarousel from '../../components/ImageCarousel'

const categoryIcons = {
  lều: '⛺',
  'túi ngủ': '🛏️',
  bếp: '🔥',
  đèn: '🔦',
  balo: '🎒',
  bàn: '🪑',
  ghế: '🪑',
  loa: '🔊',
  bạt: '⛱️',
}

function getIconForCategory(name) {
  const lower = name.toLowerCase()
  const found = Object.keys(categoryIcons).find((key) => lower.includes(key))
  return found ? categoryIcons[found] : '🧰'
}

const criteriaItems = [
  { icon: '🎒', title: 'Thiết Bị Đa Dạng', quote: 'Đầy đủ lều, túi ngủ, bếp, đèn, balo... sạch sẽ, kiểm tra kỹ trước khi giao' },
  { icon: '🪑', title: 'Phụ Kiện Đi Kèm', quote: 'Bàn ghế, đèn chiếu sáng, dụng cụ nấu ăn... đầy đủ cho mọi quy mô chuyến đi' },
  { icon: '📍', title: 'Giao Nhận Tận Nơi', quote: 'Giao và thu hồi thiết bị đúng hẹn, đúng địa điểm bạn yêu cầu' },
  { icon: '👍', title: 'Chất Lượng & Giá Rẻ', quote: 'Đồ thuê chất lượng, giá cả hợp lý, minh bạch cho mọi chuyến đi' },
]

const galleryPhotos = [
  '/images/home/anh1.jpg',
  '/images/home/anh2.jpg',
  '/images/home/anh3.jpg',
  '/images/home/anh4.jpg',
]

const perks = [
  { icon: '🏷️', text: 'Chương trình giảm giá thường xuyên' },
  { icon: '🚚', text: 'Freeship 5km cho hóa đơn trên 500k' },
  { icon: '💬', text: 'Tư vấn thiết bị phù hợp & hỗ trợ 24/7' },
]

function StarRow({ value }) {
  return (
    <span className="review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getProducts()
      .then((data) => setFeatured(data.slice(0, 10)))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false))
    getOverviewStats().then(setStats).catch(() => {})
    getRecentReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false))
  }, [])

  function goToCategory(categoryId) {
    navigate(categoryId ? `/products?category=${categoryId}` : '/products')
  }

  function prevPhoto() {
    setGalleryIndex((i) => (i === 0 ? galleryPhotos.length - 1 : i - 1))
  }

  function nextPhoto() {
    setGalleryIndex((i) => (i === galleryPhotos.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="home-page">
      {/* Hero / Banner chào mừng */}
      <section
        className="welcome-banner full-bleed"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.5)), url(/images/home/anh1.jpg)',
        }}
      >
        <div className="full-bleed-inner">
          <p className="welcome-eyebrow">Dịch vụ cho thuê thiết bị, phụ kiện dã ngoại</p>
          <h1 className="welcome-title">
            Chào mừng bạn đến với <span className="brand-highlight">DÃ NGOẠI RENTAL</span>
          </h1>
          <Link to="/products" className="hero-cta-btn">
            Khám phá thiết bị ngay →
          </Link>
        </div>
      </section>

      {/* Thanh phụ đề + tiêu chí lớn */}
      <section className="tagline-section full-bleed">
        <div className="full-bleed-inner">
          <p className="tagline-small">Dịch vụ cho thuê thiết bị, phụ kiện dã ngoại</p>
          <h2 className="tagline-heading">
            HÃY ĐỂ CHÚNG TÔI ĐỒNG HÀNH CÙNG BẠN VỚI TIÊU CHÍ
          </h2>
        </div>
      </section>

      {/* Hàng 4 tiêu chí */}
      <section className="criteria-row full-bleed">
        <div className="full-bleed-inner criteria-grid">
          {criteriaItems.map((c) => (
            <div className="criteria-item" key={c.title}>
              <div className="criteria-icon">
                <span>{c.icon}</span>
              </div>
              <h3>{c.title}</h3>
              <p>"{c.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vì sao chọn chúng tôi - số liệu thật */}
      <section className="stats-section full-bleed">
        <div className="full-bleed-inner">
          <h2 className="stats-title">Vì Sao Chọn Dã Ngoại Rental?</h2>
          <div className="stats-grid">
            <div className="stats-item">
              <span className="stats-icon">🧰</span>
              <span className="stats-number">{stats ? stats.productCount : '--'}+</span>
              <span className="stats-label">Thiết bị sẵn sàng cho thuê</span>
            </div>
            <div className="stats-item">
              <span className="stats-icon">✅</span>
              <span className="stats-number">{stats ? stats.completedOrders : '--'}</span>
              <span className="stats-label">Đơn thuê đã hoàn tất</span>
            </div>
            <div className="stats-item">
              <span className="stats-icon">⭐</span>
              <span className="stats-number">{stats ? stats.averageRating : '--'}/5</span>
              <span className="stats-label">Đánh giá trung bình</span>
            </div>
            <div className="stats-item">
              <span className="stats-icon">🗂️</span>
              <span className="stats-number">{stats ? stats.categoryCount : '--'}</span>
              <span className="stats-label">Danh mục thiết bị</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ảnh thực tế khách hàng */}
      <section className="gallery-section full-bleed">
        <div className="full-bleed-inner">
          <h2 className="gallery-title">Những Hình Ảnh Thực Tế Khách Hàng Sử Dụng Thiết Bị</h2>
          <div className="gallery-carousel">
            <button className="carousel-arrow carousel-arrow-left" onClick={prevPhoto}>
              ‹
            </button>
            <img src={galleryPhotos[galleryIndex]} alt={`Khách hàng ${galleryIndex + 1}`} />
            <button className="carousel-arrow carousel-arrow-right" onClick={nextPhoto}>
              ›
            </button>
          </div>
          <div className="carousel-dots">
            {galleryPhotos.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === galleryIndex ? 'carousel-dot-active' : ''}`}
                onClick={() => setGalleryIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cảm nhận thực tế từ khách hàng - review thật từ database */}
      <section className="reviews-home-section full-bleed">
        <div className="full-bleed-inner">
          <h2 className="reviews-home-title">Cảm Nhận Thực Tế Từ Khách Hàng</h2>

          {loadingReviews && <p className="note-text">Đang tải đánh giá...</p>}

          {!loadingReviews && reviews.length === 0 && (
            <p className="note-text">Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và đánh giá!</p>
          )}

          <div className="reviews-home-grid">
            {reviews.map((r) => (
              <div className="review-home-card" key={r.id}>
                <div className="review-home-header">
                  <div className="review-avatar">{r.full_name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="review-home-name">{r.full_name}</p>
                    <p className="review-home-date">
                      {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="review-verified-badge" title="Đã thuê thiết bị">
                    ✓
                  </span>
                </div>
                <StarRow value={r.rating} />
                <p className="review-home-comment">{r.comment}</p>
                <p className="review-home-product">Đã thuê: {r.product_name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ưu đãi khi thuê */}
      <section className="perks-section full-bleed">
        <div className="full-bleed-inner">
          <div className="perks-star">★</div>
          <h2 className="perks-title">ƯU ĐÃI KHI THUÊ THIẾT BỊ TẠI SHOP</h2>
          <div className="perks-row">
            {perks.map((p) => (
              <div className="perk-item" key={p.text}>
                <div className="perk-icon">{p.icon}</div>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          <div className="policy-block">
            <h3 className="policy-heading">Chính sách thuê thiết bị</h3>

            <p className="policy-subheading">1. Thời gian thuê</p>
            <ul className="policy-list">
              <li>Thời gian thuê tính từ lúc nhận thiết bị đến lúc trả, tối đa 24h/lượt.</li>
              <li>Nếu đi xa, có thể báo trước để hỗ trợ nhận sớm/trả trễ (tối đa 36h).</li>
              <li>Thuê thêm ngày thứ 2, 3, 4... tính giá 50%/ngày trên hóa đơn ngày 1.</li>
            </ul>

            <p className="policy-subheading">2. Cọc đồ và thanh toán</p>
            <ul className="policy-list">
              <li>Khi nhận đồ, cần đặt cọc bằng CMND/CCCD hoặc thẻ sinh viên (thông tin được bảo mật).</li>
              <li>Nếu không có giấy tờ, đặt cọc x4 giá trị hóa đơn thuê.</li>
              <li>Thanh toán đầy đủ trước khi nhận thiết bị.</li>
              <li>Đơn đặt trước không cần cọc tiền (trừ ngày lễ), có thể hủy trước 1 ngày.</li>
            </ul>

            <p className="policy-subheading">3. Chính sách bồi hoàn</p>
            <ul className="policy-list">
              <li>
                Thiết bị bị mất, hỏng nặng không thể sửa chữa: khách bồi thường 80% giá trị sản phẩm
                (theo giá niêm yết trên hệ thống).
              </li>
            </ul>

            <p className="policy-note">
              💡 Lưu ý: nên chọn thiết bị lớn hơn nhu cầu thực tế một chút để có chỗ để đồ cá nhân,
              balo, dụng cụ đi kèm thoải mái hơn.
            </p>
          </div>
        </div>
      </section>

      {/* Banner liên hệ hỗ trợ */}
      <section className="contact-banner full-bleed">
        <div className="full-bleed-inner">
          <p className="contact-banner-text">
            💬 Mọi vấn đề liên quan đến thiết bị thuê & cách sử dụng, liên hệ ngay cho chúng tôi:
          </p>
          <div className="contact-banner-buttons">
            <a href="https://zalo.me/0852192629" className="contact-btn">
              💠 Zalo: 0852 192 629
            </a>
            <a href="tel:0852192629" className="contact-btn">
              📞 Hotline: 0852 192 629
            </a>
          </div>
        </div>
      </section>

      {/* Khu sản phẩm cho thuê */}
      <section className="products-section-home full-bleed">
        <div className="full-bleed-inner">
          <h2 className="products-section-title">Dã Ngoại Rental - Dịch Vụ Cho Thuê Thiết Bị</h2>
          <h3 className="products-section-subtitle">* THIẾT BỊ CHO THUÊ *</h3>

          <div className="category-pills">
            <button className="pill pill-active" onClick={() => goToCategory('')}>
              🗂️ Tất cả thiết bị
            </button>
            {categories.map((c) => (
              <button className="pill" key={c.id} onClick={() => goToCategory(c.id)}>
                {getIconForCategory(c.name)} {c.name}
              </button>
            ))}
          </div>

          {loadingFeatured && <p className="note-text-light">Đang tải...</p>}

          {!loadingFeatured && featured.length === 0 && (
            <p className="note-text-light">
              Chưa có thiết bị nào, hãy thêm sản phẩm trong trang quản trị.
            </p>
          )}

          <div className="featured-grid">
            {featured.map((p) => (
              <div className="featured-card" key={p.id}>
                <ImageCarousel images={p.images} fallback={p.image_url} alt={p.name} />
                <div className="featured-card-body">
                  <h3>{p.name}</h3>
                  <p className="featured-price">
                    {Number(p.rental_price_per_day).toLocaleString('vi-VN')} đ
                    <span> / ngày</span>
                  </p>
                  <Link to={`/products/${p.id}`} className="btn-add-cart">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA cuối trang */}
      <section className="cta-banner full-bleed">
        <div className="full-bleed-inner">
          <h2>Sẵn sàng cho chuyến đi tiếp theo?</h2>
          <p>Đặt thuê ngay hôm nay, giao nhận nhanh chóng và tiện lợi.</p>
          <Link to="/products" className="btn-primary">
            Khám phá thiết bị
          </Link>
        </div>
      </section>
    </div>
  )
}