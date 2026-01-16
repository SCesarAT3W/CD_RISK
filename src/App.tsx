import { Routes, Route, Navigate, useNavigate } from 'react-router'
import { AuthProvider, ProtectedRoute } from '@/lib/auth/mockAuth'
import { Login } from '@/pages/Login'
import { RiskCalculation } from '@/pages/RiskCalculation'
import { CorporateLayout } from '@/components/CorporateLayout'
import { TranslatedOptionsProvider } from '@/contexts/TranslatedOptionsContext'

/**
 * Aplicación de Cálculo de Riesgo CD-Risk
 * Aplicación simple enfocada únicamente en el cálculo de riesgo
 */
function App() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <AuthProvider
      softwareName="CD-Risk"
      DEV_MODE={import.meta.env.DEV}
      onLogout={handleLogout}
    >
      <TranslatedOptionsProvider>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta principal protegida - Cálculo de Riesgo */}
          <Route
            path="/"
            element={
              <ProtectedRoute onNotAuthenticated={() => <Navigate to="/login" replace />}>
                <CorporateLayout>
                  <RiskCalculation />
                </CorporateLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirigir cualquier ruta desconocida al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </TranslatedOptionsProvider>
    </AuthProvider>
  )
}

export default App
