export interface NotificationPayload {
  title: string
  message: string
  type: 'INFO' | 'ALERT' | 'SUCCESS' | 'WARNING'
}

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listeners: ((payload: NotificationPayload) => void)[] = []

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return

    // Replace http/https with ws/wss
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    this.url = `${baseUrl.replace(/^http/, 'ws')}/api/ws/${token}`

    this.initWebSocket()
  }

  private initWebSocket() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const payload: NotificationPayload = JSON.parse(event.data)
        this.listeners.forEach((listener) => listener(payload))
      } catch (err) {
        console.error('Failed to parse WebSocket message', err)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(
          () => {
            this.reconnectAttempts++
            this.initWebSocket()
          },
          1000 * Math.pow(2, this.reconnectAttempts),
        )
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.ws?.close()
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }

  subscribe(listener: (payload: NotificationPayload) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }
}

export const wsService = new WebSocketService()
