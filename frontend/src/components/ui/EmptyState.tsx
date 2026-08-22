import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-background/50 border border-border/50 rounded-2xl border-dashed"
    >
      <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button variant="outline" className="rounded-xl">
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <Button variant="outline" className="rounded-xl" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
