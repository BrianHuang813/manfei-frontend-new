import api from './axios'

// ==================== User Management ====================

/**
 * Fetch all users for admin management.
 * @returns {Promise<Array>} List of users
 */
export const fetchUsers = async () => {
  const { data } = await api.get('/api/admin/users')
  return data
}

/**
 * Update a user's role.
 * @param {number} userId
 * @param {string} role - 'admin' | 'staff' | 'customer'
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  const { data } = await api.patch(`/api/admin/users/${userId}/role`, { role })
  return data
}

/**
 * Update a user's active status.
 * @param {number} userId
 * @param {boolean} isActive
 * @returns {Promise<Object>} Updated user
 */
export const updateUserStatus = async (userId, isActive) => {
  const { data } = await api.patch(`/api/admin/users/${userId}/status`, {
    is_active: isActive,
  })
  return data
}

// ==================== Service Management ====================

/**
 * Fetch all services for admin management.
 * @returns {Promise<Array>} List of services
 */
export const fetchServices = async () => {
  const { data } = await api.get('/api/admin/services')
  return data
}

/**
 * Fetch a single service by ID.
 * @param {number} serviceId
 * @returns {Promise<Object>} Service object
 */
export const fetchService = async (serviceId) => {
  const { data } = await api.get(`/api/admin/services/${serviceId}`)
  return data
}

/**
 * Create a new service.
 * @param {Object} serviceData - ServiceCreate payload
 * @returns {Promise<Object>} Created service
 */
export const createService = async (serviceData) => {
  const { data } = await api.post('/api/admin/services', serviceData)
  return data
}

/**
 * Update an existing service.
 * @param {number} serviceId
 * @param {Object} serviceData - ServiceUpdate payload (partial)
 * @returns {Promise<Object>} Updated service
 */
export const updateService = async (serviceId, serviceData) => {
  const { data } = await api.put(`/api/admin/services/${serviceId}`, serviceData)
  return data
}

/**
 * Delete a service.
 * @param {number} serviceId
 * @returns {Promise<Object>} Deletion confirmation message
 */
export const deleteService = async (serviceId) => {
  const { data } = await api.delete(`/api/admin/services/${serviceId}`)
  return data
}

/**
 * Batch reorder services by updating sort_order.
 * @param {Array<{id: number, sort_order: number}>} items
 * @returns {Promise<Object>} Confirmation message
 */
export const reorderServices = async (items) => {
  const { data } = await api.patch('/api/admin/services/reorder', { items })
  return data
}

// ==================== Image Upload ====================

/**
 * Upload an image to Cloudinary via backend.
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The Cloudinary image URL
 */
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/api/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
  return data.url
}

// ==================== News Management ====================

export const fetchNews = async () => {
  const { data } = await api.get('/api/admin/news')
  return data
}

export const createNews = async (newsData) => {
  const { data } = await api.post('/api/admin/news', newsData)
  return data
}

export const updateNews = async (newsId, newsData) => {
  const { data } = await api.put(`/api/admin/news/${newsId}`, newsData)
  return data
}

export const deleteNews = async (newsId) => {
  const { data } = await api.delete(`/api/admin/news/${newsId}`)
  return data
}

export const reorderNews = async (items) => {
  const { data } = await api.patch('/api/admin/news/reorder', { items })
  return data
}

// ==================== Product Management ====================

export const fetchProducts = async () => {
  const { data } = await api.get('/api/admin/products')
  return data
}

export const createProduct = async (productData) => {
  const { data } = await api.post('/api/admin/products', productData)
  return data
}

export const updateProduct = async (productId, productData) => {
  const { data } = await api.put(`/api/admin/products/${productId}`, productData)
  return data
}

export const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/api/admin/products/${productId}`)
  return data
}

export const reorderProducts = async (items) => {
  const { data } = await api.patch('/api/admin/products/reorder', { items })
  return data
}

// ==================== Testimonial Management ====================

export const fetchTestimonials = async () => {
  const { data } = await api.get('/api/admin/testimonials')
  return data
}

export const createTestimonial = async (testimonialData) => {
  const { data } = await api.post('/api/admin/testimonials', testimonialData)
  return data
}

export const updateTestimonial = async (testimonialId, testimonialData) => {
  const { data } = await api.put(`/api/admin/testimonials/${testimonialId}`, testimonialData)
  return data
}

export const deleteTestimonial = async (testimonialId) => {
  const { data } = await api.delete(`/api/admin/testimonials/${testimonialId}`)
  return data
}

export const reorderTestimonials = async (items) => {
  const { data } = await api.patch('/api/admin/testimonials/reorder', { items })
  return data
}

// ==================== Portfolio Management ====================

export const fetchPortfolios = async () => {
  const { data } = await api.get('/api/admin/portfolio')
  return data
}

export const createPortfolio = async (portfolioData) => {
  const { data } = await api.post('/api/admin/portfolio', portfolioData)
  return data
}

export const updatePortfolio = async (portfolioId, portfolioData) => {
  const { data } = await api.put(`/api/admin/portfolio/${portfolioId}`, portfolioData)
  return data
}

export const deletePortfolio = async (portfolioId) => {
  const { data } = await api.delete(`/api/admin/portfolio/${portfolioId}`)
  return data
}

export const reorderPortfolios = async (items) => {
  const { data } = await api.patch('/api/admin/portfolio/reorder', { items })
  return data
}

// ==================== Work Log Management (Admin) ====================

export const fetchWorkLogs = async ({ userId, startDate, endDate } = {}) => {
  const params = {}
  if (userId) params.user_id = userId
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const { data } = await api.get('/api/admin/staff/logs', { params })
  return data
}

// ==================== Staff Logs (Staff self) ====================

export const fetchMyLogs = async () => {
  const { data } = await api.get('/api/staff/logs/my')
  return data
}

export const fetchStaffMenu = async () => {
  const { data } = await api.get('/api/staff/menu')
  return data
}

export const createWorkLog = async (logData) => {
  const { data } = await api.post('/api/staff/logs', logData)
  return data
}
