import api from './api'

export async function getReviewsByProduct(productId) {
  const { data } = await api.get(`/reviews/product/${productId}`)
  return data
}

export async function createReview(productId, payload) {
  const { data } = await api.post(`/reviews/product/${productId}`, payload)
  return data
}
export async function getRecentReviews() {
  const { data } = await api.get('/reviews/recent')
  return data
}