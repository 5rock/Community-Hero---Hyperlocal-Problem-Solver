import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Moon, Sun, ShieldCheck, Menu, X } from 'lucide-react'
import { UserDropdown } from '@/components/ui/UserDropdown'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Leaderboard', path: '/dashboard/leaderboard' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter z-50">
            <ShieldCheck className="text-primary w-8 h-8" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Hero AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <UserDropdown />
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-semibold hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="rounded-full shadow-lg hover:shadow-primary/25 transition-all"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4 z-50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2 text-foreground"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg font-semibold">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-border/50 pb-4 text-muted-foreground hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 flex flex-col gap-4">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full h-12 text-lg">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full h-12 text-lg">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-full h-12 text-lg shadow-lg">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
