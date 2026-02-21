import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

function ProductCard({ product, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={cardVariants}
    >
      <Link
        to={`/products/${product.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm
                   hover:shadow-md transition-shadow duration-500"
      >
        {/* Image */}
        <div className="overflow-hidden">
          <img
            src={product.image_url || '/images/hero-background.jpg'}
            alt={product.name}
            loading="lazy"
            className="w-full aspect-[4/3] object-cover transition-transform duration-700
                       group-hover:scale-105"
          />
        </div>

        {/* Text */}
        <div className="p-4 space-y-1.5">
          {product.category && (
            <span className="text-[11px] text-secondary/40 tracking-[0.15em] uppercase">
              {product.category}
            </span>
          )}
          <h3 className="font-serif text-secondary text-base tracking-wide leading-snug
                         transition-colors duration-300 group-hover:text-gold line-clamp-1">
            {product.name}
          </h3>
          {product.price > 0 && (
            <p className="text-gold text-sm tracking-wide">
              NT$ {product.price.toLocaleString()}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default function HomeProducts({ products = [] }) {
  if (products.length === 0) return null

  const displayProducts = products.slice(0, 6)

  return (
    <section id="products" className="section-padding bg-white">
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
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Home Care</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
            精選產品
          </h2>
          <p className="mt-4 text-secondary/50 text-sm md:text-base max-w-lg tracking-wide">
            將專業級護膚帶入日常，每一瓶都是美麗的延續。
          </p>
        </motion.div>

        {/* ── Horizontal scroll (all screens) ─────────────── */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {displayProducts.map((product, i) => (
            <div
              key={product.id}
              className="snap-center shrink-0 w-[260px] md:w-[300px]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        {/* Scroll hint (mobile) */}
        <div className="md:hidden mt-4 text-center">
          <span className="text-secondary/30 text-xs tracking-[0.2em]">← 滑動瀏覽 →</span>
        </div>
      </div>
    </section>
  )
}
