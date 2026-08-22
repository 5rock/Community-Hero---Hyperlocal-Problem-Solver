import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/services/api'
import { ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from '@/components/layout/AuthLayout'

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

  const title = (
    <>
      Start Improving <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        Your City Today
      </span>
    </>
  )

  return (
    <AuthLayout
      title={title}
      subtitle="Become a verified Community Hero. Report issues, earn trust points, and track real-time resolution powered by AI."
      showLiveHealth={false}
    >
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
    </AuthLayout>
  )
}
