import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Dùng cho route cần đăng nhập (VD: /orders)
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Dùng cho route chỉ admin/staff mới vào được (VD: /admin/*)
export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}