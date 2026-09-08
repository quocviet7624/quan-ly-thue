import api from './api'

export async function getUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function updateUserStatus(id, status) {
  const { data } = await api.patch(`/users/${id}/status`, { status })
  return data
}