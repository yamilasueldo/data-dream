import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Download, Home, CheckCircle } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useUser } from '../contexts/UserContext'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const Ticket = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const ticketRef = useRef(null)
  const { clearCart } = useCart()
  const { logout, userName } = useUser()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Datos de la venta desde el state de navegación
  const ventaData = location.state

  useEffect(() => {
    // Si no hay datos de venta, redirigir al carrito
    if (!ventaData) {
      navigate('/cliente/carrito')
      return
    }

    // Limpiar el carrito después de una compra exitosa
    clearCart()
  }, [ventaData, navigate, clearCart])

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || isGeneratingPDF) return
  
    try {
      setIsGeneratingPDF(true)
  
      // Esperar al siguiente frame y breve delay
      await new Promise(resolve => requestAnimationFrame(resolve))
      await new Promise(resolve => setTimeout(resolve, 300))
  
      console.log('ticketRef:', ticketRef.current)
  
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      })
  
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
  
      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let position = 10
  
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
  
      const numeroVenta = ventaData.numeroVenta || `ticket-${Date.now()}`
      pdf.save(`${numeroVenta}.pdf`)
  
      console.log('✅ PDF generado correctamente')
  
    } catch (error) {
      console.error('❌ Error al generar PDF:', error)
      alert('Error al descargar el ticket. Por favor, intenta de nuevo.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }
  

  const handleNewPurchase = () => {
    // Limpiar todo y volver al inicio
    logout() // Esto limpiará el usuario
    clearCart() // Limpiar carrito por si acaso
    navigate('/cliente/bienvenida') // Ir a selección de rol
  }

  const handleContinueShopping = () => {
    navigate('/cliente/productos')
  }

  if (!ventaData) {
    return (
      <div className="ticket-page">
        <div className="ticket-container">
          <div className="error-state">
            <p>No se encontraron datos del ticket</p>
            <button onClick={() => navigate('/cliente/productos')} className="back-btn">
              Volver a productos
            </button>
          </div>
        </div>
      </div>
    )
  }

  const fechaVenta = new Date(ventaData.fecha || new Date())

  return (
    <div className="ticket-page">
      <div className="ticket-container">
        {/* Header de éxito */}
        <div className="success-header">
          <CheckCircle size={48} className="success-icon" />
          <h1>¡Compra realizada con éxito!</h1>
          <p>Tu ticket ha sido generado correctamente</p>
        </div>

        {/* Ticket */}
        <div className="ticket-wrapper">
          <div ref={ticketRef} className="ticket">
            {/* Header del ticket */}
            <div className="ticket-header">
              <img src="/public/images/favicon.png" alt="DATA DREAM" className="ticket-logo" />
              <div className="ticket-company">
                <h2>DATA DREAM</h2>
                <p>Yamila Sueldo</p>
                <p>Sistema de Autoservicio</p>
              </div>
            </div>

            {/* Información de la venta */}
            <div className="ticket-info">
              <div className="ticket-row">
                <span className="label">Número de ticket:</span>
                <span className="value">{ventaData.numeroVenta || `VTA-${Date.now()}`}</span>
              </div>
              <div className="ticket-row">
                <span className="label">Fecha:</span>
                <span className="value">
                  {fechaVenta.toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="ticket-row">
                <span className="label">Cliente:</span>
                <span className="value">{userName || ventaData.nombreCliente || 'Cliente'}</span>
              </div>
            </div>

            {/* Línea separadora */}
            <div className="ticket-divider"></div>

            {/* Productos */}
            <div className="ticket-products">
              <h3>Productos adquiridos</h3>
              
              <div className="products-header">
                <span>Producto</span>
                <span>Cant.</span>
                <span>Precio</span>
                <span>Total</span>
              </div>

              {(ventaData.productos || []).map((producto, index) => (
                <div key={index} className="product-row">
                  <div className="product-info">
                    <span className="product-name">{producto.nombre}</span>
                    <span className="product-category">({producto.categoria})</span>
                  </div>
                  <span className="product-quantity">{producto.cantidad}</span>
                  <span className="product-price">${producto.precio?.toLocaleString('es-AR')}</span>
                  <span className="product-total">
                    ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            {/* Línea separadora */}
            <div className="ticket-divider"></div>

            {/* Total */}
            <div className="ticket-total">
              <div className="total-row">
                <span className="total-label">TOTAL:</span>
                <span className="total-amount">${(ventaData.total || 0).toLocaleString('es-AR')}</span>
              </div>
            </div>

            {/* Footer del ticket */}
            <div className="ticket-footer">
              <p>¡Gracias por tu compra!</p>
              <p>Conserva este ticket como comprobante</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="ticket-actions">
          <button 
            onClick={handleDownloadPDF} 
            className="download-btn"
            disabled={isGeneratingPDF}
          >
            <Download size={20} />
            {isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
          
          <button onClick={handleContinueShopping} className="continue-btn">
            <Home size={20} />
            Seguir comprando
          </button>
          
          <button onClick={handleNewPurchase} className="new-purchase-btn">
            Nueva compra
          </button>
        </div>

        {/* Información adicional */}
        <div className="ticket-info-extra">
          <p>Tu ticket ha sido guardado y está listo para descargar</p>
          <p>Puedes continuar comprando o iniciar una nueva sesión</p>
        </div>
      </div>
    </div>
  )
}