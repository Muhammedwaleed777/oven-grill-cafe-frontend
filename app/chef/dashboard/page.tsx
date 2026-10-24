'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface OrderItem { id: string; name: string; qty: number }
interface Order {
  id: string; orderNumber: string; customerName: string; customerPhone: string;
  type: string; status: string; createdAt: string; items: OrderItem[]
}

export default function ChefDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
 const [timeNow, setTimeNow] = useState(0)
  const router = useRouter()
  
  // Sound bajane ke liye ref
  const prevOrdersCount = useRef(0)

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return router.push('/login')
      
      const res = await api.get('/chef/orders')
      
      // 🔥 Agar naya order aaya hai to sound bajayen
      const placedOrders = res.data.filter((o: Order) => o.status === 'PLACED')
      if (placedOrders.length > prevOrdersCount.current && prevOrdersCount.current !== 0) {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
        audio.play().catch(e => console.log('Audio play failed', e))
      }
      prevOrdersCount.current = placedOrders.length

      setOrders(res.data)
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear()
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

   useEffect(() => {
    fetchOrders()
    setTimeNow(Date.now()) // <-- Yeh line add karen
    
    // Har 10 second baad naye orders check karen
    const interval = setInterval(fetchOrders, 10000)
    
    // Har 1 minute baad timer update karen
    const timerInterval = setInterval(() => setTimeNow(Date.now()), 60000)
    
    return () => {
      clearInterval(interval)
      clearInterval(timerInterval)
    }
  }, [router])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/chef/orders/${id}/status`, { status: newStatus })
      fetchOrders()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  // Order ka time calculate karen
  const getWaitTime = (createdAt: string) => {
    const diff = Math.floor((timeNow - new Date(createdAt).getTime()) / 60000)
    if (diff < 1) return 'Just now'
    return `${diff} mins ago`
  }

  if (loading) return <div className="text-center mt-20 text-2xl font-bold text-[#FF6B00]">Loading Kitchen Orders...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#FF6B00]">Oven Grill Cafe - Kitchen</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
          Logout
        </button>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Live Orders</h2>
          <p className="text-gray-500 text-sm">Auto-refreshes every 10 seconds</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow text-center">
            <p className="text-4xl mb-4">🧑‍🍳</p>
            <h3 className="text-2xl font-bold text-gray-700">Kitchen is Clear!</h3>
            <p className="text-gray-500">No active orders right now. Waiting for new orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
              const waitTime = getWaitTime(order.createdAt)
              const waitMinutes = Math.floor((timeNow - new Date(order.createdAt).getTime()) / 60000)
              const isLate = waitMinutes > 15 && order.status !== 'READY'

              return (
                <div key={order.id} className={`bg-white rounded-xl shadow-md p-6 border-t-8 flex flex-col ${
                  order.status === 'PLACED' ? 'border-blue-500' : 
                  order.status === 'COOKING' ? 'border-yellow-500' : 'border-green-500'
                }`}>
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-[#1A1A1A]">{order.orderNumber}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      order.status === 'PLACED' ? 'bg-blue-100 text-blue-700' : 
                      order.status === 'COOKING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Timer and Type */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                      {order.type === 'DELIVERY' ? '🛵 Delivery' : order.type === 'DINE_IN' ? '🍽️ Dine In' : '🛍️ Takeaway'}
                    </span>
                    <span className={`font-bold ${isLate ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
                      ⏱️ {waitTime} {isLate && '(LATE!)'}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 flex-grow border border-gray-100">
                    <ul className="space-y-3">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                          <span className="bg-[#FF6B00] text-white font-bold px-3 py-1 rounded-lg text-lg">x {item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto">
                    {order.status === 'PLACED' && (
                      <button onClick={() => updateStatus(order.id, 'COOKING')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition text-lg shadow-md">
                        Start Cooking 🍳
                      </button>
                    )}
                    {order.status === 'COOKING' && (
                      <button onClick={() => updateStatus(order.id, 'READY')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition text-lg shadow-md">
                        Mark as Ready ✅
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <div className="w-full text-center text-green-700 bg-green-100 font-bold py-3 rounded-lg border border-green-200">
                        Ready for Pickup / Serving
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}