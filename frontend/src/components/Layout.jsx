import { useUser } from '../contexts/UserContext'
import { Navigate } from 'react-router-dom'

export const Layout = ({ children }) => {
  const { isLoggedIn } = useUser()

  // Si el usuario no está logueado, redirigir a bienvenida
  if (!isLoggedIn) {
    return <Navigate to="/cliente/bienvenida" replace />
  }

  return (
    <div className="app-layout">
      {children}
    </div>
  )
}