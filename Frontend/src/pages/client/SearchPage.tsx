import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StoreCard } from '../../components/cards/StoreCard'
import { Icon } from '../../components/common/Icon'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { catalogApi } from '../../services/catalogApi'
import type { StoreCategory, StoreSummary } from '../../types/catalog'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [stores, setStores] = useState<StoreSummary[]>([])
  const [sort, setSort] = useState('Recomendados')
  const [openOnly, setOpenOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const query = params.get('q') ?? ''
  const categoryValue = params.get('categoria') ?? ''
  const selectedCategory = categories.find(
    (category) =>
      category.slug === categoryValue ||
      category.name.toLowerCase() === categoryValue.toLowerCase() ||
      String(category.id) === categoryValue,
  )

  useEffect(() => {
    catalogApi
      .getStoreCategories()
      .then(setCategories)
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar las categorías.',
        )
      })
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    catalogApi
      .searchStores({
        search: query,
        storeCategoryId: selectedCategory?.id,
        openOnly,
      })
      .then((response) => {
        if (active) setStores(response)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible buscar comercios.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [openOnly, query, selectedCategory?.id])

  const sortedStores = useMemo(() => {
    const next = [...stores]
    if (sort === 'Más rápidos') {
      next.sort(
        (first, second) =>
          first.estimatedDeliveryMinutesMin -
          second.estimatedDeliveryMinutesMin,
      )
    } else if (sort === 'Mejor valorados') {
      next.sort(
        (first, second) => second.ratingAverage - first.ratingAverage,
      )
    }
    return next
  }, [sort, stores])

  function selectCategory(value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set('categoria', value)
    else next.delete('categoria')
    setParams(next)
  }

  function clearFilters() {
    setSort('Recomendados')
    setOpenOnly(false)
    setParams({})
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader cartCount={0} />
      <main className="page-shell grid gap-8 py-10 md:grid-cols-[240px_1fr] md:py-14">
        <aside className="card hidden h-fit p-5 md:block">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-primary">
              Filtros
            </h2>
            <button
              className="text-xs font-bold text-accent hover:underline"
              onClick={clearFilters}
              type="button"
            >
              Limpiar
            </button>
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-primary">Categoría</legend>
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-3 text-sm text-muted">
                <input
                  checked={!categoryValue}
                  className="size-4 text-accent focus:ring-accent"
                  name="category"
                  onChange={() => selectCategory('')}
                  type="radio"
                />
                Todos
              </label>
              {categories.map((category) => (
                <label
                  className="flex items-center gap-3 text-sm text-muted"
                  key={category.id}
                >
                  <input
                    checked={selectedCategory?.id === category.id}
                    className="size-4 text-accent focus:ring-accent"
                    name="category"
                    onChange={() => selectCategory(category.slug)}
                    type="radio"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-7 border-t border-line pt-6">
            <legend className="text-sm font-bold text-primary">
              Disponibilidad
            </legend>
            <label className="mt-3 flex items-center gap-3 text-sm text-muted">
              <input
                checked={openOnly}
                className="size-4 rounded text-accent focus:ring-accent"
                onChange={(event) => setOpenOnly(event.target.checked)}
                type="checkbox"
              />
              Abierto ahora
            </label>
          </fieldset>
        </aside>

        <section>
          <form
            className="relative max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              const nextQuery = String(form.get('search') ?? '').trim()
              const next = new URLSearchParams(params)
              if (nextQuery) next.set('q', nextQuery)
              else next.delete('q')
              setParams(next)
            }}
          >
            <Icon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              name="search"
            />
            <input
              className="field min-h-12 pl-12"
              defaultValue={query}
              key={query}
              name="search"
              placeholder="Buscar comercios o productos"
            />
          </form>
          <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Catálogo conectado</p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
                Resultados
              </h1>
              <p className="mt-2 text-sm text-muted">
                {sortedStores.length} lugares encontrados
                {query ? ` para “${query}”` : ''}
              </p>
            </div>
            <label className="flex items-center gap-3 text-sm text-muted">
              Ordenar por
              <select
                className="rounded-xl border border-line bg-white px-4 py-2.5 font-semibold text-primary"
                onChange={(event) => setSort(event.target.value)}
                value={sort}
              >
                <option>Recomendados</option>
                <option>Más rápidos</option>
                <option>Mejor valorados</option>
              </select>
            </label>
          </div>
          <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
            <button
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                !categoryValue
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-white text-primary'
              }`}
              onClick={() => selectCategory('')}
              type="button"
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                  selectedCategory?.id === category.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-primary'
                }`}
                key={category.id}
                onClick={() => selectCategory(category.slug)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card mt-7 grid min-h-80 place-items-center text-muted">
              <span className="inline-flex items-center gap-2">
                <Icon className="animate-spin" name="progress_activity" />
                Consultando catálogo…
              </span>
            </div>
          ) : error ? (
            <div className="card mt-7 border-danger/20 p-6 text-sm text-danger">
              {error}
            </div>
          ) : sortedStores.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="card mt-7 flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-panel text-primary">
                <Icon className="text-[30px]" name="search_off" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-primary">
                Sin resultados
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Prueba otra búsqueda o elimina algunos filtros para ver más
                comercios.
              </p>
              <button
                className="primary-button mt-6"
                onClick={clearFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
