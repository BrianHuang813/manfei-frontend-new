import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useServices from '../../hooks/useServices'

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

function CategoryCard({ group, index }) {
  const first = group.services[0]
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={cardVariants}
    >
      <Link to="/services" className="group block">
        {/* Zen-filtered category image */}
        <div className="relative w-full aspect-[4/3] xl:aspect-[16/9] bg-[#A89070] overflow-hidden rounded-sm group shadow-sm">
          <img
            src={group.image_url}
            alt={group.category}
            loading="lazy"
            className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05] saturate-[0.85] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#A89070]/[0.1] pointer-events-none transition-opacity duration-700 group-hover:opacity-0"></div>
        </div>

        {/* Typography */}
        <div className="mt-5 space-y-2">
          <span className="text-[11px] text-gold/70 tracking-[0.2em] uppercase">
            {group.category}
          </span>
          <h3 className="font-serif text-xl md:text-2xl text-secondary tracking-wider leading-snug transition-colors duration-300 group-hover:text-gold">
            {first?.name}
          </h3>
          {first?.price != null && (
            <p className="font-serif text-gold/80 text-sm tracking-wide">
              NT$ {first.price.toLocaleString()}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default function ServicePreview() {
  const { grouped, isLoading } = useServices()

  // Take only the first 3 categories
  const preview = grouped.slice(0, 3)

  if (isLoading || preview.length === 0) return null

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-custom">
        {/* Section heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="mb-12 md:mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="block w-10 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Signature Services</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
            頂級療程
          </h2>
          <p className="mt-4 text-secondary/50 text-sm md:text-base max-w-lg tracking-wide">
            以專業手技與頂級產品，為每一寸肌膚量身訂製的美學體驗。
          </p>
        </motion.div>

        {/* 3-column grid — 1 featured service per category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-10">
          {preview.map((group, i) => (
            <CategoryCard key={group.category} group={group} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/services"
            className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-[0.2em] transition-all duration-300 hover:bg-gold hover:text-white"
          >
            探索所有療程
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
