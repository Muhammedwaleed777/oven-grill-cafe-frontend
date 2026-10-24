'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // States
  const [users, setUsers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Date Filter
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Forms States
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', imageUrl: '', category: '' })
  const [editMenuId, setEditMenuId] = useState('')

  const [dealForm, setDealForm] = useState({ title: '', description: '', price: '', imageUrl: '' })
  const [editDealId, setEditDealId] = useState('')

  const [stockForm, setStockForm] = useState({ name: '', quantity: '', unit: 'kg', minThreshold: '5' })

  const router = useRouter()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setStartDate(lastWeek)
    setEndDate(today)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return router.push('/login')

      const [usersRes, statsRes, ordersRes, menuRes, dealsRes, stockRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get(`/admin/stats?start=${startDate}&end=${endDate}`),
        api.get('/admin/orders'),
        api.get('/admin/menu'),
        api.get('/admin/deals'),
        api.get('/admin/stock')
      ])
      
      setUsers(usersRes.data)
      setStats(statsRes.data)
      setOrders(ordersRes.data)
      setMenuItems(menuRes.data)
      setDeals(dealsRes.data)
      setStock(stockRes.data)
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [startDate, endDate])

  // ═══════════════ ACTIONS ═══════════════
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editMenuId) {
        await api.patch(`/admin/menu/${editMenuId}`, { ...menuForm, price: Number(menuForm.price) })
      } else {
        await api.post('/admin/menu', menuForm)
      }
      setMenuForm({ name: '', description: '', price: '', imageUrl: '', category: '' })
      setEditMenuId('')
      fetchDashboardData()
    } catch (err) { alert('Failed to save menu item') }
  }

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editDealId) {
        await api.patch(`/admin/deals/${editDealId}`, { ...dealForm, price: Number(dealForm.price) })
      } else {
        await api.post('/admin/deals', dealForm)
      }
      setDealForm({ title: '', description: '', price: '', imageUrl: '' })
      setEditDealId('')
      fetchDashboardData()
    } catch (err) { alert('Failed to save deal') }
  }

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/stock', stockForm)
      setStockForm({ name: '', quantity: '', unit: 'kg', minThreshold: '5' })
      fetchDashboardData()
    } catch (err) { alert('Failed to add stock') }
  }

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/approve-user/${id}`)
      fetchDashboardData()
    } catch (err) { alert('Failed to approve user') }
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch(e){}
    localStorage.clear()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <nav className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center shadow-lg mb-8">
        <h1 className="text-2xl font-bold text-[#FF6B00]">Oven Grill Cafe - Admin</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">Logout</button>
      </nav>

      <div className="px-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-2">
          {['overview', 'orders', 'staff', 'menu', 'deals', 'stock'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 font-semibold capitalize rounded-t-lg transition ${activeTab === tab ? 'bg-[#FF6B00] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
             <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
              <span className="font-semibold text-gray-700">Filter Sales:</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded-lg text-sm" />
              <span className="text-gray-500">to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded-lg text-sm" />
              <button onClick={fetchDashboardData} className="bg-[#FF6B00] text-white px-4 py-2 rounded-lg text-sm font-semibold">Apply</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#FF6B00]"><p className="text-gray-500 font-semibold text-sm mb-1">Total Revenue</p><h2 className="text-2xl font-bold">Rs. {stats?.totalSales?.toFixed(0) || '0'}</h2></div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500"><p className="text-gray-500 font-semibold text-sm mb-1">Today's Sale</p><h2 className="text-2xl font-bold">Rs. {stats?.dailySales?.toFixed(0) || '0'}</h2></div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500"><p className="text-gray-500 font-semibold text-sm mb-1">Orders</p><h2 className="text-2xl font-bold">{stats?.totalOrders || 0}</h2></div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500"><p className="text-gray-500 font-semibold text-sm mb-1">Pending Staff</p><h2 className="text-2xl font-bold">{users.filter(u => u.status === 'PENDING').length}</h2></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6">Sales Overview</h2>
              <div className="h-80 w-full">
                {stats?.chartData?.length > 0 && <ResponsiveContainer width="100%" height="100%"><LineChart data={stats.chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" /><YAxis tickFormatter={(val) => `Rs.${val}`} /><Tooltip formatter={(val) => [`Rs. ${val}`, 'Sales']} /><Line type="monotone" dataKey="sales" stroke="#FF6B00" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            <table className="w-full">
              <thead className="bg-gray-50 text-sm"><tr><th className="px-6 py-4 text-left">Order No</th><th className="px-6 py-4 text-left">Customer</th><th className="px-6 py-4 text-left">Total</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="text-gray-700">
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">{order.orderNumber}</td><td className="px-6 py-4">{order.customerName}</td><td className="px-6 py-4 font-bold text-[#FF6B00]">Rs. {order.total.toFixed(0)}</td>
                    <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{order.status}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => router.push(`/bill/${order.id}`)} className="bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm">Generate Bill 🧾</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STAFF */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">Staff Management</h2></div>
            <table className="w-full">
              <thead className="bg-gray-50 text-sm"><tr><th className="px-4 py-4 text-left">Name</th><th className="px-4 py-4 text-left">Role</th><th className="px-4 py-4 text-left">Status</th><th className="px-4 py-4 text-left">Login</th><th className="px-4 py-4 text-left">Logout</th><th className="px-4 py-4 text-right">Action</th></tr></thead>
              <tbody className="text-gray-700 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">{u.name}<br/><span className="text-xs text-gray-500">{u.phone}</span></td>
                    <td className="px-4 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                    <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.status}</span></td>
                    <td className="px-4 py-4 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                    <td className="px-4 py-4 text-xs">{u.lastLogout ? new Date(u.lastLogout).toLocaleString() : 'Never'}</td>
                    <td className="px-4 py-4 text-right">{u.status === 'PENDING' && <button onClick={() => handleApprove(u.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs">Approve</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">{editMenuId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <form onSubmit={handleMenuSubmit} className="space-y-4">
                <input required placeholder="Item Name" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full border p-2 rounded" />
                <input placeholder="Description" value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} className="w-full border p-2 rounded" />
                <input required type="number" placeholder="Price (Rs.)" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full border p-2 rounded" />
                <input placeholder="Category (e.g. Burgers)" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full border p-2 rounded" />
                <input placeholder="Image URL" value={menuForm.imageUrl} onChange={e => setMenuForm({...menuForm, imageUrl: e.target.value})} className="w-full border p-2 rounded" />
                <button type="submit" className="w-full bg-[#FF6B00] text-white font-bold py-2 rounded">{editMenuId ? 'Update Item' : 'Add Item'}</button>
                {editMenuId && <button type="button" onClick={() => {setEditMenuId(''); setMenuForm({name:'',description:'',price:'',imageUrl:'',category:''});}} className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded mt-2">Cancel</button>}
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm"><tr><th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-left">Price</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody className="text-gray-700">
                  {menuItems.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 flex items-center gap-3">
                        {item.imageUrl ? <img src={item.imageUrl} className="w-10 h-10 rounded object-cover"/> : <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">🍔</div>}
                        <div><p className="font-semibold">{item.name}</p><p className="text-xs text-gray-500">{item.description}</p></div>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#FF6B00]">Rs. {item.price}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => {setMenuForm(item); setEditMenuId(item.id)}} className="text-blue-600 font-semibold text-sm">Edit</button>
                        <button onClick={async () => { if(confirm('Delete?')){ await api.delete(`/admin/menu/${item.id}`); fetchDashboardData() } }} className="text-red-600 font-semibold text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEALS MANAGEMENT */}
        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">{editDealId ? 'Edit Deal' : 'Add New Deal'}</h2>
              <form onSubmit={handleDealSubmit} className="space-y-4">
                <input required placeholder="Deal Title (e.g. Family Deal)" value={dealForm.title} onChange={e => setDealForm({...dealForm, title: e.target.value})} className="w-full border p-2 rounded" />
                <input placeholder="Description" value={dealForm.description} onChange={e => setDealForm({...dealForm, description: e.target.value})} className="w-full border p-2 rounded" />
                <input required type="number" placeholder="Price (Rs.)" value={dealForm.price} onChange={e => setDealForm({...dealForm, price: e.target.value})} className="w-full border p-2 rounded" />
                <input placeholder="Image URL" value={dealForm.imageUrl} onChange={e => setDealForm({...dealForm, imageUrl: e.target.value})} className="w-full border p-2 rounded" />
                <button type="submit" className="w-full bg-[#FF6B00] text-white font-bold py-2 rounded">{editDealId ? 'Update Deal' : 'Add Deal'}</button>
                {editDealId && <button type="button" onClick={() => {setEditDealId(''); setDealForm({title:'',description:'',price:'',imageUrl:''});}} className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded mt-2">Cancel</button>}
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm"><tr><th className="px-4 py-3 text-left">Deal</th><th className="px-4 py-3 text-left">Price</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody className="text-gray-700">
                  {deals.map(deal => (
                    <tr key={deal.id} className="border-b">
                      <td className="px-4 py-3 flex items-center gap-3">
                        {deal.imageUrl ? <img src={deal.imageUrl} className="w-10 h-10 rounded object-cover"/> : <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">🎁</div>}
                        <div><p className="font-semibold">{deal.title}</p><p className="text-xs text-gray-500">{deal.description}</p></div>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#FF6B00]">Rs. {deal.price}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => {setDealForm(deal); setEditDealId(deal.id)}} className="text-blue-600 font-semibold text-sm">Edit</button>
                        <button onClick={async () => { if(confirm('Delete?')){ await api.delete(`/admin/deals/${deal.id}`); fetchDashboardData() } }} className="text-red-600 font-semibold text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STOCK MANAGEMENT */}
        {activeTab === 'stock' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">Add New Stock</h2>
              <form onSubmit={handleStockSubmit} className="space-y-4">
                <input required placeholder="Item Name (e.g. Chicken Patties)" value={stockForm.name} onChange={e => setStockForm({...stockForm, name: e.target.value})} className="w-full border p-2 rounded" />
                <div className="flex gap-2">
                  <input required type="number" placeholder="Qty" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} className="w-full border p-2 rounded" />
                  <select value={stockForm.unit} onChange={e => setStockForm({...stockForm, unit: e.target.value})} className="border p-2 rounded">
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="liters">liters</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
                <input required type="number" placeholder="Low Stock Alert Qty" value={stockForm.minThreshold} onChange={e => setStockForm({...stockForm, minThreshold: e.target.value})} className="w-full border p-2 rounded" />
                <button type="submit" className="w-full bg-[#FF6B00] text-white font-bold py-2 rounded">Add to Stock</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm">
                  <tr>
                    <th className="px-6 py-3 text-left">Item</th>
                    <th className="px-6 py-3 text-left">Quantity</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {stock.map(item => (
                    <tr key={item.id} className={`border-b ${item.quantity <= item.minThreshold ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 font-semibold">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-green-600'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        {item.quantity <= item.minThreshold && <span className="ml-2 text-xs text-red-500 font-bold">(LOW STOCK!)</span>}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <input 
                          type="number" 
                          defaultValue={item.quantity} 
                          onBlur={async (e) => {
                            if (e.target.value !== item.quantity.toString()) {
                              await api.patch(`/admin/stock/${item.id}`, { quantity: e.target.value })
                              fetchDashboardData()
                            }
                          }} 
                          className="w-20 border p-1 rounded text-center" 
                        />
                        <button onClick={async () => {
                          if (confirm('Delete this stock item?')) {
                            await api.delete(`/admin/stock/${item.id}`)
                            fetchDashboardData()
                          }
                        }} className="text-red-500 font-semibold text-sm ml-2">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}