import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

/* ── Static brand images for Bento grid ───────────────────── */
const staticCells = [
  {
    id: 'main',
    image: '/images/reviderm_body.jpg',
    title: 'REVIDERM',
    subtitle: '以科學的純粹，回應每一寸真實需求',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 'drgrandel',
    image: '/images/drgrandel.jpg',
    title: 'DR. GRANDEL',
    subtitle: '解碼你的獨家光澤方程式',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'innova',
    image: '/images/innova.png',
    title: 'INNOVA',
    subtitle: '以植研重啟妳的自信美學維度',
    span: 'md:col-span-1 md:row-span-1',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' },
  }),
}

function BentoCell({ cell, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={cardVariants}
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer',
        cell.span,
        cell.id === 'main' ? 'min-h-[400px] md:min-h-0' : 'min-h-[220px]'
      )}
    >
      <img
        src={cell.image}
        alt={cell.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[20%] sepia-[10%] brightness-95 contrast-[90%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <p className="text-white/60 text-xs tracking-[0.2em] uppercase mb-1 transition-colors duration-300 group-hover:text-gold-light">
          {cell.subtitle}
        </p>
        <h3 className="font-serif text-white text-lg md:text-xl tracking-wide transition-colors duration-300 group-hover:text-gold">
          {cell.title}
        </h3>
      </div>
    </motion.div>
  )
}

export default function FeaturedServices() {
  return (
    <section id="brands" className="section-padding bg-background">
      <div className="container-custom">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="block w-10 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Our Brands</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
            居家產品
          </h2>
          <p className="mt-4 text-secondary/50 text-sm md:text-base max-w-lg tracking-wide">
            嚴選歐洲頂級護膚品牌，為您帶來專業級居家保養體驗。
          </p>
        </motion.div>

        {/* ── Desktop: Bento Grid (brands only) ──────────── */}
        <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-4 md:gap-5 auto-rows-[220px]">
          {staticCells.map((cell, i) => (
            <BentoCell key={cell.id} cell={cell} index={i} />
          ))}
        </div>

        {/* ── Mobile: Horizontal scroll snap ────────────── */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4">
          {staticCells.map((cell, i) => (
            <div key={cell.id} className="snap-center shrink-0 w-[80vw]">
              <BentoCell cell={cell} index={i} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            to="/brands"
            className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-[0.2em]
                       transition-all duration-300 hover:bg-gold hover:text-white"
          >
            了解更多品牌
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
