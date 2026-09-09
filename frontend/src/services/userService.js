import api from './api'

export async function getUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function updateUserStatus(id, status) {
  const { data } = await api.patch(`/users/${id}/status`, { status })
  return data
}

export async function getProfile() {
  const { data } = await api.get('/users/me')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/users/me', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await api.put('/users/me/password', payload)
  return data
}