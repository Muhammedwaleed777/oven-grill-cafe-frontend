'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { getCart, removeFromCart, getCartTotal, CartItem, addToCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setCart(getCart())
    setMounted(true)

    const handleUpdate = () => setCart(getCart())
    window.addEventListener('cartUpdated', handleUpdate)
    return () => window.removeEventListener('cartUpdated', handleUpdate)
  }, [])

  const handleRemove = (id: string) => {
    removeFromCart(id)
    setCart(getCart())
  }

  const increaseQty = (item: CartItem) => {
    addToCart({ id: item.id, name: item.name, price: item.price })
    setCart(getCart())
  }

  const decreaseQty = (id: string) => {
    const currentCart = getCart()
    const item = currentCart.find(i => i.id === id)
    
    if (item && item.qty > 1) {
      const updatedCart = currentCart.map(i => 
        i.id === id ? { ...i, qty: i.qty - 1 } : i
      )
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      window.dispatchEvent(new Event('cartUpdated'))
    } else {
      removeFromCart(id)
    }
    setCart(getCart())
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const total = getCartTotal()

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
        
        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
            <button onClick={() => router.push('/')} className="bg-[#FF6B00] text-white px-8 py-3 rounded-lg font-bold">
              Go to Menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center p-6 border-b last:border-0 hover:bg-gray-50 transition">
                
                <div className="flex-grow mb-4 sm:mb-0 w-full">
                  <h3 className="font-bold text-xl text-[#1A1A1A]">{item.name}</h3>
                  <p className="text-[#FF6B00] font-semibold mt-1">Rs. {item.price}</p>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-gray-100 rounded-lg border">
                    <button onClick={() => decreaseQty(item.id)} className="px-4 py-2 text-xl font-bold text-gray-600 hover:text-red-500 transition">-</button>
                    <span className="px-4 py-2 font-bold bg-white border-x">{item.qty}</span>
                    <button onClick={() => increaseQty(item)} className="px-4 py-2 text-xl font-bold text-gray-600 hover:text-green-500 transition">+</button>
                  </div>

                  <div className="text-right w-24">
                    <span className="font-bold text-lg">Rs. {item.price * item.qty}</span>
                  </div>

                  <button onClick={() => handleRemove(item.id)} className="text-red-500 font-semibold text-sm hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-gray-500 text-sm">Total Amount</p>
                <h2 className="text-3xl font-bold text-[#FF6B00]">Rs. {total}</h2>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full sm:w-auto bg-[#1A1A1A] text-white font-bold py-4 px-10 rounded-lg hover:bg-black transition text-lg shadow-md"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}