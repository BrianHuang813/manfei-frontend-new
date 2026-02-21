import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Package } from 'lucide-react'
import { fetchProductById } from '../api/public'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function ProductDetail() {
  const { id } = useParams()
  const settings = useSiteSettings()

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['public', 'product', id],
    queryFn: () => fetchProductById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })

  /* ── Loading skeleton ───────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="aspect-square bg-stone-200 rounded-2xl animate-pulse" />
            <div className="space-y-6 py-4">
              <div className="h-4 w-24 bg-stone-200 rounded animate-pulse" />
              <div className="h-8 w-64 bg-stone-200 rounded animate-pulse" />
              <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
              <div className="h-px bg-stone-200" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-stone-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Error / Not Found ──────────────────────────────────── */
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <Package size={48} className="mx-auto text-stone-300" />
          <h2 className="font-serif text-2xl text-secondary">找不到此產品</h2>
          <p className="text-secondary/50 text-sm">該產品可能已下架或不存在。</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-[0.2em]
                       transition-all duration-300 hover:bg-gold hover:text-white"
          >
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  /* ── Main content ───────────────────────────────────────── */
  return (
    <section className="min-h-screen bg-background section-padding">
      <div className="container-custom">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
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

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <img
                src={product.image_url || '/images/hero-background.jpg'}
                alt={product.name}
                className="w-full aspect-square object-cover
                           grayscale-[20%] sepia-[10%] brightness-95 contrast-[90%]
                           hover:grayscale-0 hover:sepia-0 hover:brightness-100
                           transition-all duration-700"
              />
            </div>
          </motion.div>

          {/* Right — Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="py-2 lg:py-4 space-y-6"
          >
            {/* Category tag */}
            {product.category && (
              <span className="inline-block text-gold text-xs tracking-[0.3em] uppercase">
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-serif text-2xl text-gold tracking-wide">
              NT$ {product.price?.toLocaleString()}
            </p>

            <div className="h-px bg-stone-200" />

            {/* Spec */}
            {product.spec && (
              <div>
                <h3 className="text-xs text-secondary/40 tracking-[0.2em] uppercase mb-2">
                  規格
                </h3>
                <p className="text-secondary/70 text-sm leading-relaxed">
                  {product.spec}
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-xs text-secondary/40 tracking-[0.2em] uppercase mb-2">
                  產品介紹
                </h3>
                <p className="text-secondary/70 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={settings.line_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-gold text-white rounded-full text-sm tracking-[0.2em]
                           transition-all duration-300 hover:bg-gold-dark"
              >
                LINE 諮詢購買
              </a>
              <Link
                to="/"
                className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-[0.2em]
                           transition-all duration-300 hover:bg-gold hover:text-white"
              >
                瀏覽更多產品
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
