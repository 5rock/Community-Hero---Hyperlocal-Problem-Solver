import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ShieldCheck, Cpu } from 'lucide-react'

const SPLASH_MESSAGES = [
  'Community Hero AI',
  'Scanning City...',
  'Preparing Dashboard...',
  'Loading Citizen Data...',
  'Welcome',
]

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // 5 messages, total duration ~3.5s
    if (stage < SPLASH_MESSAGES.length - 1) {
      const timer = setTimeout(() => {
        setStage((s) => s + 1)
      }, 700)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [stage, onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Background Pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] z-0"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                <ShieldCheck className="text-primary w-12 h-12" />
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Community Hero AI
              </h1>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mb-4 text-secondary"
              >
                <MapPin size={64} />
              </motion.div>
              <h2 className="text-2xl font-semibold text-muted-foreground">{SPLASH_MESSAGES[1]}</h2>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-4 text-primary"
              >
                <Cpu size={64} />
              </motion.div>
              <h2 className="text-2xl font-semibold text-muted-foreground">{SPLASH_MESSAGES[2]}</h2>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-64"
            >
              <h2 className="text-xl font-semibold text-muted-foreground mb-4">
                {SPLASH_MESSAGES[3]}
              </h2>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div
              key="stage-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                <ShieldCheck className="text-green-500 w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {SPLASH_MESSAGES[4]}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
