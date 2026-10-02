import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Cần đăng nhập (VD: /orders, /profile)
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function RequireRole({ roles, children }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user) return null // đang nạp thông tin user
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'customer' ? '/' : '/admin'} replace />
  }
  return children
}

// Người cho thuê (staff) + Admin: vào khu vực quản trị
export function RequireStaff({ children }) {
  return <RequireRole roles={['staff', 'admin']}>{children}</RequireRole>
}

// Chỉ Admin: quản lý tài khoản - phân quyền, danh mục
export function RequireAdmin({ children }) {
  return <RequireRole roles={['admin']}>{children}</RequireRole>
}