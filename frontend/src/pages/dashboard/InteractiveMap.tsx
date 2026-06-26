import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import api from '@/services/api'
import { Link } from 'react-router-dom'
import { Filter } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function InteractiveMap() {
  const [issues, setIssues] = useState<any[]>([])

  useEffect(() => {
    api.get('/issues').then(res => {
      setIssues(res.data)
    }).catch(console.error)
  }, [])

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
          <p className="text-muted-foreground mt-1">Explore issues reported in your community.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="flex gap-1 items-center px-3 py-1"><Filter size={14}/> Filter</Badge>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <div className="h-full w-full relative z-0">
          <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {issues.map(issue => (
              <Marker key={issue.id} position={[issue.lat, issue.lng]}>
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                       <Badge variant="secondary" className="text-[10px]">{issue.category || 'Uncategorized'}</Badge>
                       <span className={`text-xs font-bold ${issue.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                         {issue.severity}
                       </span>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{issue.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>
                    <Link to={`/dashboard/issues/${issue.id}`} className="text-xs font-bold text-primary hover:underline">
                      View Details &rarr;
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>
    </div>
  )
}
