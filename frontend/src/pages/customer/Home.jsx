import { Link } from 'react-router-dom'

const categories = [
  { icon: '⛺', name: 'Lều trại', desc: 'Chống nước, dễ dựng, đủ size cho nhóm nhỏ tới lớn' },
  { icon: '🛏️', name: 'Túi ngủ', desc: 'Giữ ấm tốt, phù hợp mọi điều kiện thời tiết' },
  { icon: '🔥', name: 'Bếp gas mini', desc: 'Gọn nhẹ, nấu nướng tiện lợi giữa rừng núi' },
  { icon: '🔦', name: 'Đèn chiếu sáng', desc: 'Đèn pin, đèn lều sáng lâu, tiết kiệm pin' },
  { icon: '🎒', name: 'Balo chống nước', desc: 'Đựng đồ an toàn qua mưa nắng' },
]

const steps = [
  {
    step: '01',
    title: 'Chọn thiết bị',
    desc: 'Duyệt danh sách thiết bị, xem mô tả và giá thuê theo ngày.',
  },
  {
    step: '02',
    title: 'Chọn ngày thuê',
    desc: 'Chọn ngày nhận và ngày trả phù hợp với lịch trình chuyến đi.',
  },
  {
    step: '03',
    title: 'Xác nhận đơn',
    desc: 'Đặt cọc và xác nhận đơn thuê, nhận thiết bị đúng hẹn.',
  },
  {
    step: '04',
    title: 'Trải nghiệm & trả đồ',
    desc: 'Tận hưởng chuyến đi, trả thiết bị đúng ngày và nhận lại tiền cọc.',
  },
]

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero banner có ảnh nền */}
      <section
        className="hero-banner"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 40, 25, 0.55), rgba(15, 40, 25, 0.65)), url(https://picsum.photos/id/1015/1600/700)',
        }}
      >
        <div className="hero-content">
          <span className="hero-badge">🏕️ Dịch vụ cho thuê thiết bị dã ngoại #1</span>
          <h1>Sẵn sàng cho mọi chuyến đi, không cần mua sắm tốn kém</h1>
          <p>
            Lều trại, túi ngủ, bếp gas, đèn chiếu sáng, balo chống nước... đầy đủ trang bị,
            giao nhận tận nơi, giá thuê theo ngày hợp lý.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              Xem thiết bị ngay
            </Link>
            <Link to="/register" className="btn-outline">
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </section>

      {/* Thống kê nhanh */}
      <section className="stats-row">
        <div className="stat-item">
          <span className="stat-number">500+</span>
          <span className="stat-label">Thiết bị sẵn sàng cho thuê</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">2,000+</span>
          <span className="stat-label">Lượt thuê thành công</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">4.8/5</span>
          <span className="stat-label">Đánh giá trung bình từ khách hàng</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Hỗ trợ đặt thuê trực tuyến</span>
        </div>
      </section>

      {/* Danh mục nổi bật */}
      <section className="section-block">
        <h2 className="section-title">Danh mục thiết bị phổ biến</h2>
        <p className="section-subtitle">
          Đầy đủ trang bị cho chuyến dã ngoại, cắm trại hay leo núi của bạn
        </p>
        <div className="category-grid">
          {categories.map((c) => (
            <div className="category-card" key={c.name}>
              <div className="category-icon">{c.icon}</div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quy trình thuê */}
      <section className="section-block steps-section">
        <h2 className="section-title">Thuê thiết bị chỉ với 4 bước đơn giản</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div className="step-card" key={s.step}>
              <span className="step-number">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA cuối trang */}
      <section className="cta-banner">
        <h2>Sẵn sàng cho chuyến đi tiếp theo?</h2>
        <p>Đặt thuê ngay hôm nay, giao nhận nhanh chóng và tiện lợi.</p>
        <Link to="/products" className="btn-primary">
          Khám phá thiết bị
        </Link>
      </section>
    </div>
  )
}