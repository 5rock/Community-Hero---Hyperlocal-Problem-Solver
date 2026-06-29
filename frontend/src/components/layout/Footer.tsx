import { Link } from 'react-router-dom'
import { ShieldCheck, Mail, Github, Linkedin, Globe, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-2xl tracking-tighter mb-4"
            >
              <ShieldCheck className="text-primary w-8 h-8" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Hero AI
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Empowering communities to report, verify, and resolve local issues together. Transform
              your neighborhood with the power of artificial intelligence.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Subscribe to our newsletter</h3>
              <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-accent/50 border-border/50 focus:border-primary/50"
                  required
                />
                <Button type="submit" size="sm" className="px-3" aria-label="Subscribe">
                  <ArrowRight size={18} />
                </Button>
              </form>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/#features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/report" className="hover:text-primary transition-colors">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link to="/dashboard/map" className="hover:text-primary transition-colors">
                  Community Map
                </Link>
              </li>
              <li>
                <Link to="/#ai-insights" className="hover:text-primary transition-colors">
                  AI Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:hello@heroai.com"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail size={16} /> hello@heroai.com
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Github size={16} /> GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Linkedin size={16} /> LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Globe size={16} /> Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row items-center gap-2">
            <span>© {new Date().getFullYear()} Community Hero AI. All rights reserved.</span>
            <span className="hidden sm:inline text-border">•</span>
            <span>v1.2.0</span>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart size={14} className="text-red-500 fill-red-500 mx-1" /> for the
            community
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              aria-label="Community Hero AI on GitHub"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="https://linkedin.com"
              aria-label="Community Hero AI on LinkedIn"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
