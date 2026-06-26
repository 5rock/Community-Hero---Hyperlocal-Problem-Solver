import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun, MapPin, Zap, ShieldCheck, Activity, Users, CheckCircle, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 transition-colors">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <ShieldCheck className="text-primary w-8 h-8" />
          Community Hero AI
        </div>
        <nav className="flex items-center gap-6">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">Login</Link>
          <Link to="/signup">
            <Button size="sm" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-32 md:py-48 flex flex-col items-center text-center max-w-6xl mx-auto overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-sm font-medium mb-8 border border-border">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Now live in your city
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
              Empowering Communities<br />Through AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light">
              Report, verify, and solve local issues together. Transform your neighborhood with the power of artificial intelligence and community collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard/report">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl hover:shadow-primary/30 transition-all">
                  Report Issue
                </Button>
              </Link>
              <Link to="/dashboard/map">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full gap-2 hover:bg-accent transition-all">
                  <MapPin size={20} />
                  Explore Map
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-accent/30 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Intelligent Platform</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built from the ground up to make reporting and resolving civic issues frictionless.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Zap size={28} />, title: "AI Categorization", desc: "Instantly routes and classifies your reports using advanced Gemini AI." },
                { icon: <Users size={28} />, title: "Community Verification", desc: "Trust scores powered by local residents confirming actual problems." },
                { icon: <Activity size={28} />, title: "Live Tracking", desc: "Follow the lifecycle of an issue from report to final resolution." },
                { icon: <BarChart3 size={28} />, title: "Predictive Insights", desc: "Identify hotspots and trends before they become critical problems." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-3xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="px-6 py-32 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Measurable Impact</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We're changing how cities operate by creating a transparent, accountable, and gamified experience for civic engagement.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-black text-primary mb-2">12k+</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Issues Resolved</div>
                </div>
                <div>
                  <div className="text-5xl font-black text-primary mb-2">45k</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Citizens</div>
                </div>
                <div>
                  <div className="text-5xl font-black text-primary mb-2">180</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Communities</div>
                </div>
                <div>
                  <div className="text-5xl font-black text-primary mb-2">4.9/5</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">App Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl transform rotate-3 scale-105 -z-10 blur-xl"></div>
              <div className="bg-background border border-border rounded-3xl p-8 shadow-2xl relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-bold text-xl">S</div>
                  <div>
                    <h4 className="font-bold">Sarah Jenkins</h4>
                    <p className="text-sm text-muted-foreground">Community Verifier • Level 4</p>
                  </div>
                </div>
                <p className="text-lg italic leading-relaxed mb-6">
                  "Since we started using Community Hero AI, the massive pothole on 4th street that went ignored for months was fixed in 3 days. The gamification makes it actually fun to report things!"
                </p>
                <div className="flex gap-2 text-primary">
                  <CheckCircle size={20} /> <CheckCircle size={20} /> <CheckCircle size={20} /> <CheckCircle size={20} /> <CheckCircle size={20} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border bg-accent/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldCheck className="text-primary" />
            Community Hero AI
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Community Hero AI.
          </div>
        </div>
      </footer>
    </div>
  )
}

