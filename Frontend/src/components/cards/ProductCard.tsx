import type { Product } from '../../data/mockData'
import { Icon } from '../common/Icon'

type ProductCardProps = {
  product: Product
  onAdd?: (product: Product) => void
  compact?: boolean
}

export function ProductCard({ product, onAdd, compact = false }: ProductCardProps) {
  return (
    <article
      className={`card group flex overflow-hidden transition duration-300 hover:shadow-[0_12px_32px_rgba(23,33,29,0.09)] ${
        compact ? 'min-h-32' : 'min-h-40'
      }`}
    >
      <div className={`${compact ? 'w-32' : 'w-36 sm:w-44'} shrink-0 overflow-hidden bg-panel`}>
        <img
          alt={product.name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${
            product.soldOut ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
          src={product.image}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {product.popular ? <p className="eyebrow mb-1">Popular</p> : null}
            <h3 className="font-display text-lg font-semibold text-primary">{product.name}</h3>
          </div>
          {product.soldOut ? (
            <span className="status-pill bg-danger/10 text-danger">Agotado</span>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <strong className="text-base text-primary">${product.price} MXN</strong>
          <button
            aria-label={`Agregar ${product.name}`}
            className="inline-flex size-10 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover active:scale-95 disabled:bg-line disabled:text-muted"
            disabled={product.soldOut}
            onClick={() => onAdd?.(product)}
            type="button"
          >
            <Icon className="text-[20px]" name="add" />
          </button>
        </div>
      </div>
    </article>
  )
}
