'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cart'
import api from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'DELIVERY',
    address: '',
  })

  useEffect(() => {
    setCart(getCart())
    setMounted(true)
  }, [])

  const subtotal = getCartTotal()
  const total = subtotal // GST hata diya, Total = Subtotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Cart is empty')
    if (formData.type === 'DELIVERY' && !formData.address) return alert('Please enter address')

    setLoading(true)
    try {
      // Order Place karen (Cash on Delivery)
      const res = await api.post('/orders', {
        customerName: formData.name,
        customerPhone: formData.phone,
        type: formData.type,
        address: formData.address,
        paymentMethod: 'CASH',
        items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty }))
      })
      
      clearCart()
      alert(`Order Placed Successfully!\nOrder Number: ${res.data.order.orderNumber}`)
      router.push(`/order/${res.data.order.id}`) 
      
    } catch (err: any) {
      alert('Error placing order: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button onClick={() => router.push('/')} className="bg-[#FF6B00] text-white px-6 py-2 rounded">
            Go back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] outline-none" placeholder="Muhammad Waleed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] outline-none" placeholder="03XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] outline-none">
                <option value="DELIVERY">Delivery</option>
                <option value="TAKEAWAY">Takeaway</option>
                <option value="DINE_IN">Dine In</option>
              </select>
            </div>
            {formData.type === 'DELIVERY' && (
              <div>
                <label className="block text-sm font-medium mb-1">Complete Address</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] outline-none" rows={3} placeholder="House #, Street, Area" />
              </div>
            )}
            
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mt-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when your food arrives.</p>
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#FF6B00] text-white font-bold py-4 rounded-lg hover:bg-[#e55f00] mt-6 text-lg shadow-md transition">
              {loading ? 'Processing...' : `Place Order (Rs. ${total.toFixed(0)})`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-gray-700 border-b pb-2">
                <span>{item.name} <span className="text-gray-400">x {item.qty}</span></span>
                <span className="font-semibold">Rs. {item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between font-bold text-2xl text-[#FF6B00] mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}