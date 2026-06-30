import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  CheckCircle,
  Bell,
  Award,
  Activity,
  Flame,
  ShieldCheck,
  Mail,
  Phone,
  Edit2,
  CalendarDays,
  Target,
  Smartphone,
  Monitor,
  Download,
  X,
  Camera,
} from 'lucide-react'
import PageTransition from '@/components/PageTransition'

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

const GaugeChart = ({ score }: { score: number }) => {
  const radius = 60
  const circumference = Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    // Animate in
    setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference)
    }, 300)
  }, [score, circumference])

  return (
    <div className="relative flex items-end justify-center w-48 h-24 overflow-hidden mx-auto mb-6 pt-4">
      <svg className="absolute w-48 h-48 -bottom-24" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" />
            <stop offset="100%" stopColor="var(--color-secondary, #8b5cf6)" />
          </linearGradient>
        </defs>
        <path
          d="M 20 140 A 60 60 0 0 1 140 140"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-primary/10"
          strokeLinecap="round"
        />
        <path
          d="M 20 140 A 60 60 0 0 1 140 140"
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center pb-2">
        <div className="text-4xl font-black text-primary leading-none">{score}</div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  })

  const stats = {
    communities_impacted: 12,
    reports_submitted: 15,
    resolved_reports: 11,
    streak_days: 14,
    trust_score: 94,
    join_date: 'Oct 2024',
  }

  const badges = [
    { icon: <Flame className="text-orange-500" />, name: 'Active Hero', desc: '14-day streak' },
    { icon: <Target className="text-red-500" />, name: 'Eagle Eye', desc: 'Top reporter in zone' },
    {
      icon: <CheckCircle className="text-green-500" />,
      name: 'Trusted',
      desc: 'High accuracy rate',
    },
    { icon: <Award className="text-primary" />, name: 'Civic Leader', desc: 'Top 5% of citizens' },
  ]

  const timeline = [
    {
      date: 'Today, 09:41 AM',
      title: 'Pothole Fixed',
      desc: 'Your report #241 was resolved.',
      type: 'success',
    },
    {
      date: 'Yesterday, 14:30 PM',
      title: 'New Badge Earned',
      desc: 'You unlocked "Active Hero".',
      type: 'info',
    },
    {
      date: 'Oct 15, 2024',
      title: 'Streetlight Reported',
      desc: 'Report submitted successfully.',
      type: 'default',
    },
  ]

  return (
    <PageTransition>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-sm sticky top-0 z-30"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user?.full_name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                <ShieldCheck size={16} className="text-primary" /> {user?.role}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20"
          >
            <Edit2 size={16} /> Edit Profile
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 space-y-6"
          >
            <Card className="overflow-hidden bg-background border border-border">
              <CardHeader className="bg-accent/30 pb-4 border-b border-border">
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                      Email
                    </div>
                    <div className="text-sm font-medium">{user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                      Phone
                    </div>
                    <div className="text-sm font-medium">{formData.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                      Joined
                    </div>
                    <div className="text-sm font-medium">{stats.join_date}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-primary scale-150">
                <Activity size={100} />
              </div>
              <CardContent className="p-8 text-center relative z-10">
                <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                  <ShieldCheck className="text-primary" /> Trust Score
                </h3>

                <GaugeChart score={stats.trust_score} />

                <p className="text-sm font-medium text-foreground">Excellent Standing</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Top 5% of active citizens in your area.
                </p>
              </CardContent>
            </Card>

            {/* Mock Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-accent/30 hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      <Bell size={18} />
                    </div>
                    <span className="text-sm font-medium">Notifications</span>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">
                    Enabled
                  </span>
                </button>
                <button
                  aria-label="Devices"
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-accent/30 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <span className="text-sm font-medium">Devices</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 Active</span>
                </button>
                <button
                  aria-label="Theme Preferences"
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-accent/30 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      <Monitor size={18} />
                    </div>
                    <span className="text-sm font-medium">Theme Preferences</span>
                  </div>
                </button>
                <Button
                  variant="outline"
                  className="w-full gap-2 mt-4 text-xs font-semibold rounded-xl"
                >
                  <Download size={14} /> Export My Data
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Impact & Stats */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="md:col-span-2 space-y-8"
          >
            {/* Storytelling Impact */}
            <div>
              <h2 className="text-xl font-bold mb-4">My Impact Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  variants={item}
                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <MapPin size={48} className="text-blue-500" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3">
                    <MapPin size={24} />
                  </div>
                  <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                    {stats.communities_impacted}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    Communities
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Activity size={48} className="text-orange-500" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-3">
                    <Activity size={24} />
                  </div>
                  <span className="text-4xl font-black text-orange-600 dark:text-orange-400">
                    {stats.reports_submitted}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    Reports
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <CheckCircle size={48} className="text-green-500" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-3">
                    <CheckCircle size={24} />
                  </div>
                  <span className="text-4xl font-black text-green-600 dark:text-green-400">
                    {stats.resolved_reports}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    Resolved
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Flame size={48} className="text-red-500" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-3">
                    <Flame size={24} />
                  </div>
                  <span className="text-4xl font-black text-red-600 dark:text-red-400">
                    {stats.streak_days}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    Day Streak
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Badges */}
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-accent/30">
                <CardTitle className="text-lg">Badges & Achievements</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {badges.map((badge, idx) => (
                    <motion.div
                      key={idx}
                      variants={item}
                      className="p-5 rounded-2xl border border-border bg-background shadow-sm flex flex-col items-center text-center hover:shadow-md hover:border-primary/50 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {badge.icon}
                      </div>
                      <span className="font-bold text-sm mb-1">{badge.name}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {badge.desc}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-accent/30 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {timeline.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={container}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-accent text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        {item.type === 'success' ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : item.type === 'info' ? (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        ) : (
                          <Activity size={16} />
                        )}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/50 transition-all group-hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">{item.title}</span>
                          <span className="text-xs text-muted-foreground font-semibold bg-accent px-2 py-1 rounded-md">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contribution Heatmap (Mock) */}
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-accent/30">
                <CardTitle className="text-lg">Contribution Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {[...Array(140)].map((_, i) => {
                    const activityLevel = Math.random()
                    const color =
                      activityLevel > 0.8
                        ? 'bg-primary'
                        : activityLevel > 0.5
                          ? 'bg-primary/60'
                          : activityLevel > 0.2
                            ? 'bg-primary/30'
                            : 'bg-accent/50'
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.5, zIndex: 10 }}
                        className={`w-3.5 h-3.5 rounded-sm ${color} transition-colors cursor-pointer border border-border/10`}
                        title={`${Math.floor(activityLevel * 5)} contributions on this day`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-6 text-xs text-muted-foreground font-medium">
                  <span>Less</span>
                  <div className="w-3.5 h-3.5 rounded-sm bg-accent/50 border border-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-primary/30 border border-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-primary/60 border border-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-primary border border-border/10"></div>
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-accent/30 flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-center">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                      {formData.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-accent/50 border-transparent focus:border-primary focus:bg-background"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-accent/50 border-transparent focus:border-primary focus:bg-background"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-accent/50 border-transparent focus:border-primary focus:bg-background"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                    onClick={() => setIsEditing(false)}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
