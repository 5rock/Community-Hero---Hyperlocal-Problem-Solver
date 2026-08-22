import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { Button } from './Button'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    if (unreadCount > 0) {
      setHasNew(true)
      const timer = setTimeout(() => setHasNew(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-accent transition-colors"
      >
        <motion.div
          animate={hasNew ? { rotate: [0, -20, 20, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Bell size={20} />
        </motion.div>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg overflow-hidden flex flex-col origin-top-right"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    key={idx}
                    className="p-4 border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          notif.type === 'SUCCESS'
                            ? 'bg-green-500'
                            : notif.type === 'ALERT'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <h4 className="text-sm font-semibold">{notif.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">{notif.message}</p>
                  </motion.div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border bg-card">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
