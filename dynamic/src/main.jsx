import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from "./Contexts/LanguageContext.jsx";
import { CmsProvider } from './Contexts/CmsContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CmsProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
    </CmsProvider>
  </StrictMode>,
)
