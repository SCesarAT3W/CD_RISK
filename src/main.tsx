import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import App from './App.tsx'

// Why Did You Render - Debugging de re-renders (solo en desarrollo)
if (import.meta.env.DEV) {
  import('./wdyr')
}

// React Scan - Herramienta de análisis de rendimiento (solo en desarrollo)
if (import.meta.env.DEV) {
  import('react-scan').then(({ scan }) => {
    scan({
      enabled: true,
      log: true, // Mostrar logs en consola
      showToolbar: true, // Mostrar toolbar de React Scan
      // Filtrar componentes internos de librerías
      includeChildren: false, // No mostrar componentes hijos en logs
    })
  })
}

// Configurar TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </QueryClientProvider>,
)
