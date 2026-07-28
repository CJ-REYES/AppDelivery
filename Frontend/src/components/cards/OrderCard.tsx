import { Link } from 'react-router-dom'
import { Icon } from '../common/Icon'

type OrderCardProps = {
  name: string
  order: string
  date: string
  total: string
  image: string
  active?: boolean
}

export function OrderCard({ name, order, date, total, image, active = false }: OrderCardProps) {
  return (
    <article className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <img alt={name} className="h-28 w-full rounded-xl object-cover sm:size-24" src={image} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl font-semibold text-primary">{name}</h3>
            <p className="mt-1 text-xs text-muted">
              {order} · {date}
            </p>
          </div>
          <span
            className={`status-pill ${
              active ? 'bg-warning/15 text-[#8a5c00]' : 'bg-success/10 text-success'
            }`}
          >
            {active ? 'En camino' : 'Entregado'}
          </span>
        </div>
        {active ? (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-panel-strong">
              <div className="h-full w-3/4 rounded-full bg-accent" />
            </div>
            <p className="mt-1 text-[11px] font-semibold text-muted">Llega en 15–20 min</p>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <strong className="text-primary">{total}</strong>
        <Link
          className={active ? 'secondary-button !min-h-10 !px-4' : 'ghost-button !min-h-10 !px-4'}
          to={active ? '/seguimiento' : '/comercio/maya-burger'}
        >
          {active ? 'Ver seguimiento' : 'Volver a pedir'}
          <Icon className="text-[17px]" name="arrow_forward" />
        </Link>
      </div>
    </article>
  )
}
