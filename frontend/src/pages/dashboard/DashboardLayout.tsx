import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { LayoutDashboard, Map, FilePlus, Trophy, LogOut, Moon, Sun, Menu, X, ShieldCheck, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/services/api'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      api.get('/users/notifications').then(res => {
        setNotifications(res.data)
      }).catch(console.error)
    }
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  let navItems = []
  if (user?.role === 'Admin') {
    navItems = [
      { icon: LayoutDashboard, label: 'Analytics', path: '/dashboard/admin' },
      { icon: Map, label: 'Interactive Map', path: '/dashboard/map' },
      { icon: ShieldCheck, label: 'Leaderboard', path: '/dashboard/leaderboard' },
    ]
  } else if (user?.role === 'Officer') {
    navItems = [
      { icon: LayoutDashboard, label: 'Assigned Issues', path: '/dashboard/officer' },
      { icon: Map, label: 'Interactive Map', path: '/dashboard/map' },
    ]
  } else {
    navItems = [
      { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
      { icon: FilePlus, label: 'Report Issue', path: '/dashboard/report' },
      { icon: Map, label: 'Interactive Map', path: '/dashboard/map' },
      { icon: Trophy, label: 'Leaderboard', path: '/dashboard/leaderboard' },
    ]
  }

  return (
    <div className="min-h-screen bg-accent/30 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-background border-r border-border h-screen sticky top-0">
        <div className="p-6 font-bold text-xl tracking-tighter flex items-center gap-2">
          <ShieldCheck className="text-primary w-6 h-6" />
          Community Hero
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4 bg-accent/10">
          <div className="bg-background rounded-xl p-3 border border-border shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.role}</div>
            </div>
            
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors relative">
                <Bell size={16} />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute bottom-12 right-0 w-64 bg-background border border-border rounded-xl shadow-xl p-2 z-50 max-h-64 overflow-y-auto">
                  <h4 className="text-xs font-bold px-2 py-1 mb-1 text-muted-foreground">Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-center py-4 text-muted-foreground">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2 hover:bg-accent rounded-lg mb-1">
                        <div className="text-xs font-bold">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-40">
          <div className="font-bold text-lg flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Community Hero
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-accent rounded-md text-foreground">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border p-4 space-y-2 absolute w-full z-30 shadow-xl">
             {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-500"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}

        <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
