'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)

    try {
      const res = await api.get(`/track-order/${orderNumber.toUpperCase()}`)
      setOrder(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8 mt-10">
        
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2 text-[#1A1A1A]">Track Your Order</h1>
          <p className="text-gray-500 text-center mb-8">Enter your Order Number (e.g., OGC-1234) to see the live status.</p>
          
          <form onSubmit={handleTrack} className="flex gap-2">
            <input 
              type="text" 
              placeholder="OGC-XXXX" 
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="flex-grow border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:border-[#FF6B00] font-mono text-lg"
              required
            />
            <button type="submit" disabled={loading} className="bg-[#FF6B00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e55f00] transition text-lg">
              {loading ? '...' : 'Track'}
            </button>
          </form>

          {error && <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-semibold">{error}</div>}

          {order && (
            <div className="mt-10 border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Order {order.orderNumber}</h2>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="font-bold mb-4 text-gray-700">Order Items:</h3>
                <ul className="space-y-3">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b pb-2">
                      <span>{item.name} <span className="text-gray-400">x {item.qty}</span></span>
                      <span className="font-semibold">Rs. {item.price * item.qty}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-[#FF6B00]">Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}