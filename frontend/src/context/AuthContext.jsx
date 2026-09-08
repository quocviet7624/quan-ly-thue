import { createContext, useContext, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser())

  async function login(email, password) {
    const loggedUser = await authService.login(email, password)
    setUser(loggedUser)
    return loggedUser
  }

  function logout() {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'staff',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return ctx
}