import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FontProvider from '@/context/FontProvider'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
<BrowserRouter>
    <FontProvider>
    <App />
    </FontProvider>
    </BrowserRouter>
  </StrictMode>,
)
