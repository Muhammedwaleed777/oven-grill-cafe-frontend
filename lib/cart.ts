export interface CartItem { id: string; name: string; price: number; qty: number }

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('cart') || '[]')
}

export const addToCart = (item: Omit<CartItem, 'qty'>) => {
  const cart = getCart()
  const existing = cart.find((i) => i.id === item.id)
  if (existing) existing.qty += 1
  else cart.push({ ...item, qty: 1 })
  localStorage.setItem('cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cartUpdated'))
}

export const removeFromCart = (id: string) => {
  let cart = getCart().filter((i) => i.id !== id)
  localStorage.setItem('cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cartUpdated'))
}

export const clearCart = () => {
  localStorage.removeItem('cart')
  window.dispatchEvent(new Event('cartUpdated'))
}

export const getCartTotal = () => {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0)
}