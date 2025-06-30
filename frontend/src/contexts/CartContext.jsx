import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (existingItem) {
        // Si ya existe, incrementar la cantidad
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      } else {
        // Si es nuevo, agregarlo con cantidad 1
        return [...prevItems, { ...product, cantidad: 1 }]
      }
    })
  }

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, cantidad }
          : item
      )
    )   
  }

  // Decrementar cantidad
  const decrementQuantity = (productId) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          const newQuantity = item.cantidad - 1
          return newQuantity > 0 ? { ...item, cantidad: newQuantity } : null
        }
        return item
      }).filter(Boolean)
    })
  }

  // Limpiar carrito
  const clearCart = () => {
    setCartItems([])
  }

  // Calcular total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0)
  }

  // Calcular cantidad total de items
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0)
  }

  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId)
  }

  // Obtener cantidad de un producto específico
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.cantidad : 0
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    getTotalItems,
    isInCart,
    getItemQuantity,
    isEmpty: cartItems.length === 0
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}