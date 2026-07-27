import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Store } from '../../data/mockData'
import { Icon } from '../common/Icon'

export function StoreCard({ store }: { store: Store }) {
  const [favorite, setFavorite] = useState(false)

  return (
    <article className="card card-hover group overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-panel">
        <img
          alt={`Platillo destacado de ${store.name}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          src={store.image}
        />
        {store.featured ? (
          <span className="status-pill absolute left-3 top-3 bg-warning text-primary">Popular</span>
        ) : null}
        <button
          aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/92 text-primary shadow-md backdrop-blur transition hover:scale-105"
          onClick={() => setFavorite((value) => !value)}
          type="button"
        >
          <Icon className={favorite ? 'text-danger' : ''} filled={favorite} name="favorite" />
        </button>
      </div>
      <Link className="block p-4" to={`/comercio/${store.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-primary">{store.name}</h3>
            <p className="mt-1 text-sm text-muted">{store.category}</p>
          </div>
          <span className="status-pill bg-panel text-primary">
            <Icon className="text-[15px] text-warning" filled name="star" />
            {store.rating}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1">
            <Icon className="text-[17px]" name="schedule" />
            {store.time}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon className="text-[17px]" name="delivery_dining" />
            {store.delivery}
          </span>
          <span className="ml-auto text-success">Abierto</span>
        </div>
      </Link>
    </article>
  )
}
