import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Sun, Moon, User, Home } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useCart } from '../contexts/CartContext'
import { useUser } from '../contexts/UserContext'

export const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { getTotalItems } = useCart()
  const { userName, logout } = useUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // No mostrar navbar en algunas rutas
  const hideNavbar = ['/cliente/bienvenida'].includes(location.pathname)
  
  if (hideNavbar) return null

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src="/favicon.png" alt="DATA DREAM" className="navbar-logo" />
          <span className="navbar-title">DATA DREAM</span>
          <span className="navbar-author">Yamila Sueldo</span>
        </div>

        <div className="navbar-nav">
          <Link 
            to="/cliente/productos" 
            className={`nav-link ${location.pathname === '/cliente/productos' ? 'active' : ''}`}
          >
            <Home size={20} />
            Productos
          </Link>
          
          <Link 
            to="/cliente/carrito" 
            className={`nav-link ${location.pathname === '/cliente/carrito' ? 'active' : ''}`}
          >
            <ShoppingCart size={20} />
            Carrito
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </Link>
        </div>

        <div className="navbar-controls">
          <div className="user-info">
            <User size={18} />
            <span>{userName}</span>
          </div>

          {/* Toggle tema */}
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

         
          {/* Logout */}
          <button onClick={handleLogout} className="logout-btn">
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}