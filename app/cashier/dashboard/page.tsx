'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface OrderItem { id: string; name: string; qty: number; price: number }
interface Order {
  id: string; orderNumber: string; customerName: string; type: string; 
  status: string; total: number; paymentStatus: string; createdAt: string; items: OrderItem[]
}

export default function CashierDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return router.push('/login')
      
      const res = await api.get('/cashier/orders')
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
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [router])

  const markAsPaid = async (id: string) => {
    try {
      await api.patch(`/cashier/orders/${id}/pay`)
      alert('Payment received and marked as PAID!')
      fetchOrders()
    } catch (err) { alert('Failed to update payment') }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (loading) return <div className="text-center mt-20 text-2xl font-bold text-[#FF6B00]">Loading Cashier Panel...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#FF6B00]">Oven Grill Cafe - Cashier</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
          Logout
        </button>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Billing & Payments</h2>
          <p className="text-gray-500 text-sm">Manage customer bills and payments</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No orders to bill right now.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Order No</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Order Status</th>
                  <th className="px-6 py-4 text-left">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">{order.orderNumber}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4 font-bold text-[#FF6B00]">Rs. {order.total.toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'DELIVERED' || order.status === 'SERVED' ? 'bg-green-100 text-green-700' : 
                        order.status === 'PLACED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      
                      {/* Bill Print Button */}
                      <button 
                        onClick={() => router.push(`/bill/${order.id}`)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition"
                      >
                        Print Bill 🧾
                      </button>

                      {/* Mark as Paid Button */}
                      {order.paymentStatus !== 'PAID' && (
                        <button 
                          onClick={() => markAsPaid(order.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                        >
                          Mark as Paid 💵
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}