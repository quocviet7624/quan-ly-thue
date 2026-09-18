import { SERVER_ORIGIN } from '../services/api'

export function resolveImageUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `${SERVER_ORIGIN}${url}`
}