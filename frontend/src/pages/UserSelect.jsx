import { Link } from 'react-router-dom'
import { User, Settings } from 'lucide-react'

export const UserSelect = () => {
  return (
    <div className="user-select">
      <div className="user-select-container">
        <div className="user-select-header">
          <img src="/public/images/favicon.png" alt="DATA DREAM" className="logo-large" />
          <h1>Bienvenido a DATA DREAM</h1>
          <p>Selecciona cómo deseas acceder al sistema</p>
        </div>

        <div className="user-cards">
          <Link to="/cliente/bienvenida" className="user-card cliente-card">
            <div className="user-icon">
              <User size={48} />
            </div>
            <h3>Cliente</h3>
            <p>Explora nuestros productos y realiza tus compras de forma rápida y sencilla</p>
            <div className="card-arrow">→</div>
          </Link>

          <a 
  href="http://localhost:3000/admin/login" 
  className="user-card admin-card" 
  style={{ 
    cursor: 'pointer', 
    textDecoration: 'none', 
    color: 'inherit',
    display: 'block'
  }}
>
  <div className="user-icon">
    <Settings size={48} />
  </div>
  <h3>Administrador</h3>
  <p>Accede al panel de administración para gestionar productos y ventas</p>
  <div className="card-arrow">→</div>
</a>
        </div>

        <div className="user-select-footer">
          <p>Yamila Sueldo - Trabajo Práctico Integrador 2025</p>
        </div>
      </div>
    </div>
  )
}