// MENU PAGE NEW VERSION
'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import { addToCart } from '@/lib/cart'

interface MenuItem { 
  id: string; 
  name: string; 
  description: string; 
  price: number; 
  imageUrl?: string;
  category?: { name: string };
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    api.get('/menu')
      .then(res => setMenu(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = (item: MenuItem) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-2xl font-bold text-[#FF6B00]">Loading Menu...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header & Search Bar */}
      <div className="bg-[#1A1A1A] text-white py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#FF6B00]">Our Menu</h1>
        <p className="text-gray-300 mb-8 text-lg">Order your favorite fast food delivered hot and fresh.</p>
        
        <div className="max-w-md mx-auto relative">
          <input 
            type="text" 
            placeholder="Search for burgers, pizza..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-6 py-4 rounded-full text-black outline-none focus:ring-4 focus:ring-[#FF6B00]/50 shadow-lg"
          />
          <span className="absolute right-6 top-4 text-xl">🔍</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 -mt-8">
        
        {/* Category Buttons */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center bg-white p-4 rounded-xl shadow-sm">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(cat as string)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeCategory === cat 
                    ? 'bg-[#FF6B00] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        {filteredMenu.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No items found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                
                {/* Image Section */}
                <div className="h-52 bg-gray-200 w-full relative overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">🍔</div>
                  )}
                  {/* Category Badge */}
                  {item.category && (
                    <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {item.category.name}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{item.name}</h2>
                  <p className="text-gray-500 mb-6 flex-grow">{item.description || 'Delicious food item made with love.'}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t">
                    <span className="text-2xl font-bold text-[#FF6B00]">Rs. {item.price}</span>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#FF6B00] transition-colors"
                    >
                      Add to Cart
                    </button>
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