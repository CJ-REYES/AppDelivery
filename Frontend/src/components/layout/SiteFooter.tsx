import { Link } from 'react-router-dom'
import { Brand } from '../common/Brand'

const footerGroups = [
  ['AppDelivery', [['Acerca de', '/'], ['Cómo funciona', '/#como-funciona'], ['Comercios', '/buscar']]],
  ['Soporte', [['Centro de ayuda', '/perfil'], ['Privacidad', '/'], ['Términos', '/']]],
  ['Únete', [['Registra tu comercio', '/registro-comercio'], ['Quiero repartir', '/registro-repartidor'], ['Ver opciones', '/unete']]],
] as const

export function SiteFooter() {
  return (
    <footer className="bg-primary py-14 text-white">
      <div className="page-shell grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Brand inverse />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
            Tus comercios locales favoritos, directo hasta tu puerta.
          </p>
          <p className="mt-8 text-xs text-white/45">© 2026 AppDelivery. Mérida, Yucatán.</p>
        </div>
        {footerGroups.map(([title, links]) => (
          <div key={title}>
            <h3 className="text-sm font-bold">{title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              {links.map(([label, to]) => (
                <li key={label}>
                  <Link className="transition hover:text-white" to={to}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
