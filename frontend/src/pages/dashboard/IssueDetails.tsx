import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { Bot, MapPin, CheckCircle, XCircle, UserCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function IssueDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issue, setIssue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get(`/issues/${id}`).then(res => {
      setIssue(res.data)
    }).catch(err => {
      console.error(err)
      navigate('/dashboard/map')
    }).finally(() => setIsLoading(false))
  }, [id, navigate])

  const handleVerify = async (confirm: boolean) => {
    try {
      await api.post(`/issues/${id}/verify`, {
        issue_id: parseInt(id as string),
        confirm: confirm,
        vote_urgency: 'Medium'
      })
      alert(`Issue ${confirm ? 'confirmed' : 'rejected'} successfully!`)
      // Refresh issue
      const res = await api.get(`/issues/${id}`)
      setIssue(res.data)
    } catch (err: any) {
      alert(err.response?.data?.detail || "Verification failed")
    }
  }

  const handlePoll = async (status: string) => {
    try {
      await api.post(`/issues/${id}/poll`, { status })
      alert('Thank you for your feedback!')
      const res = await api.get(`/issues/${id}`)
      setIssue(res.data)
    } catch (err: any) {
      alert(err.response?.data?.detail || "Poll submission failed")
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading issue details...</div>
  if (!issue) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{issue.category}</Badge>
            <Badge variant={issue.severity === 'Critical' ? 'destructive' : 'default'} className="bg-orange-500 hover:bg-orange-600">{issue.severity}</Badge>
            <Badge variant="outline" className="border-primary text-primary">{issue.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-2 text-sm">
            <MapPin size={14} /> Lat: {issue.lat.toFixed(4)}, Lng: {issue.lng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Visual Timeline */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between w-full relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted hidden md:block"></div>
            
            {[
              { id: 'PENDING', label: 'Reported' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'ASSIGNED', label: 'Assigned' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'RESOLVED', label: 'Resolved' },
              { id: 'CLOSED', label: 'Closed' }
            ].map((step, idx) => {
              const statusOrder = ['PENDING', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
              const currentIndex = statusOrder.indexOf(issue.status === 'REOPENED' ? 'PENDING' : issue.status === 'REJECTED' ? 'CLOSED' : issue.status);
              const isActive = idx === currentIndex;
              const isPast = idx < currentIndex;
              
              return (
                <div key={step.id} className="relative flex flex-col items-center z-10 bg-card px-2 py-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                      isPast ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-card text-muted-foreground'}`}>
                    {isPast ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{issue.description}</p>
              {issue.image_url && (
                <img src={issue.image_url} alt="Evidence" className="mt-4 rounded-xl max-h-64 object-cover w-full border border-border" />
              )}
            </CardContent>
          </Card>

          {issue.ai_summary && (
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot size={20} /> AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
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
                  <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Repair Time</h4>
                  <p className="text-sm font-medium">{issue.repair_time}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Department</h4>
                  <p className="text-sm font-medium">{issue.suggested_department}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Priority Score</h4>
                  <p className="text-sm font-medium">{issue.priority_score}/100</p>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground mt-2 border-t border-border pt-4">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  Confidence: {issue.ai_confidence}%
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {issue.status === 'RESOLVED' && issue.reporter?.id === user?.id && (
            <Card className="border-orange-500/50 bg-orange-500/5 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle size={18}/> Resolution Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium">The assigned officer has marked this issue as RESOLVED. Please confirm if the work was completed satisfactorily.</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => handlePoll('YES')} className="bg-green-600 hover:bg-green-700">Yes, fully resolved</Button>
                  <Button onClick={() => handlePoll('PARTIALLY')} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950">Partially resolved</Button>
                  <Button onClick={() => handlePoll('NO')} className="bg-red-600 text-white hover:bg-red-700">No, it is still broken</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck size={18}/> Community Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Are you currently near this location? Help the community by verifying this report.</p>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleVerify(true)} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle size={16} /> Confirm Issue Exists
                </Button>
                <Button onClick={() => handleVerify(false)} variant="outline" className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                  <XCircle size={16} /> Report as Fake/Resolved
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Trust Score impact</span>
                <span className="font-bold text-green-500">+5 pts</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reporter Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">
                    U
                 </div>
                 <div>
                   <div className="font-bold text-sm">Citizen</div>
                   <div className="text-xs text-muted-foreground">Reported on {new Date(issue.created_at).toLocaleDateString()}</div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
