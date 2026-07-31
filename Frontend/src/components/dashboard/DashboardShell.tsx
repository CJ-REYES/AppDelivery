import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Brand } from '../common/Brand'
import { Icon } from '../common/Icon'

const items = [
  ['dashboard', 'Resumen', '/comercio'],
  ['receipt_long', 'Pedidos', '/comercio'],
  ['inventory_2', 'Productos', '/comercio/productos'],
  ['category', 'Categorías', '/comercio/productos'],
  ['storefront', 'Mi comercio', '/comercio'],
  ['settings', 'Configuración', '/comercio'],
] as const

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-primary p-5 text-white lg:flex">
        <Brand inverse />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/45">
          Panel de comercio
        </p>
        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {items.map(([icon, label, to]) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-white/14 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'
                }`
              }
              end
              key={label}
              to={to}
            >
              <Icon className="text-[21px]" name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-accent font-bold">LP</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">La Placita Kanasín</p>
            <p className="text-xs text-white/50">Administrador</p>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs font-semibold text-muted">Viernes, 24 de julio</p>
            <p className="font-display text-lg font-semibold text-primary">AppDelivery Comercio</p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Buscar" className="icon-button" type="button">
              <Icon name="search" />
            </button>
            <button aria-label="Notificaciones" className="icon-button" type="button">
              <Icon name="notifications" />
            </button>
          </div>
        </header>
        <main className="dashboard-grid min-h-[calc(100vh-80px)] p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
