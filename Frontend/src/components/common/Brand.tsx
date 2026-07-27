import { Link } from 'react-router-dom'
import { Icon } from './Icon'

type BrandProps = {
  inverse?: boolean
  compact?: boolean
}

export function Brand({ inverse = false, compact = false }: BrandProps) {
  return (
    <Link
      aria-label="Ir al inicio de AppDelivery"
      className={`inline-flex items-center gap-2 font-display font-bold ${
        inverse ? 'text-white' : 'text-primary'
      } ${compact ? 'text-lg' : 'text-xl md:text-2xl'}`}
      to="/"
    >
      <span
        className={`inline-flex size-9 items-center justify-center rounded-xl ${
          inverse ? 'bg-white/12' : 'bg-accent text-white'
        }`}
      >
        <Icon className="text-[21px]" name="delivery_dining" />
      </span>
      AppDelivery
    </Link>
  )
}
