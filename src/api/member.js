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
