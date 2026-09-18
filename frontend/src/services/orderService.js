import api from './api'

// payload: { rental_start_date, rental_end_date, items: [{ product_id, quantity }] }
export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data
}

// Đơn thuê của khách hàng đang đăng nhập
export async function getMyOrders() {
  const { data } = await api.get('/orders/me')
  return data
}

// Admin: lấy tất cả đơn thuê, có thể filter theo status
export async function getAllOrders(params = {}) {
  const { data } = await api.get('/orders', { params })
  return data
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status })
  return data
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${id}`)
  return data
}
export async function deleteOrder(id) {
  const { data } = await api.delete(`/orders/${id}`)
  return data
}