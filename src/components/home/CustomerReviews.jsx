import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/* ── Star rating row ─────────────────────────────────────── */
function Stars({ rating }) {
  if (!rating) return null
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i < rating ? 'fill-gold text-gold' : 'fill-stone-200 text-stone-200',
          )}
        />
      ))}
    </div>
  )
}

/* ── Slide animation variants ────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
}

/* ── Main Component — Single Review Rotator ──────────────── */
export default function CustomerReviews({ reviews = [] }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next) => {
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }, [index])

  const next = useCallback(() => {
    setDirection(1)
    setIndex((prev) => (prev + 1) % reviews.length)
  }, [reviews.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }, [reviews.length])

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (paused || reviews.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [paused, next, reviews.length])

  if (!reviews || reviews.length === 0) return null

  const current = reviews[index]

  return (
    <section id="customer-reviews" className="section-padding bg-background">
      <div className="container-custom">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="block w-10 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Guestbook</span>
            <span className="block w-10 h-px bg-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
            顧客好評
          </h2>
          <p className="mt-4 text-secondary/50 text-sm md:text-base max-w-lg mx-auto tracking-wide">
            每一則真摯的回饋，都是我們持續追求卓越的動力。
          </p>
        </motion.div>

        {/* Single review — centered rotator */}
        <div
          className="relative max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Large decorative quote */}
          <span
            className="block font-serif text-[6rem] md:text-[8rem] leading-none
                       text-gold/15 select-none text-center -mb-10 md:-mb-14"
            aria-hidden="true"
          >
            ❝
          </span>

          {/* Animated review */}
          <div className="relative min-h-[220px] md:min-h-[200px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id || index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center px-4"
              >
                {/* Quote text */}
                <blockquote className="font-serif text-secondary/80 text-lg sm:text-xl md:text-2xl
                                       leading-relaxed md:leading-relaxed italic tracking-wide">
                  「{current.content}」
                </blockquote>

                {/* Customer info */}
                <div className="mt-8 flex items-center justify-center gap-3">
                  {current.avatar_url ? (
                    <img
                      src={current.avatar_url}
                      alt={current.customer_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold text-sm font-medium">
                        {current.customer_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm text-secondary/70 tracking-wide">
                      {current.customer_name}
                    </p>
                    <Stars rating={current.rating} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows + dots */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-6 mt-10">
              <button
                onClick={prev}
                aria-label="上一則評論"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center
                           text-gold/60 hover:text-gold hover:border-gold transition-colors duration-300"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`第 ${i + 1} 則評論`}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      i === index ? 'bg-gold w-6' : 'bg-gold/25 hover:bg-gold/50 w-2',
                    )}
                  />
                ))}
              </div>

              <button
                onClick={next}
                aria-label="下一則評論"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center
                           text-gold/60 hover:text-gold hover:border-gold transition-colors duration-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
