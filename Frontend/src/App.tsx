import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Brand } from './components/common/Brand'
import { AppStateProvider } from './context/AppStateContext'
import { CheckoutPage } from './pages/client/CheckoutPage'
import { HomePage } from './pages/client/HomePage'
import { OrdersPage } from './pages/client/OrdersPage'
import { ProfilePage } from './pages/client/ProfilePage'
import { SearchPage } from './pages/client/SearchPage'
import { StorePage } from './pages/client/StorePage'
import { TrackingPage } from './pages/client/TrackingPage'
import { ActiveDeliveryPage } from './pages/driver/ActiveDeliveryPage'
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage'
import { DriverHistoryPage } from './pages/driver/DriverHistoryPage'
import { DriverProfilePage } from './pages/driver/DriverProfilePage'
import { DriverRegistrationPage } from './pages/driver/DriverRegistrationPage'
import { MerchantDashboardPage } from './pages/merchant/MerchantDashboardPage'
import { MerchantOrdersPage } from './pages/merchant/MerchantOrdersPage'
import { MerchantProfilePage } from './pages/merchant/MerchantProfilePage'
import { MerchantProductsPage } from './pages/merchant/MerchantProductsPage'
import { MerchantRegistrationPage } from './pages/merchant/MerchantRegistrationPage'
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/public/LoginPage'
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
        <h1 className="mt-3 font-display text-5xl font-semibold text-primary">Página no encontrada</h1>
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

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RoleOnboardingPage />} path="/unete" />
        <Route element={<MerchantRegistrationPage />} path="/registro-comercio" />
        <Route element={<DriverRegistrationPage />} path="/registro-repartidor" />

        <Route element={<HomePage />} path="/inicio" />
        <Route element={<SearchPage />} path="/buscar" />
        <Route element={<CheckoutPage />} path="/checkout" />
        <Route element={<TrackingPage />} path="/seguimiento" />
        <Route element={<OrdersPage />} path="/pedidos" />
        <Route element={<ProfilePage />} path="/perfil" />
        <Route element={<StorePage />} path="/comercio/:storeId" />

        <Route element={<MerchantDashboardPage />} path="/comercio" />
        <Route element={<MerchantOrdersPage />} path="/comercio/pedidos" />
        <Route element={<MerchantProductsPage />} path="/comercio/productos" />
        <Route element={<MerchantProfilePage />} path="/comercio/configuracion" />

        <Route element={<DriverDashboardPage />} path="/repartidor" />
        <Route element={<ActiveDeliveryPage />} path="/repartidor/entrega-activa" />
        <Route element={<DriverHistoryPage />} path="/repartidor/historial" />
        <Route element={<DriverProfilePage />} path="/repartidor/perfil" />

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppRoutes />
      </AppStateProvider>
    </BrowserRouter>
  )
}

export default App
