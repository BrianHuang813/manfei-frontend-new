import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSiteSettings } from '../api/public'

const SiteSettingsContext = createContext({})

// Hardcoded fallbacks — used until API responds
const DEFAULTS = {
  site_name: '嫚霏 SPA',
  address: '嘉義市西區北港路 8 號',
  phone: '05-2273758',
  business_hours: '週一至週日 09:00 - 17:00',
  line_url: import.meta.env.VITE_LINE_URL || 'https://line.me/R/ti/p/PLACEHOLDER',
  facebook_url: 'https://www.facebook.com/profile.php?id=100057178131046',
  instagram_url: '',
  meta_title: '嫚霏 SPA | 專業美容護理',
  meta_description: '嫚霏 SPA - 專業美容護理服務',
  og_image: '',
}

export function SiteSettingsProvider({ children }) {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,   // consider fresh for 5 min
    gcTime: 30 * 60 * 1000,     // keep in cache 30 min
    refetchOnWindowFocus: false,
  })

  // Merge: API values override defaults (skip empty strings for social URLs)
  const settings = { ...DEFAULTS }
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        settings[key] = value
      }
    }
  }

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
