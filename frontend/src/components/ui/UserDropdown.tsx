import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { User, FileText, Trophy, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react'

export function UserDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  const menuItems = [
    { icon: <User size={16} />, label: 'Profile', path: '/dashboard/profile' },
    { icon: <FileText size={16} />, label: 'My Reports', path: '/dashboard' },
    { icon: <Trophy size={16} />, label: 'Leaderboard', path: '/dashboard/leaderboard' },
    { icon: <Settings size={16} />, label: 'Settings', path: '/dashboard/settings' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-accent p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Menu"
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
          {user.full_name?.charAt(0) || 'U'}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            <div className="p-4 border-b border-border bg-accent/30">
              <p className="text-sm font-bold truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                  role="menuitem"
                >
                  <span className="text-muted-foreground">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border py-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors text-left"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                <span className="text-muted-foreground">
                  <HelpCircle size={16} />
                </span>
                Help & Support
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left font-medium"
                role="menuitem"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
