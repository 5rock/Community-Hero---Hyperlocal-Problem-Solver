import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Trophy, Medal, Star, Award } from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'

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

export default function Leaderboard() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'lifetime'>('lifetime')
  const [metric, setMetric] = useState<'points' | 'impact'>('points')
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    // We are mocking timeframe changes since the backend only supports points/impact currently.
    // In a real app we would pass both timeframe and metric to the API.
    api
      .get(`/stats/leaderboard/${metric}`)
      .then((res) => {
        // Mocking timeframe data variations for demonstration
        let data = res.data
        if (timeframe === 'weekly') {
          data = data.map((u: any) => ({
            ...u,
            points: Math.floor(u.points / 4),
            impact_score: Math.floor(u.impact_score / 4),
          }))
        } else if (timeframe === 'monthly') {
          data = data.map((u: any) => ({
            ...u,
            points: Math.floor(u.points / 2),
            impact_score: Math.floor(u.impact_score / 2),
          }))
        }
        setLeaderboard(data)
      })
      .catch(console.error)
  }, [timeframe, metric])

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Recognizing the top contributors in our community.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex bg-accent/50 p-1 rounded-lg">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'weekly' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('lifetime')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'lifetime' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Lifetime
            </button>
          </div>
          <div className="flex bg-accent/50 p-1 rounded-lg">
            <button
              onClick={() => setMetric('points')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${metric === 'points' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Points
            </button>
            <button
              onClick={() => setMetric('impact')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${metric === 'impact' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Impact
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-primary" size={20} /> Top Heroes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
              key={`${timeframe}-${metric}`} // Re-animate on timeframe/metric change
            >
              {leaderboard.map((lbUser, index) => (
                <motion.div
                  layout
                  variants={item}
                  whileHover={{ scale: 1.02, x: 5 }}
                  key={lbUser.id}
                  className="flex items-center p-4 rounded-xl border border-border bg-background hover:bg-accent/20 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-center w-8 font-bold text-lg text-muted-foreground mr-4">
                    {index === 0 && <Medal className="text-yellow-500 drop-shadow-md" size={28} />}
                    {index === 1 && <Medal className="text-gray-400 drop-shadow-md" size={24} />}
                    {index === 2 && <Medal className="text-amber-700 drop-shadow-md" size={24} />}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-4">
                    {lbUser.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{lbUser.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {lbUser.level} • {lbUser.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <motion.div
                      key={metric === 'impact' ? lbUser.impact_score : lbUser.points}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="font-bold text-lg text-primary"
                    >
                      {metric === 'impact' ? lbUser.impact_score : lbUser.points}
                    </motion.div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {metric === 'impact' ? 'impact' : 'pts'}
                    </div>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && (
                <EmptyState
                  icon={Trophy}
                  title="No Leaders Yet"
                  description="Be the first to make an impact and climb the leaderboard this week."
                />
              )}
            </motion.div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
            <motion.div
              className="absolute -right-12 -top-12 opacity-10 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <Star size={150} />
            </motion.div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} /> Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                  className="text-5xl font-black mb-2"
                >
                  {user?.points}
                </motion.div>
                <p className="text-primary-foreground/80 text-sm">Total Lifetime Points</p>
              </div>
              <div className="bg-background/20 rounded-lg p-4 mt-4">
                <div className="text-sm font-medium mb-1 flex justify-between">
                  <span>Trust Score</span>
                  <span className="font-bold">{user?.trust_score}/100</span>
                </div>
                <div className="w-full bg-background/30 rounded-full h-2 mb-2 mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${user?.trust_score || 0}%` }}
                    transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                    className="bg-background h-full rounded-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={20} /> Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <motion.li
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-2 hover:bg-accent rounded-md transition-colors cursor-default"
                >
                  <span>Report an issue</span>
                  <span className="font-bold text-green-500">+10 pts</span>
                </motion.li>
                <motion.li
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-2 hover:bg-accent rounded-md transition-colors cursor-default"
                >
                  <span>Verify a report</span>
                  <span className="font-bold text-green-500">+5 pts</span>
                </motion.li>
                <motion.li
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-2 hover:bg-accent rounded-md transition-colors cursor-default"
                >
                  <span>Issue gets resolved</span>
                  <span className="font-bold text-green-500">+20 pts</span>
                </motion.li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
