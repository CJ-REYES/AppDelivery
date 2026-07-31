import { type ReactNode, useEffect } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Brand } from './components/common/Brand'
import { AppStateProvider } from './context/AppStateContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CheckoutPage } from './pages/client/CheckoutPage'
import { HomePage } from './pages/client/HomePage'
import { OrdersPage } from './pages/client/OrdersPage'
import { ProfilePage } from './pages/client/ProfilePage'
import { SearchPage } from './pages/client/SearchPage'
import { StorePage } from './pages/client/StorePage'
import { TrackingPage } from './pages/client/TrackingPage'
import { MerchantDashboardPage } from './pages/merchant/MerchantDashboardPage'
import { MerchantProductsPage } from './pages/merchant/MerchantProductsPage'
import { MerchantProfilePage } from './pages/merchant/MerchantProfilePage'
import { MerchantRegistrationPage } from './pages/merchant/MerchantRegistrationPage'
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/public/LoginPage'
import { PasswordRecoveryPage } from './pages/public/PasswordRecoveryPage'
import { RoleOnboardingPage } from './pages/public/RoleOnboardingPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <Brand />

        <p className="eyebrow mt-10">Error 404</p>

        <h1 className="mt-3 font-display text-5xl font-semibold text-primary">
          Página no encontrada
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          La ruta que buscas no existe o fue movida.
        </p>

        <Link className="primary-button mt-7" to="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

function RequireAuth({
  children,
  role,
}: {
  children: ReactNode
  role?: string
}) {
  const { isAuthenticated, isReady, user } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted">
        Cargando sesión…
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}
      />
    )
  }

  if (role && !user?.roles.includes(role)) {
    return <Navigate replace to="/registro-comercio" />
  }

  return children
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route
          element={<PasswordRecoveryPage />}
          path="/recuperar-contrasena"
        />
        <Route element={<RoleOnboardingPage />} path="/unete" />

        <Route element={<HomePage />} path="/inicio" />
        <Route element={<SearchPage />} path="/buscar" />
        <Route element={<StorePage />} path="/comercio/:storeId" />

        <Route element={<CheckoutPage />} path="/checkout" />
        <Route element={<OrdersPage />} path="/pedidos" />
        <Route element={<TrackingPage />} path="/seguimiento" />

        <Route
          element={
            <RequireAuth>
              <MerchantRegistrationPage />
            </RequireAuth>
          }
          path="/registro-comercio"
        />
        <Route
          element={
            <RequireAuth role="Merchant">
              <MerchantDashboardPage />
            </RequireAuth>
          }
          path="/mi-comercio"
        />
        <Route
          element={
            <RequireAuth role="Merchant">
              <MerchantProductsPage />
            </RequireAuth>
          }
          path="/mi-comercio/productos"
        />
        <Route
          element={
            <RequireAuth role="Merchant">
              <MerchantProfilePage />
            </RequireAuth>
          }
          path="/mi-comercio/perfil"
        />

        <Route
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
          path="/perfil"
        />

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <AppRoutes />
        </AppStateProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
