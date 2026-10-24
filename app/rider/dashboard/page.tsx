'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface OrderItem { id: string; name: string; qty: number }
interface Order {
  id: string; orderNumber: string; customerName: string; customerPhone: string;
  address: string; status: string; items: OrderItem[]
}

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return router.push('/login')
      const res = await api.get('/rider/orders')
      setOrders(res.data)
    } catch (err: any) {
      if (err.response?.status === 401) { localStorage.clear(); router.push('/login') }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [router])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'DELIVERED') {
        await api.post(`/rider/orders/${id}/complete`)
        alert('Order Delivered! Customer and Admin have been notified.')
      } else {
        await api.patch(`/rider/orders/${id}/status`, { status: newStatus })
      }
      fetchOrders()
    } catch (err) { alert('Failed to update status') }
  }

  // 🔥 Live Tracking Logic
  const startLiveTracking = (orderId: string) => {
    updateStatus(orderId, 'ON_THE_WAY')

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Har 5 second mein location backend ko bhejen
          api.patch(`/rider/orders/${orderId}/location`, { lat: latitude, lng: longitude })
             .catch(err => console.log('Location send failed', err))
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  if (loading) return <div className="text-center mt-20 text-2xl font-bold text-[#FF6B00]">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold text-[#FF6B00]">Rider Panel</h1>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="bg-red-600 px-4 py-2 rounded-lg">Logout</button>
      </nav>

      <div className="p-8 max-w-6xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow text-center">
            <h3 className="text-2xl font-bold text-gray-700">No Delivery Orders</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order.id} className={`bg-white rounded-xl shadow-md p-6 border-t-8 flex flex-col ${
                order.status === 'READY' ? 'border-blue-500' : 
                order.status === 'PICKED_UP' ? 'border-yellow-500' : 'border-green-500'
              }`}>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">{order.orderNumber}</h3>
                <p className="text-sm font-semibold text-gray-500 mb-4">{order.status}</p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm border border-gray-100">
                  <p className="font-bold text-gray-800 mb-1">{order.customerName}</p>
                  <p className="text-gray-600 mb-2">📞 {order.customerPhone}</p>
                  <p className="text-gray-600">📍 {order.address}</p>
                </div>

                <div className="mt-auto">
                  {order.status === 'READY' && (
                    <button onClick={() => updateStatus(order.id, 'PICKED_UP')} className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg">Pick Up Order 🛍️</button>
                  )}
                  {order.status === 'PICKED_UP' && (
                    <button onClick={() => startLiveTracking(order.id)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Start Journey 🛵</button>
                  )}
                  {order.status === 'ON_THE_WAY' && (
                    <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg">Mark as Delivered ✅</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}