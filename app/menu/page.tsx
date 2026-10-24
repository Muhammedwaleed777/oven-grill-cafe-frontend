'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/menu')
      .then(res => setMenu(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-20 text-2xl">Loading Menu...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#1A1A1A] p-4 text-center">
        <Link href="/" className="text-3xl font-bold text-[#FF6B00]">Oven Grill Cafe</Link>
      </nav>
      
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Our Delicious Menu</h1>
        
        {menu.length === 0 ? (
          <p className="text-center text-gray-500">No items in the menu yet. Admin can add them from the dashboard.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">{item.name}</h2>
                <p className="text-gray-500 mb-4">{item.description || 'Delicious food item'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-[#FF6B00]">Rs. {item.price}</span>
                  <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded hover:bg-black">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}