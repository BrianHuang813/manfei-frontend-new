import { motion } from 'framer-motion'

// LINE_URL now provided via SiteSettingsContext (used downstream)

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.6 + i * 0.2, duration: 0.8, ease: 'easeOut' },
  }),
}

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image with Ken Burns zoom */}
      <motion.img
        src="/images/hero-background.jpg"
        alt="嫚霏美容空間"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 10, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center container-custom">
        <div className="max-w-2xl">
          {/* Sub-label */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="flex items-center gap-3 mb-6"
          >
            <span className="block w-12 h-px bg-gold" />
            <span className="text-white/80 text-sm tracking-[0.3em] uppercase">
              Manfei Beauty
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-wider"
          >
            找回肌膚
            <br />
            <span className="text-gold-light">原本的光采</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="mt-6 text-white/70 text-base md:text-lg tracking-wide leading-relaxed max-w-md"
          >
            專業德系護膚，以科學為基底，為您重建肌膚健康與自信。
          </motion.p>

          {/* CTA Button */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-[0.3em]">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="block w-px h-8 bg-white/30"
        />
      </motion.div>
    </section>
  )
}
