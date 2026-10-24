'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { phone, password })
      
      // Token aur User save karen
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      // 🔥 Role ke hisaab se sahi dashboard par bhejen
      const role = res.data.user.role
      
      if (role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (role === 'CHEF') {
        router.push('/chef/dashboard')
      } else if (role === 'RIDER') {
        router.push('/rider/dashboard')
      } else if (role === 'CASHIER') {
        router.push('/cashier/dashboard')
      } else if (role === 'STAFF') {
        router.push('/staff/dashboard')
      } else {
        // Customer ko main menu par bhejen
        router.push('/')
      }
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Login to Oven Grill Cafe</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              placeholder="03XXXXXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Are you a customer? <a href="/" className="text-[#FF6B00] font-bold hover:underline">Go to Home</a>
        </div>
      </div>
    </main>
  )
}