import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { StoreSummary } from '../../types/catalog'
import { Icon } from '../common/Icon'

function formatMoney(value: number) {
  return value === 0 ? 'Gratis' : `$${value.toFixed(0)} MXN`
}

export function StoreCard({ store }: { store: StoreSummary }) {
  const [favorite, setFavorite] = useState(false)

  return (
    <article className="card card-hover group overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-panel">
        {store.coverImageUrl ?? store.logoUrl ? (
          <img
            alt={`Portada de ${store.name}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            src={store.coverImageUrl ?? store.logoUrl ?? ''}
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-panel to-panel-strong text-primary">
            <Icon className="text-[52px]" name="storefront" />
          </div>
        )}
        <span
          className={`status-pill absolute left-3 top-3 ${
            store.isOpen
              ? 'bg-success text-white'
              : 'bg-white/90 text-muted'
          }`}
        >
          {store.isOpen ? 'Abierto' : 'Cerrado'}
        </span>
        <button
          aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/92 text-primary shadow-md backdrop-blur transition hover:scale-105"
          onClick={() => setFavorite((value) => !value)}
          type="button"
        >
          <Icon
            className={favorite ? 'text-danger' : ''}
            filled={favorite}
            name="favorite"
          />
        </button>
      </div>
      <Link className="block p-4" to={`/comercio/${store.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-primary">
              {store.name}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {store.storeCategoryName}
            </p>
          </div>
          <span className="status-pill bg-panel text-primary">
            <Icon className="text-[15px] text-warning" filled name="star" />
            {store.ratingCount > 0
              ? store.ratingAverage.toFixed(1)
              : 'Nuevo'}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1">
            <Icon className="text-[17px]" name="schedule" />
            {store.estimatedDeliveryMinutesMin}–
            {store.estimatedDeliveryMinutesMax} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon className="text-[17px]" name="delivery_dining" />
            {formatMoney(store.deliveryFee)}
          </span>
        </div>
      </Link>
    </article>
  )
}
