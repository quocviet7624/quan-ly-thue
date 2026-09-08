import api from './api'

// Backend Express nên trả về { token, user: { id, full_name, email, role } }
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data.user
}

export async function register(payload) {
  // payload: { full_name, email, phone, password }
  const { data } = await api.post('/auth/register', payload)
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getCurrentUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}