import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createServices } from '@composition/container'
import { ServicesProvider } from '@presentation/hooks/services'
import { App } from '@presentation/App'
import '@fontsource/rubik/latin-700.css'
import '@fontsource/rubik/latin-800.css'
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import '@fontsource/plus-jakarta-sans/latin-800.css'
import '@presentation/styles/tokens.css'
import '@presentation/styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider services={createServices()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ServicesProvider>
  </StrictMode>,
)
