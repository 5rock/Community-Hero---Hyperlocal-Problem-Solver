import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import {
  LayoutDashboard,
  Map as MapIcon,
  FilePlus,
  Trophy,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { UserDropdown } from '@/components/ui/UserDropdown'
import AIAssistantWidget from '@/components/AIAssistantWidget'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  let navItems = []
  if (user?.role === 'Admin') {
    navItems = [
      { icon: LayoutDashboard, label: 'Analytics', path: '/dashboard/admin' },
      { icon: MapIcon, label: 'Interactive Map', path: '/dashboard/map' },
      { icon: ShieldCheck, label: 'Leaderboard', path: '/dashboard/leaderboard' },
    ]
  } else if (user?.role === 'Officer') {
    navItems = [
      { icon: LayoutDashboard, label: 'Assigned Issues', path: '/dashboard/officer' },
      { icon: MapIcon, label: 'Interactive Map', path: '/dashboard/map' },
    ]
  } else {
    navItems = [
      { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
      { icon: FilePlus, label: 'Report Issue', path: '/dashboard/report' },
      { icon: MapIcon, label: 'Interactive Map', path: '/dashboard/map' },
      { icon: Trophy, label: 'Leaderboard', path: '/dashboard/leaderboard' },
    ]
  }

  return (
    <div
      className={`min-h-screen bg-accent/30 flex theme-${user?.role?.toLowerCase() || 'citizen'}`}
    >
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-background border-r border-border h-screen sticky top-0">
        <div className="p-6 font-bold text-xl tracking-tighter flex items-center gap-2">
          <ShieldCheck className="text-primary w-6 h-6" />
          Community Hero
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 relative">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors z-10 ${
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-tab"
                    className="absolute inset-0 bg-primary rounded-xl shadow-md shadow-primary/20 -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon size={18} className={isActive ? '' : 'opacity-70'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border bg-accent/10">
          <div className="bg-background rounded-xl p-3 border border-border shadow-sm flex items-center justify-between">
            <UserDropdown />
            <div className="flex items-center gap-1">
              <LanguageSelector />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
          <div className="font-bold text-lg flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Hero AI
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserDropdown />
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-50 pb-safe">
          <div className="flex justify-around items-center p-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <item.icon size={22} className={isActive ? 'mb-1' : 'mb-1 opacity-70'} />
                  </motion.div>
                  {item.label.split(' ')[0]}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="flex-1 p-6 pb-28 md:p-8 overflow-y-auto w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        <AIAssistantWidget />
      </main>
    </div>
  )
}
