import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useUser } from '../contexts/UserContext'

export const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, isEmpty } = useCart()
  const { userName } = useUser()
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleConfirmPurchase = () => {
    setShowConfirmModal(true)
  }

  const handleProceedToPurchase = async () => {
    setLoading(true)
    
    try {
      // Crear la venta en el backend
      const ventaData = {
        nombreCliente: userName,
        productos: cartItems.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        total: getCartTotal()
      }

      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaData)
      })

      const result = await response.json()

      if (result.exito) {
        // Redirigir al ticket con los datos de la venta
        navigate('/cliente/ticket', { 
          state: { 
            ventaId: result.datos.id,
            numeroVenta: result.datos.numeroVenta,
            productos: cartItems,
            total: getCartTotal(),
            fecha: new Date().toISOString()
          }
        })
      } else {
        alert('Error al procesar la venta: ' + result.mensaje)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la compra. Intenta de nuevo.')
    } finally {
      setLoading(false)
      setShowConfirmModal(false)
    }
  }

  if (isEmpty) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <ShoppingBag size={64} className="empty-cart-icon" />
            <h2>Tu carrito está vacío</h2>
            <p>¡Agrega algunos productos para comenzar!</p>
            <button 
              onClick={() => navigate('/cliente/productos')}
              className="continue-shopping-btn"
            >
              <ArrowLeft size={18} />
              Continuar comprando
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <button 
            onClick={() => navigate('/cliente/productos')}
            className="back-to-products"
          >
            <ArrowLeft size={18} />
            Seguir comprando
          </button>
          <h1>Mi Carrito</h1>
          <p>Revisa tus productos antes de finalizar la compra</p>
        </div>

        {/* Items del carrito */}
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre}
                    onError={(e) => {
                      e.target.src = '/img/default-product.png'
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.nombre}</h3>
                  <p className="item-category">{item.categoria}</p>
                  {item.color && <span className="item-spec">Color: {item.color}</span>}
                  {item.talla && <span className="item-spec">Talla: {item.talla}</span>}
                </div>

                <div className="item-price">
                  <span className="unit-price">${item.precio.toLocaleString('es-AR')}</span>
                  <span className="price-label">c/u</span>
                </div>

                <div className="item-quantity">
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                    className="quantity-btn minus"
                    disabled={loading}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <input 
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="quantity-input"
                    min="1"
                    disabled={loading}
                  />
                  
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                    className="quantity-btn plus"
                    disabled={loading}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="item-total">
                  <span className="total-price">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-item-btn"
                  disabled={loading}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen del carrito */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Resumen de la compra</h3>
              
              <div className="summary-lines">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <span>${getCartTotal().toLocaleString('es-AR')}</span>
                </div>
                <div className="summary-line total-line">
                  <span>Total:</span>
                  <span>${getCartTotal().toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="summary-info">
                <p>Cliente: <strong>{userName}</strong></p>
                <p>Productos: <strong>{cartItems.length}</strong></p>
              </div>

              <button 
                onClick={handleConfirmPurchase}
                className="checkout-btn"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Finalizar compra'}
              </button>

              <button 
                onClick={clearCart}
                className="clear-cart-btn"
                disabled={loading}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirmar compra</h3>
            <p>¿Estás seguro de que deseas finalizar tu compra?</p>
            
            <div className="modal-summary">
              <p><strong>Cliente:</strong> {userName}</p>
              <p><strong>Total:</strong> ${getCartTotal().toLocaleString('es-AR')}</p>
              <p><strong>Productos:</strong> {cartItems.length}</p>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="cancel-btn"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleProceedToPurchase}
                className="confirm-btn"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}