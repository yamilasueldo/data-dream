import { useState, useEffect } from 'react'
import { Plus, Minus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export const Products = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [paginaActual, setPaginaActual] = useState(1)
  const [paginacion, setPaginacion] = useState({})
  
  const { addToCart, isInCart, getItemQuantity, removeFromCart, decrementQuantity } = useCart()

  // Cargar productos
  const cargarProductos = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        pagina: paginaActual,
        limite: 8,
        activo: 'true'
      })

      if (filtroCategoria !== 'todos') {
        params.append('categoria', filtroCategoria)
      }

      const response = await fetch(`/api/productos?${params}`)
      const data = await response.json()

      if (data.exito) {
        setProductos(data.datos.productos)
        setPaginacion(data.datos.paginacion)
      } else {
        setError(data.mensaje)
      }
    } catch (err) {
      setError('Error al cargar los productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [paginaActual, filtroCategoria])

  const handleFiltroChange = (categoria) => {
    setFiltroCategoria(categoria)
    setPaginaActual(1) // Resetear a primera página
  }

  const handleAddToCart = (producto) => {
    addToCart(producto)
  }

  const handleRemoveFromCart = (productoId) => {
    const quantity = getItemQuantity(productoId)
    if (quantity > 1) {
      decrementQuantity(productoId)
    } else {
      removeFromCart(productoId)
    }
  }

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={cargarProductos} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <h1>Nuestros Productos</h1>
          <p>Descubre nuestra colección exclusiva</p>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="filter-icon">
            <Filter size={20} />
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filtroCategoria === 'todos' ? 'active' : ''}`}
              onClick={() => handleFiltroChange('todos')}
            >
              Todos
            </button>
            <button 
              className={`filter-btn ${filtroCategoria === 'ropa' ? 'active' : ''}`}
              onClick={() => handleFiltroChange('ropa')}
            >
              Ropa
            </button>
            <button 
              className={`filter-btn ${filtroCategoria === 'accesorios' ? 'active' : ''}`}
              onClick={() => handleFiltroChange('accesorios')}
            >
              Accesorios
            </button>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="products-grid">
          {productos.length === 0 ? (
            <div className="no-products">
              <p>No hay productos disponibles en esta categoría</p>
            </div>
          ) : (
            productos.map(producto => (
              <div key={producto.id} className="product-card">
                <div className="product-image">
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre}
                    onError={(e) => {
                      e.target.src = '/img/default-product.png'
                    }}
                  />
                  <div className="product-category">{producto.categoria}</div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className="product-description">{producto.descripcion}</p>
                  )}
                  
                  <div className="product-details">
                    {producto.color && <span className="detail">Color: {producto.color}</span>}
                    {producto.talla && <span className="detail">Talla: {producto.talla}</span>}
                    {producto.material && <span className="detail">Material: {producto.material}</span>}
                  </div>
                  
                  <div className="product-price">
                    ${producto.precio.toLocaleString('es-AR')}
                  </div>
                </div>

                <div className="product-actions">
                  {!isInCart(producto.id) ? (
                    <button 
                      onClick={() => handleAddToCart(producto)}
                      className="add-to-cart-btn"
                    >
                      <Plus size={18} />
                      Agregar al carrito
                    </button>
                  ) : (
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleRemoveFromCart(producto.id)}
                        className="quantity-btn minus"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="quantity-display">
                        {getItemQuantity(producto.id)}
                      </span>
                      
                      <button 
                        onClick={() => handleAddToCart(producto)}
                        className="quantity-btn plus"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {paginacion.totalPaginas > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={!paginacion.tieneAnterior}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
            
            <span className="pagination-info">
              Página {paginacion.paginaActual} de {paginacion.totalPaginas}
            </span>
            
            <button 
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={!paginacion.tieneSiguiente}
              className="pagination-btn"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}