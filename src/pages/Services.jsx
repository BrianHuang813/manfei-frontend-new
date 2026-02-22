import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import useServices from '../hooks/useServices'

/* ── Single service row ────────────────────────────────── */
function ServiceRow({ service }) {
  return (
    <div className="py-6 border-b border-stone-200/60 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        {/* Left: name + duration */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h4 className="font-serif text-lg md:text-xl text-secondary tracking-wider font-bold">
              {service.name}
            </h4>
            {service.duration != null && (
              <span className="flex items-center gap-1 text-secondary/40 text-xs whitespace-nowrap">
                <Clock size={12} className="text-gold/50" />
                {service.duration} mins
              </span>
            )}
          </div>
        </div>
        {/* Right: price */}
        {service.price != null && (
          <span className="font-serif text-gold tracking-wide text-sm md:text-base whitespace-nowrap">
            NT$ {service.price.toLocaleString()}
          </span>
        )}
      </div>
      {service.description && (
        <p className="mt-2 text-secondary/45 text-sm leading-relaxed">
          {service.description}
        </p>
      )}
    </div>
  )
}

/* ── Category section (sticky image + scrolling list) ──── */
function CategorySection({ group, index, settings }) {
  const isEven = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12"
    >
      {/* Image — sticky on desktop */}
      <div className={`w-full md:col-span-5 ${!isEven ? 'md:order-2' : ''}`}>
        {/* FIX: Removed h-full. Applied aspect-[4/3] or aspect-[16/9] to preserve landscape photos without cropping. */}
        <div className="relative sticky top-28 w-full aspect-[4/3] xl:aspect-[16/9] overflow-hidden rounded-sm group shadow-sm">
          <img
            src={group.image_url || '/images/hero-background.jpg'}
            alt={group.category}
            loading="lazy"
            className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05] saturate-[0.85] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#A89070]/[0.1] pointer-events-none transition-opacity duration-700 group-hover:opacity-0"></div>
        </div>
      </div>

      {/* Text / service list */}
      <div className={`w-full md:col-span-7 ${!isEven ? 'md:order-1' : ''}`}>
        {/* Category heading */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <span className="block w-8 h-px bg-gold/60" />
            <span className="text-gold/70 text-xs tracking-[0.2em] uppercase">
              {group.category}
            </span>
          </div>
          <div className="h-px bg-stone-200/80" />
        </div>

        {/* Service rows */}
        <div>
          {group.services.map((svc) => (
            <ServiceRow key={svc.id} service={svc} />
          ))}
        </div>

        {/* Book CTA */}
        <div className="mt-8">
          <a
            href={settings.line_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold text-sm tracking-wide hover:text-gold-dark transition-colors duration-300"
          >
            <Sparkles size={14} />
            立即預約
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Loading skeleton ──────────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-20">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-[40%] aspect-[3/4] bg-stone-200 rounded-sm animate-pulse" />
          <div className="w-full md:w-[60%] space-y-6 py-4">
            <div className="h-3 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="h-px bg-stone-100" />
            {[1, 2, 3].map((r) => (
              <div key={r} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-5 w-40 bg-stone-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-stone-200 rounded animate-pulse" />
                </div>
                <div className="h-3 w-full bg-stone-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Services() {
  const settings = useSiteSettings()
  const { grouped, isLoading } = useServices()

  return (
    <section className="min-h-screen bg-background">
      <Helmet>
        <title>療程總覽｜嫚霏美容 SPA</title>
        <meta
          name="description"
          content="探索嫚霏美容 SPA 全系列護膚療程：客製化做臉、無痛清粉刺、精油按摩與高科技抗老課程。"
        />
      </Helmet>

      {/* Hero banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="/images/hero-background.jpg"
          alt="Services"
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] sepia-[10%] brightness-[0.85]"
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
              <span className="text-gold-light text-xs tracking-[0.3em] uppercase">All Services</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-white tracking-wider">全部療程</h1>
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
            className="inline-flex items-center gap-2 text-secondary/50 text-sm tracking-wide hover:text-gold transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            返回首頁
          </Link>
        </motion.div>

        {/* Loading */}
        {isLoading && <Skeleton />}

        {/* Category sections — sticky image, alternating layout */}
        <div className="space-y-20 md:space-y-32">
          {grouped.map((group, idx) => (
            <CategorySection
              key={group.category}
              group={group}
              index={idx}
              settings={settings}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
