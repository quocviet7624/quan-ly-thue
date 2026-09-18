import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  function handleLogout() {
    logout()
    navigate('/')
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`)
      setShowSearch(false)
    }
  }

  return (
    <header className="site-header">
      {/* Hàng trên: logo + hotline + social */}
      <div className="header-top">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🏕️</span>
          <div className="logo-text">
            <span className="logo-title">Dã Ngoại Rental</span>
            <span className="logo-subtitle">CHUYÊN THIẾT BỊ, PHỤ KIỆN DÃ NGOẠI</span>
          </div>
        </Link>

        <div className="header-top-right">
          <a href="tel:0852192629" className="hotline-badge">
            <span className="hotline-icon">📞</span>
            HOTLINE ĐẶT HÀNG VÀ HỖ TRỢ: 0852 192 629
          </a>
          <div className="social-icons">
            <a href="#" aria-label="Facebook" className="social-icon">
              f
            </a>
            <a href="tel:0852192629" aria-label="Gọi điện" className="social-icon">
              📞
            </a>
          </div>
        </div>
      </div>

      {/* Hàng dưới: menu nền tối */}
      <nav className="header-nav">
        <div className="header-nav-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Thiết bị</Link>
          <Link to="/gioi-thieu">Giới thiệu</Link>
          {isAuthenticated && <Link to="/orders">Đơn của tôi</Link>}
          {isAuthenticated && <Link to="/profile">Hồ sơ</Link>}
        </div>

        <div className="header-nav-actions">
          <button className="icon-btn" onClick={() => setShowSearch((v) => !v)} aria-label="Tìm kiếm">
            🔍
          </button>
          <Link to="/cart" className="icon-btn" aria-label="Giỏ hàng">
            🛒
          </Link>

          {isAuthenticated ? (
            <>
              <span className="header-username">Xin chào, {user.full_name}</span>
              <button className="header-logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-auth-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="header-auth-link">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Ô tìm kiếm sổ xuống khi bấm icon */}
      {showSearch && (
        <form className="header-search-dropdown" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">
            Tìm
          </button>
        </form>
      )}
    </header>
  )
}