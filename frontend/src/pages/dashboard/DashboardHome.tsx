import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import {
  FileWarning,
  CheckCircle,
  AlertOctagon,
  Activity,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    api
      .get('/stats/')
      .then((res) => {
        setStats(res.data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899']

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {greeting}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        {user?.role === 'Citizen' && (
          <p className="text-lg text-muted-foreground mt-1 max-w-2xl">
            You have helped improve <span className="font-bold text-primary">12 communities</span>.
            2 reports are currently being reviewed, and 1 report was resolved yesterday.
          </p>
        )}
        {user?.role === 'Officer' && (
          <p className="text-lg text-muted-foreground mt-1 max-w-2xl">
            You have <span className="font-bold text-primary">3 critical assignments</span> today.
            Let's make the city safer.
          </p>
        )}
      </motion.div>

      {user?.role === 'Citizen' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex items-center justify-between shadow-sm"
        >
          <div>
            <h3 className="text-2xl font-bold text-primary">Today's Community Score</h3>
            <p className="text-muted-foreground">
              You are in the top 5% of active citizens this month!
            </p>
          </div>
          <div className="text-5xl font-black text-primary">
            94<span className="text-2xl text-primary/60">/100</span>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <Card hoverable className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Issues
              </CardTitle>
              <FileWarning size={16} className="text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <div className="text-3xl font-bold">{stats?.cards?.total_issues || 0}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Issues
              </CardTitle>
              <Activity size={16} className="text-secondary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <div className="text-3xl font-bold">{stats?.cards?.active_issues || 0}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Needs
              </CardTitle>
              <AlertOctagon size={16} className="text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <div className="text-3xl font-bold text-red-500">
                  {stats?.cards?.critical_issues || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                Resolved Issues
              </CardTitle>
              <CheckCircle size={16} className="text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-16 mt-1 mb-2 bg-green-500/20" />
                  <Skeleton className="h-4 w-24 bg-green-500/10" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats?.cards?.resolved_issues || 0}
                  </div>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> {stats?.cards?.resolution_rate || 0}% Resolution Rate
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="md:col-span-2">
          <Card hoverable className="h-full shadow-sm border-border">
            <CardHeader>
              <CardTitle>AI Insights & Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertOctagon size={64} />
                  </div>
                  <p className="font-bold text-primary mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Gemini AI Insight
                  </p>
                  <p className="text-muted-foreground relative z-10">
                    There has been a{' '}
                    <span className="font-semibold text-foreground">25% increase</span> in pothole
                    reports in the downtown area over the last 48 hours. Suggest prioritizing road
                    maintenance crews to this zone.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users size={64} />
                  </div>
                  <p className="font-bold text-secondary mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    Community Milestone
                  </p>
                  <p className="text-muted-foreground relative z-10">
                    Your neighborhood just crossed{' '}
                    <span className="font-semibold text-foreground">100 verified reports</span> this
                    week. The AI trust score system has increased accuracy by 40%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hoverable className="h-full shadow-sm border-border">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : stats?.distribution && stats.distribution.length > 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="h-[250px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.distribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-center text-muted-foreground gap-4 p-4">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2">
                    <MapPin size={32} className="text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No reports yet</p>
                    <p className="text-sm">Your first report can improve your community.</p>
                  </div>
                  {user?.role === 'Citizen' && (
                    <Link to="/dashboard/report">
                      <button className="mt-2 text-xs font-semibold bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
                        Report an Issue
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
