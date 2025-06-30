import { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    nombre: '',
    isLoggedIn: false
  })

  const login = (nombre) => {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre es requerido')
    }
    
    setUser({
      nombre: nombre.trim(),
      isLoggedIn: true
    })
  }

  const logout = () => {
    setUser({
      nombre: '',
      isLoggedIn: false
    })
  }

  const value = {
    user,
    login,
    logout,
    isLoggedIn: user.isLoggedIn,
    userName: user.nombre
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}