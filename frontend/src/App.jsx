import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'

import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Layout } from './components/Layout'

import { UserSelect } from './pages/UserSelect'
import { Welcome } from './pages/Welcome'
import { Products } from './pages/Products'
import { Cart } from './pages/Cart'
import { Ticket } from './pages/Ticket'

import './App.css'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Página principal - Selección de rol cliente/admin */}
                <Route path="/" element={<UserSelect />} />
                
                {/* Rutas del cliente con layout */}
                <Route path="/cliente/bienvenida" element={<Welcome />} />
                <Route path="/cliente/productos" element={
                  <Layout>
                    <Navbar />
                    <div className="main-content">
                      <Products />
                    </div>
                    <Footer />
                  </Layout>
                } />
                <Route path="/cliente/carrito" element={
                  <Layout>
                    <Navbar />
                    <div className="main-content">
                      <Cart />
                    </div>
                    <Footer />
                  </Layout>
                } />
                <Route path="/cliente/ticket" element={
                  <Layout>
                    <Navbar />
                    <div className="main-content">
                      <Ticket />
                    </div>
                    <Footer />
                  </Layout>
                } />
            
                {/* volver al inicio */}
                <Route path="*" element={<UserSelect />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App