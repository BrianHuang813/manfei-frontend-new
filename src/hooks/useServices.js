import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '../api/public'

/**
 * Group a flat service array by `category`.
 * Returns: [{ category, image_url, services: [...] }]
 * Sorted by the lowest sort_order found in each category.
 */
export function groupByCategory(flat = []) {
  const map = new Map()

  for (const svc of flat) {
    const key = svc.category || '其他'
    if (!map.has(key)) {
      map.set(key, {
        category: key,
        image_url: svc.image_url || '/images/hero-background.jpg',
        services: [],
      })
    }
    map.get(key).services.push(svc)
  }

  // Sort services inside each group by sort_order
  for (const group of map.values()) {
    group.services.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
  }

  // Sort groups by the lowest sort_order of their first service
  return Array.from(map.values()).sort(
    (a, b) => (a.services[0]?.sort_order ?? 999) - (b.services[0]?.sort_order ?? 999),
  )
}

/**
 * Custom hook – fetches the flat service list then exposes grouped data.
 * Uses the same queryKey as Home.jsx so React Query deduplicates the request.
 */
export default function useServices() {
  const query = useQuery({
    queryKey: ['public', 'services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  })

  const grouped = query.data ? groupByCategory(query.data) : []

  return {
    ...query,
    /** Flat array from backend */
    services: query.data ?? [],
    /** Grouped by category */
    grouped,
  }
}
