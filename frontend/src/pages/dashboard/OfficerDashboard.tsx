import { useState, useEffect } from 'react'
import api from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Link } from 'react-router-dom'

export default function OfficerDashboard() {
  const [issues, setIssues] = useState<any[]>([])

  useEffect(() => {
    api.get('/issues/assigned').then(res => setIssues(res.data)).catch(console.error)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Assigned Issues</h1>
      <div className="grid gap-4">
        {issues.map(issue => (
          <Card key={issue.id}>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                {issue.title}
                <Badge>{issue.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{issue.description}</p>
              <Link to={`/dashboard/issues/${issue.id}`} className="text-primary font-semibold text-sm hover:underline">
                Update Progress &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
        {issues.length === 0 && <p className="text-muted-foreground">No issues assigned currently.</p>}
      </div>
    </div>
  )
}
