import api from './api'

// GET /api/products?category_id=&search=
export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', payload)
  return data
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`)
  return data
}
export async function uploadProductImages(files) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))

  const { data } = await api.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.urls
}