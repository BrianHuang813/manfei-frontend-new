import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

/* ── Case card — single merged before/after image ──────── */
function CaseCard({ item }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={itemVariants}
      className="mb-16 md:mb-24"
    >
      <div className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg
                      transition-shadow duration-700 bg-white">
        <div className="overflow-hidden">
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            className="w-full object-cover transition-transform duration-700
                       group-hover:scale-[1.015]"
          />
        </div>

        {/* Caption — elegant minimal bar */}
        {item.title && (
          <div className="px-5 py-4 md:px-6 md:py-5">
            <p className="font-serif text-secondary text-sm md:text-base tracking-wide">
              {item.title}
            </p>
            {item.category && (
              <p className="text-secondary/40 text-xs tracking-wider mt-1 uppercase">
                {item.category}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Main Component — "Sticky Journal" Layout ────────────── */
export default function Transformation({ cases = [] }) {
  if (!cases || cases.length === 0) return null

  return (
    <section id="transformation" className="section-padding bg-background">
      <div className="container-custom">
        <div className="md:grid md:grid-cols-3 md:gap-12 lg:gap-16">
          {/* ── Left: Sticky header (desktop) ──────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-0 md:col-span-1"
          >
            <div className="md:sticky md:top-32">
              <div className="flex items-center gap-4 mb-4">
                <span className="block w-10 h-px bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">
                  Transformation
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
                蛻變見證
              </h2>
              <p className="mt-4 text-secondary/50 text-sm md:text-base max-w-xs tracking-wide leading-relaxed">
                真實呈現每一次療程前後的對比，見證專業帶來的改變。
              </p>

              {/* Decorative line (desktop only) */}
              <div className="hidden md:block mt-8 w-12 h-px bg-gold/40" />
            </div>
          </motion.div>

          {/* ── Right: Scrollable image list ──────────── */}
          <div className="md:col-span-2">
            {cases.map((item, i) => (
              <CaseCard key={item.id || i} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
