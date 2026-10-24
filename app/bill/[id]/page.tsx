'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import QRCode from 'react-qr-code'

function BillComponent() {
  const pathname = usePathname()
  const id = pathname ? pathname.split('/').pop() : null
  
  const [bill, setBill] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      api.get(`/bill/${id}`)
        .then(res => setBill(res.data))
        .catch(() => alert('Bill not found'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handlePrint = async () => {
    const qz = (window as any).qz;
    if (!qz) {
      alert('QZ Tray software install nahi hai ya chal nahi raha. Please install and start QZ Tray from qz.io');
      return;
    }

    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      const printers = await qz.printers.find();
      if (printers.length === 0) {
        alert('Koi printer nahi mila. Please apna Thermal Printer connect karen.');
        return;
      }
      const printerName = printers[0];

      let printData = `
      OVEN GRILL CAFE
      Delicious Food, Freshly Made
      Tel: 03484974289
      ----------------------------------
      Order: ${bill.orderNumber}
      Name: ${bill.customer.name}
      Date: ${new Date(bill.date).toLocaleString()}
      ----------------------------------
      `;

      bill.items.forEach((item: any) => {
        printData += `${item.name} x ${item.qty}    Rs. ${item.price * item.qty}\n`;
      });

      printData += `
      ----------------------------------
      Total:    Rs. ${bill.total.toFixed(2)}
      ----------------------------------
      Thank you for dining with us!
      `;

      const config = qz.configs.create(printerName);
      await qz.print(config, [printData]);
      alert('Bill sent to printer successfully!');
    } catch (err) {
      console.error(err);
      alert('Printing failed. Please check if QZ Tray is running and printer is connected.');
    }
  };

  if (loading) return <div className="text-center mt-20 text-2xl font-bold text-[#FF6B00] print:hidden">Loading Bill...</div>
  if (!bill) return <div className="text-center mt-20 text-xl text-red-500 print:hidden">Bill Not Found</div>

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { margin: 0; padding: 0; background: white; }
          .print-container { width: 80mm !important; padding: 5px !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center print:bg-white print:p-0 print:min-h-0">
        <div className="print-container bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-8 border-[#FF6B00] print:border-none print:max-w-none">
          
          <div className="text-center mb-4 border-b border-dashed pb-4">
            <h1 className="text-2xl font-bold text-[#1A1A1A] uppercase">Oven Grill Cafe</h1>
            <p className="text-gray-500 text-xs mt-1">Delicious Food, Freshly Made</p>
            <p className="text-gray-500 text-xs">Tel: 03484974289</p>
          </div>

          <div className="flex justify-between text-xs text-gray-600 mb-4 border-b border-dashed pb-2">
            <div>
              <p>Order: <b>{bill.orderNumber}</b></p>
              <p>Name: {bill.customer.name}</p>
            </div>
            <div className="text-right">
              <p>{new Date(bill.date).toLocaleDateString()}</p>
              <p>{bill.customer.phone}</p>
            </div>
          </div>

          <table className="w-full mb-4 text-xs">
            <thead>
              <tr className="border-b border-dashed text-left text-gray-500">
                <th className="pb-1">Item</th>
                <th className="pb-1 text-center">Qty</th>
                <th className="pb-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-1">{item.name}</td>
                  <td className="py-1 text-center">{item.qty}</td>
                  <td className="py-1 text-right">Rs. {item.price * item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-xs text-gray-700 border-b border-dashed pb-3 mb-3">
            <div className="flex justify-between font-bold text-sm mt-1 pt-1">
              <span>Total</span>
              <span>Rs. {bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center mt-4">
            <div className="p-1 bg-white border rounded">
              {typeof window !== 'undefined' && id && (
                <QRCode value={`${window.location.origin}/bill/${id}`} size={80} />
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Scan for digital bill</p>
            <p className="text-[10px] text-gray-500 mt-1 text-center font-bold">Thank you for dining with us!</p>
          </div>

          <div className="mt-8 no-print">
            <button onClick={handlePrint} className="w-full bg-[#1A1A1A] text-white font-bold py-3 rounded-lg hover:bg-black transition flex justify-center items-center gap-2">
              🖨️ Print Bill (Direct Printer)
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default function BillPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-2xl font-bold">Loading...</div>}>
      <BillComponent />
    </Suspense>
  )
}