import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { ShieldCheck, Eye, EyeOff, Activity, Users, MapPin, CheckCircle2 } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [welcomeName, setWelcomeName] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const passwordValue = watch('password', '')

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length > 6) score += 1
    if (pass.length > 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }

  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      const formData = new URLSearchParams()
      formData.append('username', data.email)
      formData.append('password', data.password)

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      login(res.data.access_token)

      // Attempt to get user profile for welcome message
      try {
        const userRes = await api.get('/auth/me')
        setWelcomeName(userRes.data.full_name || 'Hero')
      } catch (e) {
        setWelcomeName('Hero')
      }

      setIsSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during login')
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex bg-background relative overflow-hidden">
        {/* Left Side - City & Stats */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 relative flex-col justify-between p-12 overflow-hidden border-r border-border">
          {/* Abstract City / Particles */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"
            />
            <motion.div
              animate={{ x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]"
            />

            {/* Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/40 rounded-full"
                initial={{
                  x: (Math.random() * window.innerWidth) / 2,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, Math.random() * -100 - 50],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg">
                <ShieldCheck size={28} />
              </div>
              <span className="text-xl font-bold tracking-tight">Community Hero AI</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-black tracking-tight leading-[1.1] mb-6"
            >
              Building Better <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Communities Together
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-md"
            >
              Join thousands of citizens and officials using AI to report, track, and resolve city
              infrastructure issues faster than ever.
            </motion.p>
          </div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative z-10 grid grid-cols-2 gap-4 max-w-md"
          >
            <div className="bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Activity size={18} />
                <span className="font-semibold text-sm">Issues Resolved</span>
              </div>
              <div className="text-3xl font-bold">14,284</div>
            </div>
            <div className="bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <Users size={18} />
                <span className="font-semibold text-sm">Active Heroes</span>
              </div>
              <div className="text-3xl font-bold">2,851</div>
            </div>
            <div className="col-span-2 bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="text-orange-500" size={20} />
                <div>
                  <div className="font-semibold text-sm">Live System Health</div>
                  <div className="text-xs text-muted-foreground">All systems operational</div>
                </div>
              </div>
              <div className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl relative z-10"
              >
                <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                  <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Community Hero AI</span>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
                  <p className="text-muted-foreground">
                    Enter your credentials to access your dashboard
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 mb-6 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                    className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all"
                  />

                  <div className="space-y-1 relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      error={errors.password?.message}
                      className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all pr-10"
                      onKeyUp={(e) => {
                        if (e.getModifierState('CapsLock')) {
                          if (!error) setError('Caps Lock is ON')
                        } else {
                          if (error === 'Caps Lock is ON') setError('')
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {/* Password Strength Indicator */}
                    {passwordValue.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map((idx) => (
                          <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              strength >= idx
                                ? strength < 2
                                  ? 'bg-red-500'
                                  : strength < 3
                                    ? 'bg-yellow-500'
                                    : strength < 4
                                      ? 'bg-blue-500'
                                      : 'bg-green-500'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4 transition-colors"
                      />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        Remember me
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-primary font-medium hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl mt-2 shadow-lg shadow-primary/20"
                    isLoading={isSubmitting}
                  >
                    Sign In
                  </Button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-bold hover:underline ml-1">
                    Sign up now
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center z-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/40 text-white"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold tracking-tight mb-2"
                >
                  Welcome back,
                </motion.h2>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold tracking-tight text-primary"
                >
                  {welcomeName} 👋
                </motion.h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
