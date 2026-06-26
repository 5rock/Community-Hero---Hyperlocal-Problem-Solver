import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Trophy, Medal, Star, Award } from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function Leaderboard() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<'points' | 'impact'>('points')
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    api.get(`/stats/leaderboard/${timeframe}`).then(res => setLeaderboard(res.data)).catch(console.error)
  }, [timeframe])

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Recognizing the top contributors in our community.</p>
        </div>
        <div className="flex bg-accent/50 p-1 rounded-lg">
           <button 
             onClick={() => setTimeframe('points')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'points' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Lifetime Points
           </button>
           <button 
             onClick={() => setTimeframe('impact')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'impact' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Impact Score
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="text-primary" size={20}/> Top Heroes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((lbUser, index) => (
                <div key={lbUser.id} className="flex items-center p-4 rounded-xl border border-border bg-background hover:bg-accent/20 transition-colors">
                  <div className="flex items-center justify-center w-8 font-bold text-lg text-muted-foreground mr-4">
                    {index === 0 && <Medal className="text-yellow-500" size={28} />}
                    {index === 1 && <Medal className="text-gray-400" size={24} />}
                    {index === 2 && <Medal className="text-amber-700" size={24} />}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-4">
                    {lbUser.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{lbUser.name}</h4>
                    <p className="text-xs text-muted-foreground">{lbUser.level} • {lbUser.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">{timeframe === 'impact' ? lbUser.impact_score : lbUser.points}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{timeframe === 'impact' ? 'impact' : 'pts'}</div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && <div className="text-center text-muted-foreground py-8">No data available</div>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star size={20}/> Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center pb-4">
                <div className="text-5xl font-black mb-2">{user?.points}</div>
                <p className="text-primary-foreground/80 text-sm">Total Lifetime Points</p>
              </div>
              <div className="bg-background/20 rounded-lg p-4 mt-4">
                <div className="text-sm font-medium mb-1 flex justify-between">
                  <span>Trust Score</span>
                  <span className="font-bold">{user?.trust_score}/100</span>
                </div>
                <div className="w-full bg-background/30 rounded-full h-2 mb-2 mt-2">
                  <div className="bg-background h-2 rounded-full" style={{width: `${user?.trust_score || 0}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award size={20}/> Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span>Report an issue</span>
                  <span className="font-bold text-green-500">+10 pts</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Verify a report</span>
                  <span className="font-bold text-green-500">+5 pts</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Issue gets resolved</span>
                  <span className="font-bold text-green-500">+20 pts</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
