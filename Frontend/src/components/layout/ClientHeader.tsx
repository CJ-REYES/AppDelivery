import { Link, NavLink } from 'react-router-dom'
import { Brand } from '../common/Brand'
import { Icon } from '../common/Icon'

const clientLinks = [
  ['Explorar', '/inicio'],
  ['Ofertas', '/buscar'],
  ['Mis pedidos', '/pedidos'],
] as const

export function ClientHeader({ cartCount = 2 }: { cartCount?: number }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-background/95 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Brand compact />
          <nav className="hidden items-center gap-6 lg:flex">
            {clientLinks.map(([label, to]) => (
              <NavLink
                className={({ isActive }) =>
                  `border-b-2 py-2 text-sm font-semibold ${
                    isActive
                      ? 'border-accent text-primary'
                      : 'border-transparent text-muted hover:text-primary'
                  }`
                }
                key={label}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link aria-label="Buscar" className="icon-button hidden sm:inline-flex" to="/buscar">
            <Icon name="search" />
          </Link>
          <Link aria-label="Notificaciones" className="icon-button hidden sm:inline-flex" to="/pedidos">
            <Icon name="notifications" />
          </Link>
          <Link aria-label="Perfil" className="icon-button" to="/perfil">
            <Icon name="person" />
          </Link>
          <Link
            aria-label={`Carrito con ${cartCount} productos`}
            className="relative inline-flex size-11 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover"
            to="/checkout"
          >
            <Icon className="text-[21px]" filled name="shopping_cart" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  )
}
