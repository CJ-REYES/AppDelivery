import { Link, NavLink } from 'react-router-dom'
import type { DriverAvailabilityStatus } from '../../types/driver'
import { Brand } from '../common/Brand'
import { Icon } from '../common/Icon'
import { AccountAreaMenu } from './AccountAreaMenu'

type RoleHeaderProps = {
  role: 'Comercio' | 'Repartidor'
  driverStatus?: DriverAvailabilityStatus
}

export function RoleHeader({ role, driverStatus }: RoleHeaderProps) {
  const driver = role === 'Repartidor'
  const links = driver
    ? [
        ['Entregas', '/repartidor'],
        ['Entrega activa', '/repartidor/entrega-activa'],
        ['Pedidos repartidos', '/repartidor/historial'],
        ['Perfil', '/repartidor/perfil'],
      ]
    : [
        ['Resumen', '/mi-comercio'],
        ['Pedidos', '/mi-comercio/pedidos'],
        ['Productos', '/mi-comercio/productos'],
        ['Perfil', '/mi-comercio/perfil'],
      ]

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="page-shell flex h-20 items-center justify-between gap-6">
        <div className="flex items-center gap-7">
          <Brand compact />
          <span className="hidden rounded-full bg-panel px-3 py-1 text-xs font-bold text-primary md:inline-flex">
            {role}
          </span>
          <nav className="hidden items-center gap-6 lg:flex">
            {links.map(([label, to]) => (
              <NavLink
                className={({ isActive }) =>
                  `border-b-2 py-2 text-sm font-semibold ${
                    isActive
                      ? 'border-accent text-primary'
                      : 'border-transparent text-muted hover:text-primary'
                  }`
                }
                end
                key={label}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          {driver ? (
            <span
              className={`status-pill mr-2 hidden sm:inline-flex ${
                driverStatus === 'Available'
                  ? 'bg-success/10 text-success'
                  : driverStatus === 'OnDelivery'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-panel text-muted'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  driverStatus === 'Available'
                    ? 'bg-success'
                    : driverStatus === 'OnDelivery'
                      ? 'bg-accent'
                      : 'bg-muted'
                }`}
              />
              {driverStatus === 'Available'
                ? 'Disponible'
                : driverStatus === 'OnDelivery'
                  ? 'En entrega'
                  : 'Desconectado'}
            </span>
          ) : null}
          <AccountAreaMenu
            currentArea={driver ? 'driver' : 'merchant'}
          />
          <button aria-label="Notificaciones" className="icon-button" type="button">
            <Icon name="notifications" />
          </button>
          <Link
            aria-label="Perfil"
            className="icon-button"
            to={driver ? '/repartidor/perfil' : '/mi-comercio/perfil'}
          >
            <Icon name="person" />
          </Link>
        </div>
      </div>
    </header>
  )
}
