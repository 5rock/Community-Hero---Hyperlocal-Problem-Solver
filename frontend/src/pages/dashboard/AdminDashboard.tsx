import { useState, useEffect } from 'react'
import api from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { Bot, Map, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [securityStats, setSecurityStats] = useState<any>(null)
  const [isLoadingAi, setIsLoadingAi] = useState(true)

  useEffect(() => {
    api.get('/stats/').then(res => setStats(res.data)).catch(console.error)
    api.get('/admin/security-dashboard').then(res => setSecurityStats(res.data)).catch(console.error)
    api.get('/stats/ai-insights').then(res => {
      setAiInsights(res.data)
    }).catch(console.error).finally(() => setIsLoadingAi(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Issues</CardTitle></CardHeader><CardContent>{stats?.cards?.total_issues}</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Issues</CardTitle></CardHeader><CardContent>{stats?.cards?.active_issues}</CardContent></Card>
        <Card><CardHeader><CardTitle>Resolved Issues</CardTitle></CardHeader><CardContent>{stats?.cards?.resolved_issues}</CardContent></Card>
        <Card><CardHeader><CardTitle>Resolution Rate</CardTitle></CardHeader><CardContent>{stats?.cards?.resolution_rate}%</CardContent></Card>
      </div>

      {securityStats && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500"/> Security Dashboard</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-red-500/20 bg-red-500/5"><CardHeader><CardTitle className="text-red-600">Failed Logins</CardTitle></CardHeader><CardContent>{securityStats.failed_logins}</CardContent></Card>
            <Card className="border-orange-500/20 bg-orange-500/5"><CardHeader><CardTitle className="text-orange-600">Prompt Injections</CardTitle></CardHeader><CardContent>{securityStats.prompt_injection_attempts}</CardContent></Card>
            <Card className="border-blue-500/20 bg-blue-500/5"><CardHeader><CardTitle className="text-blue-600">Active Sessions</CardTitle></CardHeader><CardContent>{securityStats.active_sessions}</CardContent></Card>
            <Card className="border-purple-500/20 bg-purple-500/5"><CardHeader><CardTitle className="text-purple-600">Risk Score</CardTitle></CardHeader><CardContent>{securityStats.risk_score}</CardContent></Card>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><Bot className="text-primary"/> Gemini AI Insights</h2>
        {isLoadingAi ? (
          <div className="flex justify-center items-center h-32 text-muted-foreground"><Loader2 className="animate-spin mr-2"/> Analyzing city data...</div>
        ) : aiInsights ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp size={18}/> Monthly Trends</CardTitle></CardHeader>
              <CardContent><p className="text-sm font-medium">{aiInsights.monthly_trends}</p></CardContent>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-orange-600"><AlertTriangle size={18}/> Risk Forecasting</CardTitle></CardHeader>
              <CardContent><p className="text-sm font-medium">{aiInsights.risk_forecasting}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Top Categories</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {aiInsights.top_categories?.map((cat: string, i: number) => <li key={i} className="text-sm">{cat}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Map size={18}/> Hotspot Areas</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {aiInsights.hotspot_areas?.map((area: string, i: number) => <li key={i} className="text-sm">{area}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Could not load AI Insights.</div>
        )}
      </div>
      
      {/* Tables for issues and users to be added */}
    </div>
  )
}
