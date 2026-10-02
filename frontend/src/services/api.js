import axios from 'axios'

// Mặc định dùng localhost. Khi deploy hoặc cần truy cập từ máy khác,
// tạo file frontend/.env với dòng: VITE_API_URL=http://<địa-chỉ>:5000/api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Dùng để ghép với đường dẫn ảnh trả về từ server, VD: '/uploads/products/xxx.jpg'
export const SERVER_ORIGIN = BASE_URL.replace('/api', '')

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tự động đính kèm token vào mỗi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token hết hạn (401) -> tự động logout.
// Chỉ áp dụng khi đang có token; khách chưa đăng nhập không bị đẩy về /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api