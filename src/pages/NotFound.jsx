import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background number */}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute select-none pointer-events-none font-serif text-[10rem] md:text-[16rem] leading-none text-gold/10"
        aria-hidden="true"
      >
        404
      </motion.span>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="font-serif text-7xl md:text-9xl text-gold tracking-widest">
          404
        </h1>
        <div className="w-12 h-px bg-gold/40 mx-auto my-6" />
        <p className="font-serif text-lg md:text-xl text-secondary/60 tracking-wide leading-relaxed max-w-md mx-auto">
          迷路了嗎？讓我們帶您回到放鬆的起點。
        </p>
        <Link
          to="/"
          className="inline-block mt-10 px-8 py-3 border border-gold text-gold text-sm tracking-wider rounded-full
                     transition-all duration-300 hover:bg-gold hover:text-white"
        >
          返回首頁
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
