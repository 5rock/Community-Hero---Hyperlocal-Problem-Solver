import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import api from '@/services/api'
import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion } from 'framer-motion'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export default function InteractiveMap() {
  const [issues, setIssues] = useState<any[]>([])
  const [showDensity, setShowDensity] = useState(false)
  const [showZones, setShowZones] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    api
      .get('/issues')
      .then((res) => {
        setIssues(res.data)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
          <p className="text-muted-foreground mt-1">Explore issues reported in your community.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <div className="relative z-50">
            <Badge
              variant={showFilters ? 'default' : 'outline'}
              className="flex gap-1 items-center px-3 py-1 cursor-pointer transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Layers size={14} /> Map Layers
            </Badge>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-xl rounded-xl p-3 z-50"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      className="rounded accent-primary"
                      checked={showDensity}
                      onChange={(e) => setShowDensity(e.target.checked)}
                    />
                    Issue Density Layer
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      className="rounded accent-primary"
                      checked={showZones}
                      onChange={(e) => setShowZones(e.target.checked)}
                    />
                    Active Officer Zones
                  </label>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1"
      >
        <Card className="h-full overflow-hidden shadow-sm">
          <div className="h-full w-full relative z-0">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {issues.map((issue) => {
                const getPinColor = () => {
                  if (issue.severity === 'Critical') return 'bg-red-500'
                  if (issue.severity === 'High') return 'bg-orange-500'
                  return 'bg-yellow-500'
                }

                const customIcon = L.divIcon({
                  className: 'custom-pin',
                  html: `
                    <div class="relative flex items-center justify-center w-8 h-8 group">
                      <div class="absolute inset-0 rounded-full ${getPinColor()} opacity-40 animate-ping"></div>
                      <div class="relative w-4 h-4 rounded-full ${getPinColor()} border-2 border-white shadow-lg z-10 transition-transform group-hover:scale-150"></div>
                      <div class="absolute -bottom-2 w-1.5 h-3 ${getPinColor()} rounded-full z-0 origin-bottom"></div>
                    </div>
                  `,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32],
                })

                return (
                  <Marker key={issue.id} position={[issue.lat, issue.lng]} icon={customIcon}>
                    <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="p-1 min-w-[220px]"
                      >
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-0"
                          >
                            {issue.category || 'Uncategorized'}
                          </Badge>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${issue.severity === 'Critical' ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'}`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mb-1 leading-tight">{issue.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {issue.description}
                        </p>
                        <Link
                          to={`/dashboard/issues/${issue.id}`}
                          className="w-full text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-colors inline-flex items-center justify-center py-2 rounded-lg group"
                        >
                          View Details
                          <motion.span className="ml-1" initial={{ x: 0 }} whileHover={{ x: 3 }}>
                            &rarr;
                          </motion.span>
                        </Link>
                      </motion.div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Mock Current Location */}
              <Marker
                position={[51.505, -0.09]}
                icon={L.divIcon({
                  className: 'custom-pin',
                  html: `
                  <div class="relative flex items-center justify-center w-8 h-8">
                    <div class="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping"></div>
                    <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10 flex items-center justify-center text-white">
                    </div>
                  </div>
                `,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              >
                <Popup>Your Location</Popup>
              </Marker>
            </MapContainer>

            {/* Floating Legend overlay */}
            <div className="absolute bottom-6 right-6 z-[400] bg-background/90 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Map Legend
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>{' '}
                  Critical Priority
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>{' '}
                  High Priority
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>{' '}
                  Medium Priority
                </div>
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] relative flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full bg-blue-500 animate-ping opacity-50"></div>
                  </div>{' '}
                  Your Location
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
