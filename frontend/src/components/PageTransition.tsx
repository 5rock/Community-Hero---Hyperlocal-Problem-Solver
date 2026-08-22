import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const variants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
}

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
