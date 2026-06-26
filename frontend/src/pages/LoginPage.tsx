import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { ShieldCheck } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      const formData = new URLSearchParams()
      formData.append('username', data.email)
      formData.append('password', data.password)
      
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      login(res.data.access_token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="w-full max-w-md p-8 rounded-3xl bg-background border border-border shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your details to sign in</p>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-foreground font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
