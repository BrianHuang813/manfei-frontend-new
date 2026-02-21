import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { fetchNews } from '../api/public'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function News() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ['public', 'news', 'all'],
    queryFn: () => fetchNews(50),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <section className="section-padding bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 text-xs text-stone-400 mb-10 md:mb-14"
        >
          <Link to="/" className="hover:text-gold transition-colors">首頁</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-secondary">最新消息</span>
        </motion.nav>

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 md:mb-20 text-center"
        >
          <span className="text-gold text-xs tracking-[0.3em] uppercase">News</span>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl text-secondary tracking-wider">
            全部消息
          </h1>
          <span className="block mx-auto mt-4 w-12 h-px bg-gold/60" />
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <p className="text-center text-stone-400 tracking-wide">載入中…</p>
        )}

        {/* Empty state */}
        {!isLoading && news.length === 0 && (
          <p className="text-center text-stone-400 tracking-wide">目前沒有最新消息。</p>
        )}

        {/* News list */}
        <div>
          {news.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={`/news/${item.id}`}
                className="group flex items-center gap-5 md:gap-8 py-6 border-b border-stone-200
                           transition-colors duration-200 hover:bg-stone-50/60"
              >
                {/* Date */}
                <time className="font-serif text-sm text-gold w-24 md:w-28 shrink-0 tracking-wide">
                  {formatDate(item.date)}
                </time>

                {/* Title + excerpt */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-sans text-secondary text-base md:text-lg font-medium tracking-wide
                                   line-clamp-1 transition-colors duration-200 group-hover:text-gold">
                      {item.title}
                    </h2>
                    {item.category && (
                      <span className="hidden md:inline-block text-[11px] text-gold border border-gold/30
                                       rounded-full px-3 py-0.5 leading-none shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.content && (
                    <p className="text-sm text-stone-400 line-clamp-1 leading-relaxed">
                      {item.content.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={16}
                  className="text-gold/40 shrink-0 transition-all duration-300
                             group-hover:text-gold group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
