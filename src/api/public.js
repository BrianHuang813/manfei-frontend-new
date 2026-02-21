import axios from './axios'

// ── Public API (no auth required) ──────────────────────────

export const fetchServices = async () => {
  const { data } = await axios.get('/api/public/services')
  return data
}

export const fetchServicesByCategory = async () => {
  const { data } = await axios.get('/api/public/services/by-category')
  return data
}

export const fetchNews = async (limit = 5) => {
  const { data } = await axios.get('/api/public/news', { params: { limit } })
  return data
}

export const fetchNewsById = async (id) => {
  const { data } = await axios.get(`/api/public/news/${id}`)
  return data
}

export const fetchPortfolio = async () => {
  const { data } = await axios.get('/api/public/portfolio')
  return data
}

export const fetchProducts = async () => {
  const { data } = await axios.get('/api/public/products')
  return data
}

export const fetchProductById = async (id) => {
  const { data } = await axios.get(`/api/public/products/${id}`)
  return data
}

export const fetchTestimonials = async () => {
  const { data } = await axios.get('/api/public/testimonials')
  return data
}
