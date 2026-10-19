'use client'

import { useRouter } from 'next/navigation'

export default function StaffDashboard() {
  const router = useRouter()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-[#FF6B00] mb-4">Staff Dashboard</h1>
      <p className="text-xl text-gray-700 mb-8">Welcome Haroon! Your account is approved.</p>
      <button 
        onClick={handleLogout} 
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg transition"
      >
        Logout
      </button>
    </div>
  )
}