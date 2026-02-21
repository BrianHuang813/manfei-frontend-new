import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function LatestNews({ news = [] }) {
  if (!news?.length) return null

  return (
    <section id="news" className="section-padding bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 md:mb-20 text-center"
        >
          <span className="text-gold text-xs tracking-[0.3em] uppercase">Latest News</span>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl text-secondary tracking-wider">
            最新消息
          </h2>
          <span className="block mx-auto mt-4 w-12 h-px bg-gold/60" />
        </motion.div>

        {/* News list — magazine index style */}
        <div>
          {news.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              variants={rowVariants}
            >
              <Link
                to={`/news/${item.id}`}
                className="group flex items-center gap-5 md:gap-8 py-6 border-b border-stone-200
                           transition-colors duration-200 hover:bg-stone-50/60"
              >
                {/* Date — serif, gold */}
                <time className="font-serif text-sm text-gold w-24 md:w-28 shrink-0 tracking-wide">
                  {formatDate(item.date)}
                </time>

                {/* Title — sans-serif, dark */}
                <h3 className="flex-1 font-sans text-secondary text-base md:text-lg font-medium tracking-wide
                               line-clamp-1 transition-colors duration-200 group-hover:text-gold">
                  {item.title}
                </h3>

                {/* Category badge + Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.category && (
                    <span className="hidden md:inline-block text-[11px] text-gold border border-gold/30
                                     rounded-full px-3 py-0.5 leading-none">
                      {item.category}
                    </span>
                  )}
                  <ArrowRight
                    size={16}
                    className="text-gold/40 transition-all duration-300
                               group-hover:text-gold group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm text-gold tracking-widest uppercase
                       hover:underline underline-offset-4 transition-colors duration-200"
          >
            查看全部消息
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
