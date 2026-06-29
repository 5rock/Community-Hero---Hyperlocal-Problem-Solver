import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShieldCheck, Mail, CheckCircle2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const codeSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters'),
})

const newPasswordSchema = z
  .object({
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type EmailFormValues = z.infer<typeof emailSchema>
type CodeFormValues = z.infer<typeof codeSchema>
type NewPasswordFormValues = z.infer<typeof newPasswordSchema>

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetToken, setResetToken] = useState('')

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) })
  const codeForm = useForm<CodeFormValues>({ resolver: zodResolver(codeSchema) })
  const passwordForm = useForm<NewPasswordFormValues>({ resolver: zodResolver(newPasswordSchema) })

  const onEmailSubmit = async (data: EmailFormValues) => {
    try {
      setError('')
      const response = await api.post('/auth/forgot-password', { email: data.email })
      if (response.data.dev_code) {
        codeForm.setValue('code', response.data.dev_code)
      }
      setStep('code')
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  const onCodeSubmit = async (data: CodeFormValues) => {
    setError('')
    setResetToken(data.code)
    setStep('password')
  }

  const onPasswordSubmit = async (data: NewPasswordFormValues) => {
    try {
      setError('')
      await api.post('/auth/reset-password', {
        token: resetToken,
        password: data.password,
      })
      setStep('success')
    } catch {
      setError('The recovery code is invalid or expired. Please request a new one.')
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex bg-background relative overflow-hidden">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 relative flex-col justify-between p-12 overflow-hidden border-r border-border">
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
              Account <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Recovery
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-md"
            >
              Don't worry, it happens to the best of us. Let's get you back into your account safely
              and securely.
            </motion.p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl relative z-10"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h2>
                  <p className="text-muted-foreground">
                    Enter your email and we'll send you a recovery link.
                  </p>
                </div>
                {error && (
                  <div className="p-3 mb-6 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                  <div className="relative">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      {...emailForm.register('email')}
                      error={emailForm.formState.errors.email?.message}
                      className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all pl-10"
                    />
                    <Mail className="absolute left-3 top-[34px] text-muted-foreground" size={18} />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20"
                    isLoading={emailForm.formState.isSubmitting}
                  >
                    Send Recovery Code
                  </Button>
                </form>
                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Remembered your password?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {step === 'code' && (
              <motion.div
                key="code-form"
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl relative z-10"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Enter Code</h2>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to your email. Enter it below to verify your identity.
                  </p>
                </div>
                {error && (
                  <div className="p-3 mb-6 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-5">
                  <div className="relative">
                    <Input
                      label="Verification Code"
                      type="text"
                      placeholder="123456"
                      {...codeForm.register('code')}
                      error={codeForm.formState.errors.code?.message}
                      className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all pl-10 tracking-[0.5em] font-mono text-center"
                    />
                    <KeyRound
                      className="absolute left-3 top-[34px] text-muted-foreground"
                      size={18}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20"
                    isLoading={codeForm.formState.isSubmitting}
                  >
                    Verify Code
                  </Button>
                </form>
                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  <button
                    onClick={() => setStep('email')}
                    className="text-primary font-bold hover:underline ml-1"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div
                key="password-form"
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl relative z-10"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">New Password</h2>
                  <p className="text-muted-foreground">
                    Create a new, strong password for your account.
                  </p>
                </div>
                {error && (
                  <div className="p-3 mb-6 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                  <div className="space-y-1 relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...passwordForm.register('password')}
                      error={passwordForm.formState.errors.password?.message}
                      className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-[34px] text-muted-foreground" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="space-y-1 relative">
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...passwordForm.register('confirm_password')}
                      error={passwordForm.formState.errors.confirm_password?.message}
                      className="bg-accent/50 border-transparent focus:border-primary focus:bg-background transition-all pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-[34px] text-muted-foreground" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20"
                    isLoading={passwordForm.formState.isSubmitting}
                  >
                    Reset Password
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
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
                  Password Reset!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground max-w-sm mb-6"
                >
                  Your password has been successfully reset. You can now log in with your new
                  password.
                </motion.p>
                <Link to="/login">
                  <Button variant="primary" className="rounded-xl h-12 px-8">
                    Go to Login
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
