import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider, CmsProvider } from '@/contexts';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CmsProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </CmsProvider>
  </StrictMode>,
)
