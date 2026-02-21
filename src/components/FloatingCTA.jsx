import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

/**
 * Mobile-only floating LINE CTA button (bottom-right).
 * Hides when the footer (#contact) is visible in viewport.
 */
export default function FloatingCTA() {
  const settings = useSiteSettings()
  const [visible, setVisible] = useState(true)

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
        <motion.a
          href={settings.line_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LINE 預約諮詢"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 block md:hidden
                     w-[50px] h-[50px] rounded-full bg-gold
                     flex items-center justify-center
                     shadow-lg hover:shadow-xl
                     transition-shadow duration-300"
        >
          <MessageCircle size={24} className="text-white" fill="white" strokeWidth={0} />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
