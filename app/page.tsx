'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import { addToCart } from '@/lib/cart'

export default function HomePage() {
  const [menu, setMenu] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    Promise.all([api.get('/menu'), api.get('/deals')])
      .then(([menuRes, dealsRes]) => {
        setMenu(menuRes.data)
        setDeals(dealsRes.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = (item: any) => {
    addToCart({ id: item.id, name: item.name, price: item.price })
    alert(`${item.name} added to cart!`)
  }

  // Search aur Category Filter
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeCategory === 'All' || 
                            (item.category && item.category.name === activeCategory)
    return matchesSearch && matchesCategory
  })

  const categories = ['All', ...Array.from(new Set(menu.map(item => item.category?.name).filter(Boolean)))]

  if (loading) return <div className="text-center mt-20 text-2xl font-bold text-[#FF6B00]">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section with Search Bar */}
      <div 
        className="relative bg-cover bg-center h-[450px] flex items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto w-full mt-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
            Craving Something <span className="text-[#FF6B00]">Delicious?</span>
          </h1>
          <p className="text-gray-200 mb-8 text-lg md:text-xl font-medium">Order your favorite fast food delivered hot and fresh.</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative bg-white rounded-full p-1 shadow-2xl flex items-center">
            <span className="pl-4 text-2xl">🔍</span>
            <input 
              type="text" 
              placeholder="Search for Zinger Burger, Pizza, Drinks..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-full text-black outline-none text-lg bg-transparent"
            />
            <button className="bg-[#FF6B00] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e55f00] transition">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 -mt-8">
        
        {/* Deals Section */}
        {deals.length > 0 && activeCategory === 'All' && search === '' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">🔥 Hot Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-transparent hover:border-[#FF6B00]">
                  <div className="h-40 bg-gray-200 relative overflow-hidden">
                    {deal.imageUrl ? (
                      <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">🎁</div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#FF6B00] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">SPECIAL DEAL</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{deal.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{deal.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xl font-bold text-[#FF6B00]">Rs. {deal.price}</span>
                      <button onClick={() => handleAddToCart({ id: deal.id, name: deal.title, price: deal.price })} className="bg-[#FF6B00] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition">Grab Deal</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Buttons */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center bg-white p-4 rounded-xl shadow-sm">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(cat as string)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeCategory === cat ? 'bg-[#FF6B00] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Main Menu Grid */}
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Our Menu</h2>
        {filteredMenu.length === 0 ? (
          <div className="text-center py-20"><p className="text-xl text-gray-500">No items found. Try a different search.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                <div className="h-52 bg-gray-200 w-full relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">🍔</div>
                  )}
                  {item.category && (
                    <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">{item.category.name}</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{item.name}</h2>
                  <p className="text-gray-500 mb-6 flex-grow">{item.description || 'Delicious food item made with love.'}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t">
                    <span className="text-2xl font-bold text-[#FF6B00]">Rs. {item.price}</span>
                    <button onClick={() => handleAddToCart(item)} className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#FF6B00] transition-colors">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}