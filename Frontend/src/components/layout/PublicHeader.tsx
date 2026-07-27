import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Brand } from '../common/Brand'
import { Icon } from '../common/Icon'

const links = [
  ['Inicio', '/'],
  ['Cómo funciona', '/#como-funciona'],
  ['Comercios', '/buscar'],
  ['Únete', '/unete'],
] as const

export function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-background/92 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between">
        <Brand />
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          {links.map(([label, to]) => (
            <NavLink
              className={({ isActive }) =>
                `border-b-2 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-accent text-accent'
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
        <div className="hidden items-center gap-3 md:flex">
          <Link className="ghost-button border-transparent bg-transparent" to="/login">
            Iniciar sesión
          </Link>
          <Link className="primary-button" to="/login?registro=true">
            Crear cuenta
          </Link>
        </div>
        <button
          aria-expanded={open}
          aria-label="Abrir menú"
          className="icon-button md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(([label, to]) => (
              <Link
                className="rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-panel"
                key={label}
                onClick={() => setOpen(false)}
                to={to}
              >
                {label}
              </Link>
            ))}
            <Link className="primary-button mt-3" onClick={() => setOpen(false)} to="/login">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
