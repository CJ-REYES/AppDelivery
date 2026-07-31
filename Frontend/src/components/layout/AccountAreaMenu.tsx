import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../common/Icon'

export type AccountArea = 'client' | 'driver' | 'merchant'

type AccountAreaMenuProps = {
  currentArea: AccountArea
}

const areaDetails = {
  client: {
    icon: 'home',
    label: 'Cliente',
    description: 'Comprar y recibir pedidos',
    path: '/inicio',
  },
  driver: {
    icon: 'delivery_dining',
    label: 'Repartidor',
    description: 'Entregas y ganancias',
    path: '/repartidor',
  },
  merchant: {
    icon: 'storefront',
    label: 'Comercio',
    description: 'Productos y administración',
    path: '/mi-comercio',
  },
} as const

export function AccountAreaMenu({
  currentArea,
}: AccountAreaMenuProps) {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (!isAuthenticated || !user) {
    return (
      <Link
        aria-label="Iniciar sesión"
        className="icon-button"
        to="/login"
      >
        <Icon name="login" />
      </Link>
    )
  }

  const hasDriverProfile = user.roles.includes('Driver')
  const hasMerchantProfile = user.roles.includes('Merchant')
  const current = areaDetails[currentArea]
  const areas = [
    {
      ...areaDetails.client,
      id: 'client' as const,
      available: true,
    },
    {
      ...areaDetails.driver,
      id: 'driver' as const,
      available: hasDriverProfile,
      path: hasDriverProfile
        ? areaDetails.driver.path
        : '/registro-repartidor',
    },
    {
      ...areaDetails.merchant,
      id: 'merchant' as const,
      available: hasMerchantProfile,
      path: hasMerchantProfile
        ? areaDetails.merchant.path
        : '/registro-comercio',
    },
  ]

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Cambiar área de la cuenta"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-3 text-sm font-bold text-primary transition hover:border-primary/25 hover:bg-panel"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        type="button"
      >
        <Icon className="text-[20px] text-accent" name={current.icon} />
        <span className="hidden xl:inline">{current.label}</span>
        <Icon
          className={`hidden text-[18px] transition sm:inline ${
            open ? 'rotate-180' : ''
          }`}
          name="expand_more"
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_55px_rgba(0,41,32,0.18)]"
          role="menu"
        >
          <div className="border-b border-line bg-panel/60 px-4 py-3">
            <p className="text-sm font-bold text-primary">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Cambia de área sin cerrar sesión
            </p>
          </div>
          <div className="space-y-1 p-2">
            {areas.map((area) => {
              const active = area.id === currentArea
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-panel'
                  }`}
                  key={area.id}
                  role="menuitem"
                  to={area.path}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      active
                        ? 'bg-white/12 text-white'
                        : 'bg-panel text-primary'
                    }`}
                  >
                    <Icon className="text-[21px]" name={area.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm">
                      {area.available
                        ? area.label
                        : `Registrar ${area.label.toLowerCase()}`}
                    </strong>
                    <span
                      className={`block truncate text-xs ${
                        active ? 'text-white/65' : 'text-muted'
                      }`}
                    >
                      {area.available
                        ? area.description
                        : 'Actívalo con esta misma cuenta'}
                    </span>
                  </span>
                  {active ? (
                    <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                      Actual
                    </span>
                  ) : (
                    <Icon
                      className="text-[18px] text-muted"
                      name="chevron_right"
                    />
                  )}
                </Link>
              )
            })}
          </div>
          <div className="border-t border-line p-2">
            <Link
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted hover:bg-panel hover:text-primary"
              role="menuitem"
              to="/perfil"
            >
              <Icon className="text-[20px]" name="manage_accounts" />
              Administrar mis perfiles
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
