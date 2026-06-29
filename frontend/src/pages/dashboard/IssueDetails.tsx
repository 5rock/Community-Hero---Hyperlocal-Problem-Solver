import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import {
  Bot,
  MapPin,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertCircle,
  Maximize2,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function IssueDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issue, setIssue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  useEffect(() => {
    api
      .get(`/issues/${id}`)
      .then((res) => {
        setIssue(res.data)
      })
      .catch((err) => {
        console.error(err)
        navigate('/dashboard/map')
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  const handleVerify = async (confirm: boolean) => {
    try {
      await api.post(`/issues/${id}/verify`, {
        issue_id: parseInt(id as string),
        confirm: confirm,
        vote_urgency: 'Medium',
      })
      alert(`Issue ${confirm ? 'confirmed' : 'rejected'} successfully!`)
      // Refresh issue
      const res = await api.get(`/issues/${id}`)
      setIssue(res.data)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Verification failed')
    }
  }

  const handlePoll = async (status: string) => {
    try {
      await api.post(`/issues/${id}/poll`, { status })
      alert('Thank you for your feedback!')
      const res = await api.get(`/issues/${id}`)
      setIssue(res.data)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Poll submission failed')
    }
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  if (!issue) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{issue.category}</Badge>
            <Badge
              variant={issue.severity === 'Critical' ? 'destructive' : 'default'}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {issue.severity}
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              {issue.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-2 text-sm">
            <MapPin size={14} /> Lat: {issue.lat.toFixed(4)}, Lng: {issue.lng.toFixed(4)}
          </p>
        </div>
      </motion.div>

      {/* Vertical Animated Timeline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Issue Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:inset-0 before:ml-6 md:before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
              {[
                {
                  id: 'PENDING',
                  label: 'Reported',
                  desc: 'Issue has been successfully submitted.',
                  timestamp: new Date(issue.created_at).toLocaleDateString(),
                  actor: issue.reporter?.full_name || 'Citizen',
                },
                {
                  id: 'VERIFIED',
                  label: 'Verified',
                  desc: 'Community has confirmed the issue exists.',
                  timestamp: issue.status !== 'PENDING' ? '12 hours later' : null,
                  actor: 'Community Verifiers',
                },
                {
                  id: 'ASSIGNED',
                  label: 'Assigned',
                  desc: 'Forwarded to the relevant department.',
                  timestamp: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(
                    issue.status,
                  )
                    ? '1 day later'
                    : null,
                  actor: 'System AI',
                },
                {
                  id: 'IN_PROGRESS',
                  label: 'In Progress',
                  desc: 'Work has begun on resolving the issue.',
                  timestamp: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(issue.status)
                    ? '2 days later'
                    : null,
                  actor: 'Officer John Doe',
                },
                {
                  id: 'RESOLVED',
                  label: 'Resolved',
                  desc: 'Officer marked the issue as resolved.',
                  timestamp: ['RESOLVED', 'CLOSED'].includes(issue.status) ? '3 days later' : null,
                  actor: 'Officer John Doe',
                },
                {
                  id: 'CLOSED',
                  label: 'Closed',
                  desc: 'Reporter confirmed the resolution.',
                  timestamp: issue.status === 'CLOSED' ? '4 days later' : null,
                  actor: issue.reporter?.full_name || 'Citizen',
                },
              ].map((step, idx) => {
                const statusOrder = [
                  'PENDING',
                  'VERIFIED',
                  'ASSIGNED',
                  'IN_PROGRESS',
                  'RESOLVED',
                  'CLOSED',
                ]
                const currentIndex = statusOrder.indexOf(
                  issue.status === 'REOPENED'
                    ? 'PENDING'
                    : issue.status === 'REJECTED'
                      ? 'CLOSED'
                      : issue.status,
                )
                const isActive = idx === currentIndex
                const isPast = idx < currentIndex

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    key={step.id}
                    className="relative flex flex-col md:flex-row md:items-start justify-between group"
                  >
                    <div className="flex flex-col md:w-full">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`absolute -left-6 md:-left-8 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-colors -translate-x-1/2 bg-card
                          ${
                            isActive
                              ? 'border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] bg-primary/10'
                              : isPast
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted text-muted-foreground'
                          }`}
                        >
                          {isPast ? (
                            <CheckCircle size={14} className="md:w-4 md:h-4" />
                          ) : isActive ? (
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                          ) : (
                            <span className="text-[10px] md:text-xs font-bold">{idx + 1}</span>
                          )}
                        </motion.div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4">
                          <span
                            className={`font-bold text-sm md:text-base ${isActive ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {step.label}
                          </span>
                          {(isActive || isPast) && step.timestamp && (
                            <span className="text-xs font-medium text-muted-foreground/70 bg-accent px-2 py-0.5 rounded-full mt-1 sm:mt-0 w-fit">
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`mt-2 ml-4 md:ml-0 md:pl-[3.25rem] bg-accent/30 p-3 rounded-xl border border-border/50 ${isActive || isPast ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      >
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">{step.desc}</p>
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-background px-2 py-1 rounded-md border border-border w-fit shadow-sm">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] text-primary">
                            {step.actor.charAt(0)}
                          </div>
                          {step.actor}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="md:col-span-2 space-y-6">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{issue.description}</p>
                {issue.image_url && (
                  <div
                    className="relative mt-4 group cursor-pointer"
                    onClick={() => setIsImageExpanded(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsImageExpanded(true)
                      }
                    }}
                  >
                    <img
                      src={issue.image_url}
                      alt="Evidence"
                      className="rounded-xl max-h-64 object-cover w-full border border-border transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                      <Maximize2 className="text-white w-8 h-8" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {issue.ai_summary && (
            <motion.div variants={item}>
              <Card className="border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Bot size={20} /> AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="col-span-2">
                    <h4 className="font-semibold text-sm mb-1">Summary</h4>
                    <p className="text-sm">{issue.ai_summary}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-semibold text-sm mb-1">Suggested Resolution</h4>
                    <p className="text-sm">{issue.ai_suggested_resolution}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Est. Cost</h4>
                    <p className="text-sm font-medium">₹{issue.estimated_cost}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">
                      Repair Time
                    </h4>
                    <p className="text-sm font-medium">{issue.repair_time}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Department</h4>
                    <p className="text-sm font-medium">{issue.suggested_department}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">
                      Priority Score
                    </h4>
                    <p className="text-sm font-medium text-primary">{issue.priority_score}/100</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground mt-2 border-t border-border pt-4">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Confidence: <span className="font-bold">{issue.ai_confidence}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {issue.status === 'RESOLVED' && issue.reporter?.id === user?.id && (
            <motion.div variants={item}>
              <Card className="border-orange-500/50 bg-orange-500/5 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <AlertCircle size={18} /> Resolution Confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm font-medium">
                    The assigned officer has marked this issue as RESOLVED. Please confirm if the
                    work was completed satisfactorily.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handlePoll('YES')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Yes, fully resolved
                    </Button>
                    <Button
                      onClick={() => handlePoll('PARTIALLY')}
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                      Partially resolved
                    </Button>
                    <Button
                      onClick={() => handlePoll('NO')}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      No, it is still broken
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck size={18} /> Community Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you currently near this location? Help the community by verifying this report.
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleVerify(true)}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle size={16} /> Confirm Issue Exists
                  </Button>
                  <Button
                    onClick={() => handleVerify(false)}
                    variant="outline"
                    className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle size={16} /> Report as Fake/Resolved
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                  <span className="text-muted-foreground">Trust Score impact</span>
                  <span className="font-bold text-green-500">+5 pts</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reporter Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">
                    {issue.reporter?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-sm">
                      {issue.reporter?.full_name || 'Citizen'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reported on {new Date(issue.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setIsImageExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsImageExpanded(false)}
                className="absolute -top-12 right-0 p-2 text-white bg-black/50 rounded-full hover:bg-black transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={issue.image_url}
                alt="Evidence Full"
                className="w-full h-full object-contain rounded-xl shadow-2xl border border-border bg-black/5"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
