'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'

export default function BillPage() {
  const router = useRouter()
  const [bill, setBill] = useState<any>(null)

  useEffect(() => {
    const savedBill = localStorage.getItem('currentBill')
    if (savedBill) {
      setBill(JSON.parse(savedBill))
    } else {
      router.push('/admin/orders')
    }
  }, [router])

  if (!bill) return <div className="text-center mt-20 text-2xl font-bold text-[#FF6B00]">Loading Bill...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full border-t-8 border-[#FF6B00]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">{bill.restaurantName}</h1>
          <p className="text-gray-500 text-sm mt-1">Delicious Food, Freshly Made</p>
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-4 border-b pb-2">
          <div>
            <p className="font-bold text-black">Order: {bill.orderNumber}</p>
            <p>Customer: {bill.customer.name}</p>
          </div>
          <div className="text-right">
            <p>{new Date(bill.date).toLocaleDateString()}</p>
            <p>{bill.customer.phone}</p>
          </div>
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="border-b text-left text-gray-500 text-sm">
              <th className="pb-2">Item</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item: any) => (
              <tr key={item.id} className="text-sm border-b">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center">{item.qty}</td>
                <td className="py-2 text-right">Rs. {item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-sm text-gray-700 border-b pb-4 mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (16%)</span>
            <span>Rs. {bill.gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-[#FF6B00] mt-2">
            <span>Total</span>
            <span>Rs. {bill.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col items-center mt-6">
          <p className="text-xs text-gray-500 mb-2">Scan to view digital bill</p>
          <div className="p-2 bg-white border rounded-lg">
             <QRCode value={`${window.location.origin}/bill`} size={100} />
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">Thank you for dining with us!</p>
        </div>
        
        <div className="mt-8 text-center">
          <button onClick={() => router.push('/admin/orders')} className="text-[#FF6B00] font-bold hover:underline">
            ← Back to Orders
          </button>
        </div>

      </div>
    </div>
  )
}