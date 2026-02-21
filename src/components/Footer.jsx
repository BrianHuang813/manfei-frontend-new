import { motion } from 'framer-motion'
import { MapPin, Phone, Clock } from 'lucide-react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function Footer() {
  const settings = useSiteSettings()
  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* Background image */}
      <img
        src="/images/shop_cover.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Heavy overlay */}
      <div className="absolute inset-0 bg-[#2C3E50]/90" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container-custom py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

            {/* Col 1: Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-3xl text-white tracking-widest mb-4">{settings.site_name || '嫚霏 Spa'}</h3>
              <div className="w-10 h-px bg-gold mb-6" />
              <p className="text-white/60 text-sm leading-relaxed tracking-wide">
                以德系專業護膚為核心，秉持科學與自然兼容的理念，
                為每位顧客量身打造專屬的美膚方案。
                在嫚霏，您將體驗到極致的放鬆與蛻變。
              </p>
            </motion.div>

            {/* Col 2: Google Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="md:col-span-1"
            >
              <h4 className="text-white text-sm tracking-[0.2em] uppercase mb-6">門市位置</h4>
              <div className="rounded-lg overflow-hidden w-full aspect-[4/3]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.44161326554!2d120.4425709749667!3d23.48059797885543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346e942e6fdb97bd%3A0x4d792aa337166901!2z5aua6ZyPU1BB!5e0!3m2!1szh-TW!2stw!4v1749344810102!5m2!1szh-TW!2stw"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen=""
                  title="嫚霏SPA地圖位置"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </motion.div>

            {/* Col 3: Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-white text-sm tracking-[0.2em] uppercase mb-6">聯絡我們</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                  <span className="text-white/50 text-sm leading-relaxed">
                    {settings.address}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-gold shrink-0" />
                  <a
                    href={`tel:${settings.phone?.replace(/[^0-9+]/g, '')}`}
                    className="text-white/50 text-sm hover:text-gold transition-colors"
                  >
                    {settings.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="text-gold shrink-0 mt-0.5" />
                  <div className="text-white/50 text-sm leading-relaxed">
                    <p>{settings.business_hours}</p>
                  </div>
                </li>
              </ul>

              {/* LINE CTA */}
              <a
                href={settings.line_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-6 py-2.5 border border-gold/60 text-gold text-sm 
                           rounded-full tracking-wider transition-all duration-300
                           hover:bg-gold hover:text-white"
              >
                LINE 預約諮詢
              </a>
            </motion.div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/10">
          <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-xs tracking-wide">
              © {new Date().getFullYear()} {settings.site_name || '嫚霏美容'}. All rights reserved.
            </p>
            <a
              href={settings.facebook_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/30 hover:text-gold transition-colors duration-300"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
