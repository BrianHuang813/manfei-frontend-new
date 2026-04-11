/**
 * Extracts a human-readable message from an Axios error.
 * Handles FastAPI validation errors where `detail` is an array of objects.
 */
export function getErrorMessage(err, fallback = '操作失敗') {
  const detail = err?.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((e) => e.msg || String(e)).join('；')
  return fallback
}
