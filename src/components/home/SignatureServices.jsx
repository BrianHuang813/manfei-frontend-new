import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

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

function ServiceColumn({ service, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={cardVariants}
    >
      <Link to="/services" className="group block">
        {/* Portrait image (3:4) */}
        <div className="overflow-hidden rounded-xl">
          <img
            src={service.image_url || '/images/hero-background.jpg'}
            alt={service.name}
            loading="lazy"
            className="w-full aspect-[3/4] object-cover transition-all duration-700
                       grayscale-[20%] sepia-[10%] brightness-95 contrast-[90%]
                       group-hover:grayscale-0 group-hover:sepia-0
                       group-hover:brightness-100 group-hover:contrast-100
                       group-hover:scale-[1.03]"
          />
        </div>

        {/* Typography */}
        <div className="mt-5 space-y-2">
          {service.category && (
            <span className="text-[11px] text-gold/70 tracking-[0.2em] uppercase">
              {service.category}
            </span>
          )}
          <h3 className="font-serif text-xl md:text-2xl text-secondary tracking-wider leading-snug
                         transition-colors duration-300 group-hover:text-gold">
            {service.name}
          </h3>
          {service.description && (
            <p className="font-sans text-secondary/50 text-sm leading-relaxed line-clamp-2">
              {service.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default function SignatureServices({ services = [] }) {
  if (services.length === 0) return null

  const featured = services.slice(0, 3)

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
            招牌療程
          </h2>
          <p className="mt-4 text-secondary/50 text-sm md:text-base max-w-lg tracking-wide">
            以專業手技與頂級產品，為每一寸肌膚量身訂製的美學體驗。
          </p>
        </motion.div>

        {/* ── Editorial Trio: 3-column grid ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {featured.map((service, i) => (
            <ServiceColumn key={service.id || i} service={service} index={i} />
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
            className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-[0.2em]
                       transition-all duration-300 hover:bg-gold hover:text-white"
          >
            探索所有療程
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
