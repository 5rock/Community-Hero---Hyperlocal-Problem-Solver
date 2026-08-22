import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { MapPin, Zap, Users, Activity, BarChart3, ArrowRight } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative px-6 py-32 md:py-48 flex flex-col items-center text-center max-w-6xl mx-auto overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse"></div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 text-sm font-medium mb-8 border border-border hover:border-primary/50 transition-colors cursor-default backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Now live in your city
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
                Empowering Communities
                <br />
                Through AI
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                Report, verify, and solve local issues together. Transform your neighborhood with
                the power of artificial intelligence and community collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/dashboard/report">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    Report Issue
                  </Button>
                </Link>
                <Link to="/dashboard/map">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full gap-2 hover:bg-accent transition-all duration-300"
                  >
                    <MapPin size={20} />
                    Explore Map
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section id="features" className="px-6 py-24 bg-accent/30 border-y border-border">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                  Intelligent Platform
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Built from the ground up to make reporting and resolving civic issues
                  frictionless.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Zap size={28} />,
                    title: 'AI Categorization',
                    desc: 'Instantly routes and classifies your reports using advanced Gemini AI.',
                  },
                  {
                    icon: <Users size={28} />,
                    title: 'Community Verification',
                    desc: 'Trust scores powered by local residents confirming actual problems.',
                  },
                  {
                    icon: <Activity size={28} />,
                    title: 'Live Tracking',
                    desc: 'Follow the lifecycle of an issue from report to final resolution.',
                  },
                  {
                    icon: <BarChart3 size={28} />,
                    title: 'Predictive Insights',
                    desc: 'Identify hotspots and trends before they become critical problems.',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-background border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 text-primary">
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

          {/* How It Works Section */}
          <section id="how-it-works" className="px-6 py-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">How It Works</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  A simple, transparent process to get things done.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10"></div>
                {[
                  {
                    step: 1,
                    title: 'Snap & Report',
                    desc: 'Take a photo and briefly describe the issue. Our AI automatically extracts location and category.',
                  },
                  {
                    step: 2,
                    title: 'Community Verify',
                    desc: 'Locals confirm the issue to prevent spam and prioritize urgent problems automatically.',
                  },
                  {
                    step: 3,
                    title: 'City Resolves',
                    desc: "Verified reports are routed to the right department. You get live updates until it's fixed.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-primary text-primary text-2xl font-bold flex items-center justify-center mb-6 shadow-xl shadow-primary/10 relative z-10">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-6 py-32 bg-primary text-primary-foreground text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Ready to make an impact?
              </h2>
              <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 font-light">
                Join thousands of citizens who are actively improving their neighborhoods every day.
              </p>
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-10 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform text-primary font-bold gap-2"
                >
                  Join the Movement <ArrowRight size={20} />
                </Button>
              </Link>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
