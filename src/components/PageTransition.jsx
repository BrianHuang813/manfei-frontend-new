import { motion, useReducedMotion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Wraps page content with a soft fade + scale transition.
 * Use inside <AnimatePresence mode="wait"> with a unique `key`.
 * Under reduced-motion the scale is dropped — the page still changes
 * visibly, it just doesn't move.
 */
export default function PageTransition({ children }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={reduceMotion ? reducedVariants : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
