import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import DOMPurify from 'dompurify'
import { fetchNewsById } from '../api/public'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function NewsDetail() {
  const { id } = useParams()

  const {
    data: news,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public', 'news', id],
    queryFn: () => fetchNewsById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })

  /* ── Loading ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <section className="section-padding bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-center text-stone-400 tracking-wide py-20">載入中…</p>
        </div>
      </section>
    )
  }

  /* ── Error / 404 ─────────────────────────────────────── */
  if (isError || !news) {
    return (
      <section className="section-padding bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6 text-center py-20">
          <h1 className="font-serif text-2xl text-secondary mb-4">找不到此篇消息</h1>
          <Link
            to="/news"
            className="text-gold text-sm tracking-widest uppercase hover:underline underline-offset-4"
          >
            返回消息列表
          </Link>
        </div>
      </section>
    )
  }

  /* ── Content ─────────────────────────────────────────── */
  return (
    <section className="section-padding bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 text-xs text-stone-400 mb-10 md:mb-14 flex-wrap"
        >
          <Link to="/" className="hover:text-gold transition-colors">首頁</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/news" className="hover:text-gold transition-colors">最新消息</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-secondary line-clamp-1">{news.title}</span>
        </motion.nav>

        {/* Cover image */}
        {news.cover_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-10 md:mb-14 overflow-hidden rounded-lg"
          >
            <img
              src={news.cover_image}
              alt={news.title}
              className="w-full aspect-video object-cover"
            />
          </motion.div>
        )}

        {/* Meta: date + category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-4 mb-4"
        >
          <time className="font-serif text-sm text-gold tracking-wide">
            {formatDate(news.date)}
          </time>
          {news.category && (
            <span className="text-[11px] text-gold border border-gold/30 rounded-full px-3 py-0.5 leading-none">
              {news.category}
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="font-serif text-2xl md:text-3xl lg:text-4xl text-secondary tracking-wider leading-snug mb-10 md:mb-14"
        >
          {news.title}
        </motion.h1>

        {/* Divider */}
        <span className="block w-12 h-px bg-gold/40 mb-10 md:mb-14" />

        {/* Article content — HTML rendered */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-stone prose-lg max-w-none
                     prose-headings:font-serif prose-headings:text-secondary
                     prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
        />

        {/* Bottom back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-16 md:mt-20 pt-8 border-t border-stone-200 text-center"
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm text-gold tracking-widest uppercase
                       hover:underline underline-offset-4 transition-colors duration-200"
          >
            ← 返回消息列表
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
