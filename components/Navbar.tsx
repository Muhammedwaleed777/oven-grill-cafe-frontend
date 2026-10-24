'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const updateCount = () => setCartCount(getCart().reduce((sum, item) => sum + item.qty, 0))
    updateCount()
    
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))

    window.addEventListener('cartUpdated', updateCount)
    return () => window.removeEventListener('cartUpdated', updateCount)
  }, [])

  const handleLogout = async () => {
    try { 
      await api.post('/auth/logout') 
    } catch (e) {
      console.log('Logout failed')
    }
    localStorage.clear()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-[#1A1A1A] text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#FF6B00]">
          Oven Grill Cafe
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Home Link */}
          <Link href="/" className="hover:text-[#FF6B00] transition font-medium hidden md:block">Home</Link>
          
          {/* 🔥 Track Order Link (Yeh naya add kiya hai) */}
          <Link href="/order" className="hover:text-[#FF6B00] transition font-medium hidden md:block">Track Order</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">Hi, {user.name}</span>
              
              {user.role === 'ADMIN' && <Link href="/admin/dashboard" className="text-[#FF6B00] font-bold text-sm bg-[#FF6B00]/10 px-3 py-1 rounded">Admin Panel</Link>}
              {user.role === 'CHEF' && <Link href="/chef/dashboard" className="text-[#FF6B00] font-bold text-sm bg-[#FF6B00]/10 px-3 py-1 rounded">Chef Panel</Link>}
              {user.role === 'CASHIER' && <Link href="/cashier/dashboard" className="text-[#FF6B00] font-bold text-sm bg-[#FF6B00]/10 px-3 py-1 rounded">Cashier Panel</Link>}
              {user.role === 'STAFF' && <Link href="/staff/dashboard" className="text-[#FF6B00] font-bold text-sm bg-[#FF6B00]/10 px-3 py-1 rounded">Staff Panel</Link>}
              {user.role === 'RIDER' && <Link href="/rider/dashboard" className="text-[#FF6B00] font-bold text-sm bg-[#FF6B00]/10 px-3 py-1 rounded">Rider Panel</Link>}

              <button onClick={handleLogout} className="text-sm hover:text-red-500 transition">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-[#FF6B00] transition font-medium">Login</Link>
          )}

          {/* Cart Button */}
          <Link href="/cart" className="bg-[#FF6B00] hover:bg-[#e55f00] text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2">
            🛒 Cart ({cartCount})
          </Link>
        </div>
      </div>
    </nav>
  )
}