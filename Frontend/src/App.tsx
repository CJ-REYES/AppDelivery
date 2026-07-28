import { useEffect } from 'react'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Brand } from './components/common/Brand'
import { HomePage } from './pages/client/HomePage'
import { SearchPage } from './pages/client/SearchPage'
import { StorePage } from './pages/client/StorePage'
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/public/LoginPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

type PendingPageProps = {
  title: string
  description: string
}

function PendingPage({ title, description }: PendingPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <Brand />

        <p className="eyebrow mt-10">Próxima entrega</p>

        <h1 className="mt-3 font-display text-5xl font-semibold text-primary">
          {title}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          {description}
        </p>

        <Link className="primary-button mt-7" to="/inicio">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
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

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />

        <Route element={<HomePage />} path="/inicio" />
        <Route element={<SearchPage />} path="/buscar" />
        <Route element={<StorePage />} path="/comercio/:storeId" />

        <Route
          element={
            <PendingPage
              title="Carrito y checkout"
              description="Este flujo se incorporará en la siguiente entrega del frontend."
            />
          }
          path="/checkout"
        />

        <Route
          element={
            <PendingPage
              title="Mis pedidos"
              description="El historial y seguimiento se incorporarán en una entrega posterior."
            />
          }
          path="/pedidos"
        />

        <Route
          element={
            <PendingPage
              title="Perfil del cliente"
              description="La administración del perfil se incorporará en una entrega posterior."
            />
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
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App