import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8"
        >
          <FileQuestion size={64} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-black mb-4 tracking-tighter"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground max-w-md mx-auto mb-8"
        >
          Oops! The page you're looking for seems to have gone missing or doesn't exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md mx-auto"
        >
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl text-base"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} className="mr-2" /> Go Back
          </Button>
          <Link to="/" className="flex-1">
            <Button className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20">
              <Home size={18} className="mr-2" /> Home Page
            </Button>
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  )
}
