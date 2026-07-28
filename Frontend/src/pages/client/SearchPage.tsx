import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StoreCard } from '../../components/cards/StoreCard'
import { Icon } from '../../components/common/Icon'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { stores } from '../../data/mockData'

const chips = ['Todos', 'Hamburguesas', 'Tacos', 'Sushi', 'Saludable']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState(params.get('categoria') ?? 'Todos')
  const [sort, setSort] = useState('Recomendados')
  const query = params.get('q') ?? ''

  const filteredStores = useMemo(() => {
    const normalized = category.toLowerCase()
    return stores.filter((store) => {
      const matchesQuery =
        !query ||
        `${store.name} ${store.category}`.toLowerCase().includes(query.toLowerCase())
      const matchesCategory =
        category === 'Todos' ||
        store.category.toLowerCase().includes(normalized.replace('restaurantes', ''))
      return matchesQuery && matchesCategory
    })
  }, [category, query])

  function clearFilters() {
    setCategory('Todos')
    setSort('Recomendados')
    setParams({})
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader />
      <main className="page-shell grid gap-8 py-10 md:grid-cols-[240px_1fr] md:py-14">
        <aside className="card hidden h-fit p-5 md:block">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-primary">Filtros</h2>
            <button className="text-xs font-bold text-accent hover:underline" onClick={clearFilters} type="button">
              Limpiar
            </button>
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-primary">Categoría</legend>
            <div className="mt-3 space-y-3">
              {chips.map((chip) => (
                <label className="flex items-center gap-3 text-sm text-muted" key={chip}>
                  <input
                    checked={category === chip}
                    className="size-4 text-accent focus:ring-accent"
                    name="category"
                    onChange={() => setCategory(chip)}
                    type="radio"
                  />
                  {chip}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-7 border-t border-line pt-6">
            <legend className="text-sm font-bold text-primary">Calificación</legend>
            <label className="mt-3 flex items-center gap-3 text-sm text-muted">
              <input className="size-4 rounded text-accent focus:ring-accent" type="checkbox" />
              4.5 o más
            </label>
          </fieldset>
          <fieldset className="mt-7 border-t border-line pt-6">
            <legend className="text-sm font-bold text-primary">Disponibilidad</legend>
            <label className="mt-3 flex items-center gap-3 text-sm text-muted">
              <input defaultChecked className="size-4 rounded text-accent focus:ring-accent" type="checkbox" />
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
              const nextQuery = String(form.get('search') ?? '')
              setParams(nextQuery ? { q: nextQuery } : {})
            }}
          >
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" name="search" />
            <input
              className="field min-h-12 pl-12"
              defaultValue={query}
              name="search"
              placeholder="Buscar comercios o platillos"
            />
          </form>
          <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Explora cerca de ti</p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
                Resultados
              </h1>
              <p className="mt-2 text-sm text-muted">
                {filteredStores.length} lugares encontrados{query ? ` para “${query}”` : ''}
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
            {chips.map((chip) => (
              <button
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                  category === chip
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-primary'
                }`}
                key={chip}
                onClick={() => setCategory(chip)}
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
          {filteredStores.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="card mt-7 flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-panel text-primary">
                <Icon className="text-[30px]" name="search_off" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-primary">Sin resultados</h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Prueba otra búsqueda o elimina algunos filtros para ver más comercios.
              </p>
              <button className="primary-button mt-6" onClick={clearFilters} type="button">
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
