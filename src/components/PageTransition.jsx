import { motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
}

/**
 * Wraps page content with a soft fade + scale transition.
 * Use inside <AnimatePresence mode="wait"> with a unique `key`.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}
