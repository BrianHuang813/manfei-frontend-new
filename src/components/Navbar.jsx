import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, MapPin } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

/* Inline SVG social icons (lucide-react has no brand icons) */
const FacebookIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const navLinks = [
  { label: '關於嫚霏', href: '/about', isRoute: true },
  { label: '最新消息', href: '/news', isRoute: true },
  { label: '頂級療程', href: '/services', isRoute: true },
  { label: '居家產品', href: '/brands' , isRoute: true },
  { label: '聯絡我們', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const settings = useSiteSettings()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close mobile menu on ESC key
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeMobile() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeMobile])

  const handleNavClick = (e, link) => {
    e.preventDefault()
    setMobileOpen(false)

    if (link.isRoute) {
      navigate(link.href)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Hash anchor — if on home page, scroll; otherwise navigate home first
    const el = document.querySelector(link.href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        const target = document.querySelector(link.href)
        if (target) target.scrollIntoView({ behavior: 'smooth' })
      }, 400)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="container-custom flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className={cn(
              'font-serif text-2xl md:text-3xl tracking-widest transition-colors duration-300',
              scrolled ? 'text-secondary' : 'text-white'
            )}
          >
            {(settings.site_name || '嫚霏').replace(/\s*SPA$/i, '')}
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  'text-sm tracking-wide transition-colors duration-300 hover:text-gold',
                  scrolled ? 'text-secondary/80' : 'text-white/90'
                )}
              >
                {link.label}
              </a>
            ))}

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm tracking-wider border rounded-full transition-all duration-300',
                    scrolled
                      ? 'border-gold text-gold hover:bg-gold hover:text-white'
                      : 'border-white/70 text-white hover:bg-white hover:text-secondary'
                  )}
                >
                  <User size={16} />
                  <span>{user?.display_name || user?.line_display_name || '會員'}</span>
                </button>
                {/* Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                    >
                      {/* Member Center — visible to all logged-in users */}
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/member') }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                      >
                        會員中心
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/admin') }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                        >
                          管理後台
                        </button>
                      )}
                      {(user?.role === 'staff' || user?.role === 'admin') && (
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/staff') }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                        >
                          員工頁面
                        </button>
                      )}
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); navigate('/') }}
                        className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition-colors font-sans flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        登出
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'flex items-center gap-2 px-5 py-2 text-sm tracking-wider border rounded-full transition-all duration-300',
                  scrolled
                    ? 'border-gold text-gold hover:bg-gold hover:text-white'
                    : 'border-white/70 text-white hover:bg-white hover:text-secondary'
                )}
              >
                <User size={16} />
                會員登入
              </Link>
            )}

            <a
              href={settings.line_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'px-5 py-2 text-sm tracking-wider border rounded-full transition-all duration-300',
                scrolled
                  ? 'border-gold text-gold hover:bg-gold hover:text-white'
                  : 'border-white/70 text-white hover:bg-white hover:text-secondary'
              )}
            >
              立即預約
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              'lg:hidden p-2 transition-colors',
              scrolled ? 'text-secondary' : 'text-white'
            )}
            aria-label="開啟選單"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu — Full-Screen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={closeMobile}
              className="absolute top-5 right-5 p-2 text-secondary hover:text-gold transition-colors z-10"
              aria-label="關閉選單"
            >
              <X size={28} />
            </button>

            {/* Nav items — centered */}
            <div className="flex-1 flex flex-col items-center justify-center gap-7">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                  className="font-serif text-2xl text-secondary tracking-widest hover:text-gold transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Auth link */}
              {isAuthenticated ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + navLinks.length * 0.1, duration: 0.4 }}
                  >
                    <Link
                      to="/member"
                      onClick={closeMobile}
                      className="font-serif text-2xl text-secondary tracking-widest hover:text-gold transition-colors flex items-center gap-3"
                    >
                      <User size={22} />
                      會員中心
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={() => { closeMobile(); logout(); navigate('/') }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (navLinks.length + 1) * 0.1, duration: 0.4 }}
                    className="font-serif text-2xl text-secondary tracking-widest hover:text-gold transition-colors flex items-center gap-3"
                  >
                    <LogOut size={22} />
                    登出
                  </motion.button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + navLinks.length * 0.1, duration: 0.4 }}
                >
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="font-serif text-2xl text-secondary tracking-widest hover:text-gold transition-colors flex items-center gap-3"
                  >
                    <User size={22} />
                    會員登入
                  </Link>
                </motion.div>
              )}

              {/* 立即預約 CTA */}
              <motion.a
                href={settings.line_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (navLinks.length + (isAuthenticated ? 2 : 1)) * 0.1, duration: 0.4 }}
                className="mt-2 px-8 py-3 border border-gold text-gold rounded-full text-lg tracking-wider hover:bg-gold hover:text-white transition-all"
              >
                立即預約
              </motion.a>
            </div>

            {/* Footer — Social + Address */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="pb-10 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-5">
                <a
                  href={settings.facebook_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-secondary/40 hover:text-gold transition-colors"
                >
                  <FacebookIcon size={20} />
                </a>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-secondary/40 tracking-wide">
                <MapPin size={14} className="shrink-0" />
                {settings.address}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
