import { useState, useEffect } from 'react'
import api from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ClipboardList, ArrowRight, ShieldCheck, MapPin } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function OfficerDashboard() {
  const [issues, setIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get('/issues/assigned')
      .then((res) => setIssues(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="p-4 bg-primary/10 rounded-2xl">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Officer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and resolve your assigned community issues.
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Assigned Issues"
          description="You currently have no issues assigned to you. Enjoy your day!"
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {issues.map((issue) => (
            <motion.div variants={item} key={issue.id}>
              <Card
                hoverable
                className="h-full flex flex-col border-2 border-border/50 hover:border-primary/50 transition-colors bg-card shadow-sm hover:shadow-md"
              >
                <CardHeader className="pb-3 bg-accent/30 border-b border-border">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {issue.title}
                    </CardTitle>
                    <Badge
                      variant={issue.severity === 'Critical' ? 'destructive' : 'default'}
                      className="shrink-0"
                    >
                      {issue.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <MapPin size={12} />
                    <span className="truncate">
                      Lat: {issue.latitude?.toFixed(4) || 'N/A'}, Lng:{' '}
                      {issue.longitude?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-4">
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
                    {issue.description}
                  </p>
                  <Link to={`/dashboard/issues/${issue.id}`} className="mt-auto">
                    <button className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground py-2.5 rounded-xl font-semibold transition-all duration-300">
                      Update Progress <ArrowRight size={16} />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
