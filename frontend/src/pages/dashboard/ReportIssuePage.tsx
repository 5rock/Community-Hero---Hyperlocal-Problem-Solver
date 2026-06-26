import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { MapPin, UploadCloud, Loader2, AlertTriangle, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const issueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
})

type IssueFormValues = z.infer<typeof issueSchema>

function LocationMarker({ position, setPosition }: { position: any, setPosition: any }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

export default function ReportIssuePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]) // Default London
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<any>(null)
  const [duplicateIssueId, setDuplicateIssueId] = useState<number | null>(null)
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.")
        return
      }
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await api.post('/issues/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setImageBase64(res.data.url) // It's now a URL, not base64
      } catch (err: any) {
        alert("Upload failed: " + (err.response?.data?.detail || err.message))
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = new L.LatLng(latitude, longitude);
        setPosition(newPos)
        setMapCenter([latitude, longitude])
      }, (err) => {
        console.error("Error getting location", err);
        alert("Could not fetch your location. Please check browser permissions.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }
  
  const { register, handleSubmit, formState: { errors } } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema)
  })

  const onSubmit = async (data: IssueFormValues) => {
    if (!position) {
      alert("Please select a location on the map")
      return
    }
    
    setIsSubmitting(true)
    setDuplicateError(null)
    try {
      const payload = {
        ...data,
        lat: position.lat,
        lng: position.lng,
        image_url: imageBase64 || undefined
      }
      const res = await api.post('/issues', payload)
      navigate(`/dashboard/issues/${res.data.id}`)
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 409) {
        setDuplicateError(err.response.data.detail)
        // Try to extract the ID from the error detail string: "Duplicate issue... ID: 123"
        const match = err.response.data.detail.match(/ID: (\d+)/)
        if (match && match[1]) {
          setDuplicateIssueId(parseInt(match[1]))
        }
      } else {
        alert(err.response?.data?.detail || "Failed to submit issue. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSupportExisting = async () => {
    if (!duplicateIssueId) {
      navigate('/dashboard/map')
      return
    }
    
    try {
      await api.post(`/issues/${duplicateIssueId}/support`)
      alert("You have supported the existing issue.")
      navigate(`/dashboard/issues/${duplicateIssueId}`)
    } catch(err) {
      console.error("Failed to support", err)
      navigate('/dashboard/map')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">Help improve your community by reporting local problems.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <p className="text-sm text-muted-foreground">Our AI will automatically categorize and prioritize your report.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Title</label>
              <Input 
                placeholder="E.g., Large pothole on Main St" 
                {...register('title')} 
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Please describe the issue in detail..."
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin size={16} /> Select Location
                </label>
                <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} className="gap-2 h-8">
                  <Navigation size={14} /> Use Current Location
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Click on the map to place a pin where the issue is located.</p>
              <div className="h-[300px] w-full rounded-md overflow-hidden border border-border relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <RecenterMap center={mapCenter} />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <UploadCloud size={16} /> Photo Evidence (Optional)
              </label>
              <div className="relative border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                {imageBase64 ? (
                  <img src={imageBase64} alt="Preview" className="max-h-32 rounded-md object-cover" />
                ) : (
                  <>
                    <UploadCloud size={32} className="mb-2" />
                    <p className="text-sm">Click or drag image to upload</p>
                  </>
                )}
              </div>
            </div>

            {duplicateError && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-orange-500 font-bold mb-2">
                  <AlertTriangle size={18} /> A similar issue already exists.
                </div>
                <p className="text-sm text-muted-foreground mb-4">{duplicateError}</p>
                <Button type="button" variant="outline" className="w-full border-orange-500 text-orange-500" onClick={handleSupportExisting}>
                  Support Existing Issue Instead
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing & Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
