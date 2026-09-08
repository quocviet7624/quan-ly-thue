import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Xin chào, {user?.full_name}</span>
          <button onClick={handleLogout}>Đăng xuất</button>
        </header>
        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  )
}