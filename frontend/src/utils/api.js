import axios from 'axios'
import { getToken, clearAuth } from './auth'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
}

export const dataAPI = {
  logData: (data) => api.post('/api/data/log', data),
  getHistory: (days = 7) => api.get(`/api/data/history?days=${days}`),
  getSummary: () => api.get('/api/data/summary'),
}

export default api
