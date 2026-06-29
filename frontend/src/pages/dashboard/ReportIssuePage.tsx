import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  UploadCloud,
  Loader2,
  AlertTriangle,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Zap,
  Droplets,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Bot,
  Send,
  Mail,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const issueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
})

type IssueFormValues = z.infer<typeof issueSchema>

function LocationMarker({ position, setPosition }: { position: any; setPosition: any }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })
  return position === null ? null : <Marker position={position}></Marker>
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
}

const CATEGORIES = [
  {
    id: 'road',
    name: 'Road & Transport',
    icon: <MapPin size={24} />,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500',
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: <Zap size={24} />,
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:border-yellow-500',
  },
  {
    id: 'water',
    name: 'Water & Plumbing',
    icon: <Droplets size={24} />,
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:border-cyan-500',
  },
  {
    id: 'garbage',
    name: 'Waste Management',
    icon: <Trash2 size={24} />,
    color: 'bg-green-500/10 text-green-500 border-green-500/20 hover:border-green-500',
  },
  {
    id: 'other',
    name: 'Other Issues',
    icon: <ShieldAlert size={24} />,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:border-purple-500',
  },
]

export default function ReportIssuePage() {
  const navigate = useNavigate()

  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [direction, setDirection] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPreviewData, setAiPreviewData] = useState<any>(null)

  // AI Loading Loop State
  const [aiLoadingText, setAiLoadingText] = useState('Initializing AI...')
  const AI_MESSAGES = [
    'Scanning Image...',
    'Detecting Objects...',
    'Checking Duplicate Reports...',
    'Estimating Severity...',
    'Assigning Department...',
    'Generating Summary...',
  ]

  // Success State
  const [submittedIssueId, setSubmittedIssueId] = useState<number | null>(null)

  // Form Data State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Error State
  const [duplicateError, setDuplicateError] = useState<any>(null)
  const [duplicateIssueId, setDuplicateIssueId] = useState<number | null>(null)

  const {
    register,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
  })

  const handleNext = async () => {
    if (step === 1 && !selectedCategory) {
      alert('Please select a category.')
      return
    }
    if (step === 2 && !position) {
      alert('Please select a location on the map.')
      return
    }
    if (step === 3) {
      const isValid = await trigger()
      if (!isValid) return
      // Before going to step 4, trigger AI analysis
      handleAnalyze(getValues())
      return
    }
    setDirection(1)
    setStep((prev) => (prev + 1) as any)
  }

  const handleBack = () => {
    setDirection(-1)
    setStep((prev) => (prev - 1) as any)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.')
        return
      }
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.')
        return
      }
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const newPos = new L.LatLng(latitude, longitude)
          setPosition(newPos)
          setMapCenter([latitude, longitude])
        },
        (err) => {
          console.error('Error getting location', err)
          alert('Could not fetch your location. Please check browser permissions.')
        },
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleAnalyze = async (data: IssueFormValues) => {
    setIsAnalyzing(true)
    let messageIndex = 0
    const interval = setInterval(() => {
      setAiLoadingText(AI_MESSAGES[messageIndex])
      messageIndex = (messageIndex + 1) % AI_MESSAGES.length
    }, 1000)

    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      if (imageFile) {
        formData.append('file', imageFile)
      }

      const res = await api.post('/issues/analyze-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(interval)
      setAiPreviewData(res.data.analysis)
      if (res.data.image_url) {
        setUploadedImageUrl(res.data.image_url)
      }

      setDirection(1)
      setStep(4)
    } catch (err: any) {
      clearInterval(interval)
      alert('Analysis failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const submitFinalIssue = async () => {
    setIsSubmitting(true)
    setDuplicateError(null)
    try {
      const data = getValues()
      const payload = {
        title: data.title,
        description: data.description,
        lat: position!.lat,
        lng: position!.lng,
        image_url: uploadedImageUrl || undefined,
        // AI Fields
        category: aiPreviewData.category,
        severity: aiPreviewData.severity,
        ai_summary: aiPreviewData.summary,
        ai_suggested_resolution: aiPreviewData.suggested_resolution,
        ai_confidence: aiPreviewData.confidence,
        estimated_cost: aiPreviewData.estimated_cost,
        repair_time: aiPreviewData.repair_time,
        affected_population: aiPreviewData.affected_population,
        suggested_department: aiPreviewData.suggested_department,
        priority_score: aiPreviewData.priority_score,
        original_language: aiPreviewData.original_language,
        translated_text: aiPreviewData.translated_text,
        detected_objects: aiPreviewData.detected_objects,
        image_quality_score: aiPreviewData.image_quality_score,
        ai_scene_description: aiPreviewData.ai_scene_description,
      }
      const res = await api.post('/issues', payload)
      setSubmittedIssueId(res.data.id)
      setDirection(1)
      setStep(5 as any)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDuplicateError(err.response.data.detail)
        const match = err.response.data.detail.match(/ID: (\d+)/)
        if (match && match[1]) {
          setDuplicateIssueId(parseInt(match[1]))
        }
      } else {
        alert(err.response?.data?.detail || 'Failed to submit issue.')
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
      alert('You have supported the existing issue.')
      navigate(`/dashboard/issues/${duplicateIssueId}`)
    } catch (err) {
      console.error('Failed to support', err)
      navigate('/dashboard/map')
    }
  }

  const STEPS = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Location' },
    { num: 3, title: 'Details' },
    { num: 4, title: 'Review' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
          <p className="text-muted-foreground mt-1">
            Let's get this fixed. Follow the steps below.
          </p>
        </div>
      </motion.div>

      <Card className="overflow-hidden shadow-xl border-border/50">
        <div className="flex w-full bg-accent relative overflow-hidden">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex-1 relative h-2">
              <motion.div
                className="absolute top-0 left-0 h-full bg-primary"
                initial={{ width: step > i ? '100%' : '0%' }}
                animate={{ width: step > i ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          ))}
        </div>

        <CardHeader className="bg-background/50 border-b border-border backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack} className="h-8 w-8 rounded-full p-0">
                  <ArrowLeft size={16} />
                </Button>
              )}
              {STEPS[step - 1].title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              Step {step} of 4
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative overflow-hidden min-h-[500px] p-6 sm:p-10">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: CATEGORY */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">What kind of issue is this?</h2>
                  <p className="text-muted-foreground">
                    Select the category that best matches your report.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow content-start">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedCategory(cat.id)
                        }
                      }}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center gap-3 ${selectedCategory === cat.id ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-border bg-card hover:border-primary/30 hover:bg-accent/50'}`}
                    >
                      <div className={`p-4 rounded-full ${cat.color}`}>{cat.icon}</div>
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-auto pt-6 border-t border-border">
                  <Button
                    onClick={handleNext}
                    disabled={!selectedCategory}
                    className="px-8 h-12 text-base rounded-xl"
                  >
                    Next: Location <ChevronRight className="ml-2" size={18} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Where is it located?</h2>
                  <p className="text-muted-foreground">Pin the exact location on the map.</p>
                </div>
                <div className="flex-grow flex flex-col space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetCurrentLocation}
                      className="gap-2 h-10 rounded-xl"
                    >
                      <Navigation size={16} className="text-primary" /> Use Current Location
                    </Button>
                  </div>
                  <div className="flex-grow min-h-[300px] w-full rounded-2xl overflow-hidden border-2 border-border relative z-0 shadow-inner">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                      />
                      <RecenterMap center={mapCenter} />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>
                </div>
                <div className="flex justify-between mt-auto pt-6 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="px-6 h-12 text-base rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!position}
                    className="px-8 h-12 text-base rounded-xl"
                  >
                    Next: Details <ChevronRight className="ml-2" size={18} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Provide More Details</h2>
                  <p className="text-muted-foreground">
                    Add a photo and describe the issue so AI can analyze it.
                  </p>
                </div>
                <form className="space-y-6 flex-grow content-start">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Photo Evidence{' '}
                      <span className="text-muted-foreground font-normal">
                        (Optional, unlocks Vision AI)
                      </span>
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden ${
                        isDragging ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {imagePreviewUrl ? (
                        <div className="relative w-full h-40 flex justify-center">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="h-full rounded-xl object-cover shadow-md"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white font-medium">
                            Click to change image
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud size={32} className="text-primary" />
                          </div>
                          <p className="font-semibold text-foreground mb-1">
                            Click or drag image to attach
                          </p>
                          <p className="text-xs">Supports JPG, PNG, WEBP (Max 5MB)</p>
                        </>
                      )}
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-semibold">
                      Issue Title (Any Language)
                    </label>
                    <Input
                      id="title"
                      placeholder="E.g., Large pothole on Main St causing traffic"
                      {...register('title')}
                      className="h-12 rounded-xl text-base"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-semibold">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full min-h-[140px] rounded-xl border-2 border-border bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary transition-all duration-300 resize-none shadow-sm"
                      placeholder="Please describe the issue in detail. You can type in English, Hindi, or any local language..."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 font-medium">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </form>

                <div className="flex justify-between mt-auto pt-6 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isAnalyzing}
                    className="px-6 h-12 text-base rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isAnalyzing}
                    className="px-8 h-12 text-base rounded-xl relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                  >
                    <AnimatePresence mode="wait">
                      {isAnalyzing ? (
                        <motion.div
                          key="analyzing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {aiLoadingText}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="analyze"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Bot size={18} /> Generate AI Review <ChevronRight size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && aiPreviewData && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Review AI Insights</h2>
                  <p className="text-muted-foreground">
                    Please review the AI's classification and severity assessment before submitting.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Category', value: aiPreviewData.category },
                    {
                      label: 'Severity',
                      value: (
                        <div className="font-bold flex items-center gap-2">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' }}
                            className={`w-3 h-3 rounded-full ${
                              aiPreviewData.severity === 'Critical'
                                ? 'bg-red-500'
                                : aiPreviewData.severity === 'High'
                                  ? 'bg-orange-500'
                                  : 'bg-yellow-500'
                            }`}
                          />
                          {aiPreviewData.severity}
                        </div>
                      ),
                    },
                    {
                      label: 'Language Detected',
                      value: <span className="uppercase">{aiPreviewData.original_language}</span>,
                    },
                    {
                      label: 'AI Confidence',
                      value: (
                        <div className="text-primary font-bold flex items-center">
                          {aiPreviewData.confidence || 95}%
                        </div>
                      ),
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="bg-accent p-4 rounded-2xl border border-border/50"
                    >
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                        {item.label}
                      </div>
                      <div className="text-lg">{item.value}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="space-y-4"
                >
                  {aiPreviewData.original_language !== 'en' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-sm flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-full text-blue-600">
                        <Bot size={16} />
                      </div>
                      <div>
                        <strong className="block text-blue-700 mb-1">
                          Translated Text (English)
                        </strong>
                        <p className="text-blue-900/80 dark:text-blue-200/80">
                          {aiPreviewData.translated_text}
                        </p>
                      </div>
                    </div>
                  )}

                  {imageFile && (
                    <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl text-sm flex items-start gap-3">
                      <div className="p-2 bg-green-500/20 rounded-full text-green-600">
                        <UploadCloud size={16} />
                      </div>
                      <div>
                        <strong className="block text-green-700 mb-1">Vision AI Analysis</strong>
                        <p className="text-green-900/80 dark:text-green-200/80">
                          Detected objects:{' '}
                          <span className="font-semibold">{aiPreviewData.detected_objects}</span>.
                          Image Quality:{' '}
                          <span className="font-semibold">
                            {aiPreviewData.image_quality_score}/100
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-card border-2 border-border p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <strong className="text-muted-foreground text-xs uppercase tracking-wider mb-1 block">
                        AI Summary
                      </strong>
                      <p className="text-foreground">{aiPreviewData.summary}</p>
                    </div>
                    <div>
                      <strong className="text-muted-foreground text-xs uppercase tracking-wider mb-1 block">
                        Suggested Resolution
                      </strong>
                      <p className="text-foreground">{aiPreviewData.suggested_resolution}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
                      <div>
                        <strong className="text-muted-foreground text-xs uppercase tracking-wider block">
                          Est. Cost
                        </strong>
                        <span>₹{aiPreviewData.estimated_cost}</span>
                      </div>
                      <div>
                        <strong className="text-muted-foreground text-xs uppercase tracking-wider block">
                          Est. Time
                        </strong>
                        <span>{aiPreviewData.repair_time}</span>
                      </div>
                      <div>
                        <strong className="text-muted-foreground text-xs uppercase tracking-wider block">
                          Department
                        </strong>
                        <span>{aiPreviewData.suggested_department}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {duplicateError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 bg-orange-500/10 border-2 border-orange-500/20 rounded-2xl overflow-hidden mt-4"
                    >
                      <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
                        <AlertTriangle size={20} /> A similar issue already exists.
                      </div>
                      <p className="text-sm text-orange-900/80 dark:text-orange-200/80 mb-4">
                        {duplicateError}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-500/10"
                        onClick={handleSupportExisting}
                      >
                        Support Existing Issue Instead
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between mt-auto pt-6 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="px-6 h-12 text-base rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={submitFinalIssue}
                    disabled={isSubmitting}
                    className="px-8 h-12 text-base rounded-xl shadow-lg shadow-primary/30"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm & Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && submittedIssueId && (
              <motion.div
                key="step5"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                  className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30 relative"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 border-[6px] border-green-400 rounded-full border-dashed opacity-50"
                  />
                  <CheckCircle2 size={64} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl font-black mb-2 tracking-tight">Report Submitted!</h2>
                  <p className="text-xl text-muted-foreground max-w-md mx-auto">
                    Thank you for making our community better. Your issue tracking ID is{' '}
                    <span className="font-bold text-foreground">#{submittedIssueId}</span>.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-accent/50 border border-border rounded-2xl p-4 w-full max-w-sm"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-medium mb-1">
                    <Mail size={16} className="text-primary" /> Email Confirmation Sent
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expected Review: {aiPreviewData?.repair_time || '24-48 hours'}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 pt-8 w-full max-w-md mx-auto"
                >
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-xl text-base"
                    onClick={() => navigate('/dashboard')}
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    className="flex-1 h-14 rounded-xl text-base shadow-xl shadow-primary/20"
                    onClick={() => navigate(`/dashboard/issues/${submittedIssueId}`)}
                  >
                    <Send size={18} className="mr-2" /> Track Report
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
