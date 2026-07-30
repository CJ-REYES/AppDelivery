import { NavLink } from 'react-router-dom'
import { Icon } from '../common/Icon'

const items = [
  ['home', 'Inicio', '/inicio'],
  ['search', 'Buscar', '/buscar'],
  ['receipt_long', 'Pedidos', '/pedidos'],
  ['person', 'Perfil', '/perfil'],
] as const

export function MobileNav() {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
    >
      {items.map(([icon, label, to]) => (
        <NavLink
          className={({ isActive }) =>
            `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold ${
              isActive ? 'bg-panel text-primary' : 'text-muted'
            }`
          }
          key={label}
          to={to}
        >
          <Icon className="text-[21px]" filled={false} name={icon} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
