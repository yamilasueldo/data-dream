import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { ArrowRight, User } from 'lucide-react'

export const Welcome = () => {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useUser()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('Por favor, ingresa tu nombre')
      return
    }

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    try {
      login(nombre.trim())
      navigate('/cliente/productos')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-header">
          <img src="/public/images/favicon.png" alt="DATA DREAM" className="logo-large" />
          <h1>DATA DREAM</h1>
          <p className="subtitle">Yamila Sueldo</p>
        </div>

        {/* Formulario de bienvenida */}
        <div className="welcome-content">
          <div className="welcome-card">
            <div className="welcome-icon">
              <User size={48} />
            </div>
            
            <h2>¡Bienvenido!</h2>
            <p>Para comenzar, por favor ingresa tu nombre</p>

            <form onSubmit={handleSubmit} className="welcome-form">
              <div className="input-group">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  className={`welcome-input ${error ? 'error' : ''}`}
                  maxLength={50}
                  autoFocus
                />
                {error && <span className="error-message">{error}</span>}
              </div>

              <button type="submit" className="welcome-button">
                <span>Continuar</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="welcome-footer">
              <p>Tu nombre se utilizará para personalizar tu experiencia de compra</p>
            </div>
          </div>
        </div>

        {/* Botón para volver */}
        <div className="back-to-start">
          <button 
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}