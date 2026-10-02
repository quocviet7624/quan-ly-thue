import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../utils/roles'

const links = [
  { to: '/admin', label: 'Tổng quan', end: true, roles: ['staff', 'admin'] },
  { to: '/admin/products', label: 'Sản phẩm', roles: ['staff', 'admin'] },
  { to: '/admin/orders', label: 'Đơn thuê', roles: ['staff', 'admin'] },
  { to: '/admin/categories', label: 'Danh mục', roles: ['admin'] },
  { to: '/admin/users', label: 'Người dùng', roles: ['admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const visible = links.filter((l) => l.roles.includes(user?.role))

  return (
    <aside className="sidebar">
      <div className="sidebar-title">{ROLE_LABELS[user?.role] || 'Quản trị'}</div>
      <nav>
        {visible.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}