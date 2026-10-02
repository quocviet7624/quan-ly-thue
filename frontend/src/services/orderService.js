import api from './api'

// payload: { rental_start_date, rental_end_date, items: [{ product_id, quantity }], payment_method }
export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data
}

// Admin tạo đơn tại quầy cho khách vãng lai (không cần tài khoản).
// payload: { guest_name, guest_phone, rental_start_date, rental_end_date, items, payment_method, status }
export async function createOrderAdmin(payload) {
  const { data } = await api.post('/orders/admin', payload)
  return data
}

// Admin sửa toàn bộ đơn (ngày thuê, sản phẩm, thông tin khách, thanh toán).
export async function updateOrder(id, payload) {
  const { data } = await api.put(`/orders/${id}`, payload)
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

// Xác nhận kết quả thanh toán VNPay sau khi redirect về /payment-result.
export async function verifyVnpayReturn(queryString) {
  const { data } = await api.get(`/orders/vnpay-return${queryString}`)
  return data
}