import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh') &&
      !originalRequest?.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true
      try {
        const response = await api.post('/auth/refresh')
        const token = response.data.access_token
        setAccessToken(token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch {
        setAccessToken(null)
        window.dispatchEvent(new Event('auth-unauthorized'))
      }
    } else if (error.response?.status === 401) {
      setAccessToken(null)
      window.dispatchEvent(new Event('auth-unauthorized'))
    }
    return Promise.reject(error)
  },
)

export default api
