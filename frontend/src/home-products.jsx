import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HomeProductsApp from './HomeProductsApp.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HomeProductsApp />
  </StrictMode>,
)
