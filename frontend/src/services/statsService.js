import api from './api'

export async function getOverviewStats() {
  const { data } = await api.get('/stats/overview')
  return data
}