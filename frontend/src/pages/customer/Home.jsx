import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-banner">
        <h1>Thuê thiết bị dã ngoại nhanh chóng, tiện lợi</h1>
        <p>Lều trại, túi ngủ, bếp gas, đèn pin... đầy đủ cho chuyến đi của bạn.</p>
        <Link to="/products" className="btn-primary">
          Xem thiết bị ngay
        </Link>
      </section>
    </div>
  )
}