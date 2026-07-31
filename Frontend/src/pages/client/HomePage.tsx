import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StoreCard } from '../../components/cards/StoreCard'
import { Icon } from '../../components/common/Icon'
import { SectionHeading } from '../../components/common/SectionHeading'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import { catalogApi } from '../../services/catalogApi'
import type { StoreCategory, StoreSummary } from '../../types/catalog'

const iconAliases: Record<string, string> = {
  utensils: 'restaurant',
  'shopping-cart': 'shopping_cart',
  'heart-pulse': 'medical_services',
  store: 'storefront',
  'ice-cream-bowl': 'icecream',
}

export function HomePage() {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [stores, setStores] = useState<StoreSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    let active = true

    Promise.all([
      catalogApi.getStoreCategories(),
      catalogApi.searchStores(),
    ])
      .then(([nextCategories, nextStores]) => {
        if (!active) return
        setCategories(nextCategories)
        setStores(nextStores)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el catálogo.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/buscar${search ? `?q=${encodeURIComponent(search)}` : ''}`)
  }

  const currentDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader cartCount={0} />
      <main className="page-shell py-10 md:py-16">
        <section>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold capitalize text-accent">
                {currentDate}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
                Hola{user ? `, ${user.firstName}` : ''}
              </h1>
              <p className="mt-2 text-lg text-muted">
                ¿Qué se te antoja hoy?
              </p>
            </div>
            <Link className="ghost-button w-fit !justify-start" to="/perfil">
              <Icon className="text-accent" name="location_on" />
              Configura tu dirección
              <Icon className="text-[18px]" name="arrow_forward" />
            </Link>
          </div>
          <form
            className="relative mt-8 max-w-3xl shadow-[0_8px_35px_rgba(23,33,29,.08)]"
            onSubmit={submitSearch}
          >
            <Icon
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
              name="search"
            />
            <input
              className="field min-h-14 rounded-2xl border-0 pl-14 pr-32 text-base"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar comercios, platillos o antojos…"
              value={search}
            />
            <button
              className="primary-button absolute right-1.5 top-1.5 !min-h-11 !px-5"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </section>

        <section className="mt-9">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3">
            <Link
              className="flex min-w-24 flex-col items-center gap-2 rounded-2xl border border-primary bg-primary p-3 text-white transition hover:-translate-y-0.5"
              to="/buscar"
            >
              <Icon name="apps" />
              <span className="text-[11px] font-bold">Todos</span>
            </Link>
            {categories.map((category) => (
              <Link
                className="flex min-w-24 flex-col items-center gap-2 rounded-2xl border border-line bg-white p-3 text-primary transition hover:-translate-y-0.5 hover:bg-panel"
                key={category.id}
                to={`/buscar?categoria=${encodeURIComponent(category.slug)}`}
              >
                <Icon
                  name={
                    iconAliases[category.iconName ?? ''] ??
                    category.iconName?.replaceAll('-', '_') ??
                    'storefront'
                  }
                />
                <span className="text-[11px] font-bold">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative mt-8 overflow-hidden rounded-[28px] bg-primary-soft p-6 text-white md:p-10">
          <div className="absolute -right-12 -top-16 grid size-72 place-items-center rounded-full bg-white/8 text-white/15">
            <Icon className="text-[150px]" name="delivery_dining" />
          </div>
          <div className="relative max-w-lg">
            <span className="status-pill bg-accent text-white">
              Catálogo local
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
              Productos publicados por comercios reales
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Explora el catálogo conectado con AppDelivery y apoya a los
              negocios de tu zona.
            </p>
            <Link className="primary-button mt-6" to="/buscar">
              Explorar ahora
              <Icon className="text-[18px]" name="arrow_forward" />
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            action={
              <Link
                className="text-sm font-bold text-accent hover:underline"
                to="/buscar"
              >
                Ver todos
              </Link>
            }
            description="Información consultada directamente desde el catálogo"
            title="Comercios disponibles"
          />

          {loading ? (
            <div className="card grid min-h-56 place-items-center text-muted">
              <span className="inline-flex items-center gap-2">
                <Icon className="animate-spin" name="progress_activity" />
                Cargando comercios…
              </span>
            </div>
          ) : error ? (
            <div className="card border-danger/20 p-6 text-sm text-danger">
              {error} Verifica que el backend esté ejecutándose.
            </div>
          ) : stores.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stores.slice(0, 8).map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="card grid min-h-56 place-items-center p-8 text-center">
              <div>
                <Icon
                  className="text-[42px] text-primary"
                  name="storefront"
                />
                <h2 className="mt-3 font-display text-2xl font-semibold text-primary">
                  Aún no hay comercios publicados
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Sé el primero en registrar uno y publicar su catálogo.
                </p>
                <Link className="primary-button mt-5" to="/registro-comercio">
                  Registrar comercio
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
