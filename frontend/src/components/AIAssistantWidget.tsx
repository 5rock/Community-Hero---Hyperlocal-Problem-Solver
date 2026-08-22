import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

// Note: Ensure the JWT token can be fetched from cookies or localStorage
function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your Community Hero AI. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const location = useLocation()
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  // Speech Recognition
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  if (recognition) {
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput((prev) => prev + ' ' + transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const toggleListen = () => {
    if (!recognition) return alert('Speech recognition not supported in this browser.')
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  // WebSocket Connection
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      // Connect WS
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host =
        window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host
      const ws = new WebSocket(`${protocol}//${host}/api/ai/ws/chat`)

      ws.onopen = () => {
        // We must fetch the token (either access_token cookie or some local storage depending on setup)
        // The prompt says token is sent on first msg
        const token = getCookie('access_token') || localStorage.getItem('access_token') || ''
        ws.send(JSON.stringify({ token }))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'chunk') {
          setIsStreaming(true)
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg && lastMsg.role === 'assistant' && prev.length > 1) {
              return [
                ...prev.slice(0, -1),
                { role: 'assistant', content: lastMsg.content + data.text },
              ]
            } else {
              return [...prev, { role: 'assistant', content: data.text }]
            }
          })
        } else if (data.type === 'end') {
          setIsStreaming(false)
        } else if (data.type === 'error') {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `**Error**: ${data.message}` },
          ])
          setIsStreaming(false)
        }
      }

      ws.onclose = () => {
        wsRef.current = null
      }

      wsRef.current = ws
    }

    return () => {
      if (wsRef.current && !isOpen) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [isOpen])

  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const msg = input.trim()
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: msg },
      { role: 'assistant', content: '' },
    ])
    setInput('')

    wsRef.current.send(
      JSON.stringify({
        message: msg,
        context: location.pathname,
      }),
    )
  }

  const quickActions = ['Report Issue', 'Dashboard Summary', 'Government Schemes']

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-transform"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={clsx(
              'flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-background/80 backdrop-blur-xl shadow-2xl transition-all',
              isExpanded
                ? 'fixed inset-4 md:inset-10 z-50'
                : 'absolute bottom-16 right-0 w-[350px] h-[500px]',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Community AI</h3>
                  <p className="text-xs text-muted-foreground">Context-Aware Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={clsx(
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted/80 backdrop-blur-sm rounded-bl-none prose prose-sm dark:prose-invert',
                    )}
                  >
                    {m.role === 'user' ? (
                      m.content
                    ) : m.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      <div className="flex space-x-1 items-center h-4">
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => setInput(action)}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border/50 p-3 bg-background/50">
              <div className="flex items-center gap-2 rounded-full border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                <button
                  onClick={toggleListen}
                  className={clsx(
                    'p-1.5 rounded-full transition-colors',
                    isListening
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  title="Voice Input"
                >
                  {isListening ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-2 text-sm outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
