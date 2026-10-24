import axios from 'axios'

const api = axios.create({
  baseURL: 'https://oven-grill-cafe-production.up.railway.app/api', // <-- Apna Railway URL daalen
  headers: { 'Content-Type': 'application/json' },
})

// Automatically add token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api