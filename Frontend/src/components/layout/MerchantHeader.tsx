import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Brand } from '../common/Brand'
import { Icon } from '../common/Icon'

const links = [
  ['Panel', '/mi-comercio'],
  ['Pedidos', '/mi-comercio/pedidos'],
  ['Productos', '/mi-comercio/productos'],
  ['Perfil', '/mi-comercio/perfil'],
] as const

export function MerchantHeader() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  async function endSession() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="page-shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-8">
          <Brand compact />
          <nav className="flex items-center gap-1">
            {links.map(([label, to]) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-panel hover:text-primary'
                  }`
                }
                end={to === '/mi-comercio'}
                key={label}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-right sm:block">
            <strong className="block text-sm text-primary">
              {user?.firstName} {user?.lastName}
            </strong>
            <span className="text-xs text-muted">Cuenta de comercio</span>
          </span>
          <button
            aria-label="Cerrar sesión"
            className="icon-button border border-line"
            onClick={endSession}
            type="button"
          >
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </header>
  )
}
