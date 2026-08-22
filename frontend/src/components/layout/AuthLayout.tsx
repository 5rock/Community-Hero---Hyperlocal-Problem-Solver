const secureRandom = () => window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Activity, Users, MapPin } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

interface AuthLayoutProps {
  children: ReactNode
  title: ReactNode
  subtitle: string
  showLiveHealth?: boolean
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLiveHealth = false,
}: Readonly<AuthLayoutProps>) {
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
            {[...new Array(20)].map((_, i) => (
              <motion.div
                key={i-}
                className="absolute w-2 h-2 bg-primary/40 rounded-full"
                initial={{
                  x: (secureRandom() * window.innerWidth) / 2,
                  y: secureRandom() * window.innerHeight,
                }}
                animate={{
                  y: [null, secureRandom() * -100 - 50],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: secureRandom() * 3 + 2,
                  repeat: Infinity,
                  delay: secureRandom() * 5,
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
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-md"
            >
              {subtitle}
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
            {showLiveHealth && (
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
            )}
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto">
          {children}
        </div>
      </div>
    </PageTransition>
  )
}
