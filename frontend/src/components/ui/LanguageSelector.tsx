import { useState } from 'react'
import { Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
]

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(languages[0])

  return (
    <div className="relative z-40">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
        title="Select Language"
      >
        <Globe size={16} />
        <span className="text-xs hidden md:inline-block font-semibold">
          {currentLang.code.toUpperCase()}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-12 right-0 w-40 bg-background border border-border rounded-xl shadow-xl overflow-hidden origin-top-right"
          >
            {languages.map((lang, idx) => (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang)
                  setIsOpen(false)
                  // In a real app, this would trigger i18next changeLanguage
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors ${
                  currentLang.code === lang.code ? 'bg-primary/10 text-primary font-bold' : ''
                }`}
              >
                {lang.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
