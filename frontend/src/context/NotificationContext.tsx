import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { wsService, NotificationPayload } from '../services/ws'
import { useAuth } from './AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Bot, X } from 'lucide-react'

interface NotificationContextType {
  notifications: NotificationPayload[]
  unreadCount: number
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && token) {
      wsService.connect(token)

      const unsubscribe = wsService.subscribe((payload) => {
        setNotifications((prev) => [payload, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Example toast logic can hook into this, but we'll build a separate component
        // that listens to this context or we can just render toasts globally here.
      })

      return () => {
        unsubscribe()
        wsService.disconnect()
      }
    }
  }, [isAuthenticated, token])

  const markAllAsRead = () => setUnreadCount(0)

  // A very simple realtime toast implementation
  const [toast, setToast] = useState<NotificationPayload | null>(null)

  useEffect(() => {
    if (notifications.length > 0) {
      setToast(notifications[0])
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
          >
            <div className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl p-4 rounded-2xl flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  toast.type === 'SUCCESS'
                    ? 'bg-green-500/10 text-green-500'
                    : toast.type === 'ALERT'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-primary/10 text-primary'
                }`}
              >
                {toast.type === 'SUCCESS' ? (
                  <CheckCircle2 size={20} />
                ) : toast.type === 'ALERT' ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-sm font-bold text-foreground">{toast.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
