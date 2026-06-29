import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/services/api'
import { ShieldCheck, Eye, EyeOff, Activity, Users, CheckCircle2, XCircle } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'

const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirm_password: z.string(),
    agree_terms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms & Conditions',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agree_terms: false,
    },
  })

  const passwordValue = watch('password', '')

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length > 7) score += 1
    if (pass.length > 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }

  const strength = getPasswordStrength(passwordValue)

  const reqs = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'Contains a number', met: /[0-9]/.test(passwordValue) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
  ]

  const onSubmit = async (data: SignupForm) => {
    try {
      setError('')
      await api.post('/auth/register', {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      })
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during registration')
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
              Start Improving <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Your City Today
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-md"
            >
              Become a verified Community Hero. Report issues, earn trust points, and track
              real-time resolution powered by AI.
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
          </motion.div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="signup-form"
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
                  <span className="text-xl font-bold tracking-tight">Hero AI</span>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Create an account</h2>
                  <p className="text-muted-foreground">Join the platform and make an impact</p>
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
                    label="Full Name"
                    placeholder="John Doe"
                    {...register('full_name')}
                    error={errors.full_name?.message}
                    className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all"
                  />
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
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
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
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                          {reqs.map((req, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1 ${req.met ? 'text-green-500' : ''}`}
                            >
                              {req.met ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} className="opacity-50" />
                              )}
                              {req.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirm_password')}
                      error={errors.confirm_password?.message}
                      className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        {...register('agree_terms')}
                        className="mt-1 rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4 transition-colors"
                      />
                      <span className="text-sm text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
                        I agree to the{' '}
                        <a href="/terms" className="text-primary hover:underline">
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </label>
                    {errors.agree_terms && (
                      <p className="text-red-500 text-xs mt-1">{errors.agree_terms.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl mt-2 shadow-lg shadow-primary/20"
                    isLoading={isSubmitting}
                  >
                    Create Account
                  </Button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                    Sign in here
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
                  className="text-3xl font-bold tracking-tight mb-2"
                >
                  Account Created!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground"
                >
                  Redirecting you to login...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
