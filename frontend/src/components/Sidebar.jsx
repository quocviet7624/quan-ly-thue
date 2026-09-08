import { NavLink } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/categories', label: 'Danh mục' },
  { to: '/admin/orders', label: 'Đơn thuê' },
  { to: '/admin/users', label: 'Người dùng' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Quản trị</div>
      <nav>
        {links.map((link) => (
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