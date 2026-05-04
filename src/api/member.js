import api from './axios'

// ── Member API (authenticated user) ──────────────────────

/**
 * Fetch the current user's full profile.
 * @returns {Promise<Object>} User profile data
 */
export const fetchMyProfile = async () => {
  const { data } = await api.get('/api/auth/me')
  return data
}

/**
 * Fetch the current user's transaction / consumption history.
 * @param {Object} params - Optional pagination params
 * @param {number} params.skip - Offset
 * @param {number} params.limit - Max records
 * @returns {Promise<Array>} List of transactions
 */
export const fetchMyTransactions = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await api.get('/api/auth/me/transactions', {
    params: { skip, limit },
  })
  return data
}

/**
 * Update the current user's profile (display_name).
 * @param {Object} profileData - { display_name }
 * @returns {Promise<Object>} Updated user profile
 */
export const updateMyProfile = async (profileData) => {
  const { data } = await api.patch('/api/auth/me/profile', profileData)
  return data
}
