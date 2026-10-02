const points = [
  'Thuê đủ loại sản phẩm, đặt nhanh trong vài phút',
  'Giá minh bạch, giao nhận tận nơi',
  'Theo dõi đơn thuê và lịch sử ngay trên tài khoản',
]

export default function AuthHero({ heading, highlight, description }) {
  return (
    <aside className="auth-hero">
      <div className="auth-hero-inner">
        <span className="auth-hero-badge">📦 Cho Thuê Đa Năng</span>
        <h2>
          {heading} <span>{highlight}</span>
        </h2>
        <p className="auth-hero-desc">{description}</p>

        <ul className="auth-hero-list">
          {points.map((p) => (
            <li key={p}>
              <span className="auth-hero-check">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}