import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from '@/components/layout/AuthLayout'

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

  const title = (
    <>
      Building Better <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        Communities Together
      </span>
    </>
  )

  return (
    <AuthLayout
      title={title}
      subtitle="Join thousands of citizens and officials using AI to report, track, and resolve city infrastructure issues faster than ever."
      showLiveHealth={true}
    >
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
                          (strength >= idx && strength < 2 ? 'bg-red-500' : '') ||
                          (strength >= idx && strength >= 2 && strength < 3 ? 'bg-yellow-500' : '') ||
                          (strength >= idx && strength >= 3 && strength < 4 ? 'bg-blue-500' : '') ||
                          (strength >= idx && strength >= 4 ? 'bg-green-500' : '') ||
                          (strength < idx ? 'bg-muted' : '')
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
                <Link to="/forgot-password" className="text-primary font-medium hover:underline">
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
    </AuthLayout>
  )
}
