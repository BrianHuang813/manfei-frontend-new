import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import { fetchServicesByCategory } from '../api/public'

const LINE_URL = import.meta.env.VITE_LINE_URL || 'https://line.me/R/ti/p/PLACEHOLDER'

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

/* ── Asymmetric service card (alternating left/right) ────── */
function ServiceCard({ service, index, mirror }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={cardVariants}
      className={`grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center ${
        mirror ? '' : 'md:[direction:rtl]'
      }`}
    >
      {/* Image — 3/5 width */}
      <div className="md:col-span-3 md:[direction:ltr]">
        <div className="overflow-hidden rounded-2xl shadow-sm group">
          <img
            src={service.image_url || '/images/hero-background.jpg'}
            alt={service.name}
            loading="lazy"
            className="w-full aspect-[4/3] object-cover transition-all duration-700
                       grayscale-[15%] sepia-[8%] brightness-[0.97]
                       group-hover:grayscale-0 group-hover:sepia-0
                       group-hover:brightness-100 group-hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Info — 2/5 width */}
      <div className="md:col-span-2 md:[direction:ltr] space-y-4">
        {service.category && (
          <span className="inline-block text-gold text-xs tracking-[0.3em] uppercase">
            {service.category}
          </span>
        )}
        <h3 className="font-serif text-2xl md:text-3xl text-secondary tracking-wider leading-snug">
          {service.name}
        </h3>

        {/* Meta: duration + price */}
        <div className="flex flex-wrap gap-4 text-secondary/50 text-sm">
          {service.duration_min && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-gold/60" />
              {service.duration_min} 分鐘
            </span>
          )}
          {service.price && (
            <span className="font-serif text-gold tracking-wide">
              NT$ {service.price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="h-px bg-stone-200/60" />

        {service.description && (
          <p className="text-secondary/60 text-sm leading-relaxed whitespace-pre-line">
            {service.description}
          </p>
        )}

        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gold text-sm tracking-wide
                     hover:text-gold-dark transition-colors duration-300 pt-2"
        >
          <Sparkles size={14} />
          立即預約
        </a>
      </div>
    </motion.div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Services() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['public', 'services-by-category'],
    queryFn: fetchServicesByCategory,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <section className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="/images/hero-background.jpg"
          alt="Services"
          className="absolute inset-0 w-full h-full object-cover
                     grayscale-[20%] sepia-[10%] brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />
        <div className="relative h-full flex flex-col justify-end pb-12 md:pb-16 container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="block w-10 h-px bg-gold-light" />
              <span className="text-gold-light text-xs tracking-[0.3em] uppercase">
                All Services
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-white tracking-wider">
              全部療程
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base max-w-md tracking-wide">
              以專業手技與頂級產品，打造屬於您的美學體驗。
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom section-padding">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-secondary/50 text-sm tracking-wide
                       hover:text-gold transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            返回首頁
          </Link>
        </motion.div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-16">
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid grid-cols-1 md:grid-cols-5 gap-10">
                <div className="md:col-span-3 aspect-[4/3] bg-stone-200 rounded-2xl animate-pulse" />
                <div className="md:col-span-2 space-y-4">
                  <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
                  <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category sections */}
        {categories &&
          Object.entries(categories).map(([category, services], catIdx) => (
            <div key={category} className={catIdx > 0 ? 'mt-20 md:mt-28' : ''}>
              {/* Category header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12 md:mb-16"
              >
                <div className="flex items-center gap-4 mb-3">
                  <span className="block w-8 h-px bg-gold/60" />
                  <span className="text-gold/70 text-xs tracking-[0.2em] uppercase">
                    {category}
                  </span>
                </div>
                <div className="h-px bg-stone-200/80" />
              </motion.div>

              {/* Alternating left/right cards */}
              <div className="space-y-16 md:space-y-24">
                {services.map((service, i) => (
                  <ServiceCard
                    key={service.id || i}
                    service={service}
                    index={i}
                    mirror={i % 2 === 0}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}
