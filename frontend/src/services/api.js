import axios from 'axios'

// Đổi URL này khi backend Express deploy ở địa chỉ khác
const BASE_URL = 'http://localhost:5000/api'

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

// Nếu token hết hạn (401) -> tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api