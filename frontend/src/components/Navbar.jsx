import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        🏕️ Dã Ngoại Rental
      </Link>

      <nav className="navbar-links">
        <Link to="/products">Thiết bị</Link>
        <Link to="/cart">Giỏ hàng</Link>
        {isAuthenticated && <Link to="/orders">Đơn của tôi</Link>}
      </nav>

      <div className="navbar-auth">
        {isAuthenticated ? (
          <>
            <span className="navbar-username">Xin chào, {user.full_name}</span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  )
}