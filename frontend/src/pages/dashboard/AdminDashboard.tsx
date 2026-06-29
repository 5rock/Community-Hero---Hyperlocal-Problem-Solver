import { useState, useEffect } from 'react'
import api from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Bot, TrendingUp, AlertTriangle, Users, Activity, Clock, ShieldCheck } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/Skeleton'

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [securityStats, setSecurityStats] = useState<any>(null)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api
        .get('/stats/')
        .then((res) => setStats(res.data))
        .catch(console.error),
      api
        .get('/admin/security-dashboard')
        .then((res) => setSecurityStats(res.data))
        .catch(console.error),
      api.get('/stats/ai-insights').catch(console.error),
    ]).finally(() => setIsLoading(false))
  }, [])

  const aiCategories = [
    { name: 'Road Issues', value: 42, color: '#0284c7' },
    { name: 'Garbage', value: 25, color: '#10b981' },
    { name: 'Water Leakage', value: 18, color: '#3b82f6' },
    { name: 'Electricity', value: 10, color: '#f59e0b' },
    { name: 'Others', value: 5, color: '#94a3b8' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-1/3" />
        <div className="grid md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Executive Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor city health, officer deployment, and AI-driven insights.
        </p>
      </motion.div>

      {/* Top Stats Layer */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Card hoverable className="h-full border-l-4 border-l-red-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Issues
              </CardTitle>
              <AlertTriangle size={16} className="text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-500">
                {stats?.cards?.critical_issues || 18}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full border-l-4 border-l-orange-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Officers Online
              </CardTitle>
              <Users size={16} className="text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-500">14</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full border-l-4 border-l-green-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Resolution
              </CardTitle>
              <Clock size={16} className="text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">
                2.4 <span className="text-lg">Days</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full border-l-4 border-l-primary">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Confidence
              </CardTitle>
              <Bot size={16} className="text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                96<span className="text-lg">%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* AI Dashboard Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Bot className="text-primary animate-pulse" /> Live AI Insights
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* AI Daily Report */}
          <Card className="md:col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">🤖 Today's AI Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {aiCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {aiCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-semibold">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Predictions */}
          <Card className="md:col-span-2 shadow-sm bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Activity size={18} /> Predictive Forecasting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-background p-4 rounded-xl shadow-sm border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={64} />
                </div>
                <h4 className="font-bold text-foreground mb-1">Weekend Surge Predicted</h4>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-primary">
                    Garbage complaints expected to rise by 35%
                  </span>{' '}
                  this weekend due to the downtown festival activity. Suggesting preemptive routing
                  for cleanup crews in Zone B.
                </p>
              </div>

              <div className="bg-background p-4 rounded-xl shadow-sm border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <AlertTriangle size={64} />
                </div>
                <h4 className="font-bold text-foreground mb-1">Infrastructure Warning</h4>
                <p className="text-muted-foreground">
                  AI analysis of recent water leakage reports indicates a high probability of a main
                  pipe burst in the North District within the next 7 days. Confidence level:{' '}
                  <span className="font-semibold text-red-500">88%</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Security Dashboard */}
      {securityStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <ShieldCheck className="text-secondary" /> System Health & Security
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Failed Logins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{securityStats.failed_logins}</div>
              </CardContent>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600">
                  Prompt Injections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{securityStats.prompt_injection_attempts}</div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{securityStats.active_sessions}</div>
              </CardContent>
            </Card>
            <Card className="border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600">Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{securityStats.risk_score}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  )
}
