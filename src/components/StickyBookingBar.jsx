import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

/**
 * Mobile-only sticky "Book Now" bar fixed at the bottom.
 * Hides when the footer (#contact) is visible in viewport.
 * Positioned below the FloatingCTA chat icon (which is raised to bottom-[80px]).
 */
export default function StickyBookingBar() {
  const settings = useSiteSettings()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Delay initial appearance so it doesn't flash immediately on load
    const show = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(show)
  }, [])

  useEffect(() => {
    const footer = document.querySelector('#contact')
    if (!footer) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <a
            href={settings.line_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="立即預約 — LINE 諮詢"
            className="flex items-center justify-center h-14 w-full
                       bg-gold/95 backdrop-blur-sm
                       text-white font-sans text-sm tracking-[0.3em]
                       transition-colors duration-300 hover:bg-gold"
          >
            立即預約
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
