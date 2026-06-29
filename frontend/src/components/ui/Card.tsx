import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = false, children, ...props }, ref) => {
    const hoverProps = hoverable
      ? {
          whileHover: { y: -4, transition: { duration: 0.2 } },
          className: `rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:border-primary/30 transition-all ${className}`,
        }
      : {
          className: `rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`,
        }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...hoverProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

Card.displayName = 'Card'

export const CardHeader = ({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
}

export const CardTitle = ({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

export const CardContent = ({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}
