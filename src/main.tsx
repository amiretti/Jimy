import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createServices } from '@composition/container'
import { ServicesProvider } from '@presentation/hooks/services'
import { App } from '@presentation/App'
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
