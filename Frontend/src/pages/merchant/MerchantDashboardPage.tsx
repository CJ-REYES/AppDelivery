import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { MerchantHeader } from '../../components/layout/MerchantHeader'
import { useAuth } from '../../context/AuthContext'
import { merchantCatalogApi } from '../../services/catalogApi'
import type {
  Product,
  ProductCategory,
  StoreDetail,
} from '../../types/catalog'

export function MerchantDashboardPage() {
  const [store, setStore] = useState<StoreDetail | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { accessToken } = useAuth()

  useEffect(() => {
    if (!accessToken) return
    let active = true

    Promise.all([
      merchantCatalogApi.getStore(accessToken),
      merchantCatalogApi.getCategories(accessToken),
      merchantCatalogApi.getProducts(accessToken),
    ])
      .then(([nextStore, nextCategories, nextProducts]) => {
        if (!active) return
        setStore(nextStore)
        setCategories(nextCategories)
        setProducts(nextProducts)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el panel.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [accessToken])

  return (
    <div className="dashboard-grid min-h-screen bg-background">
      <MerchantHeader />
      <main className="page-shell py-10 md:py-14">
        {loading ? (
          <div className="grid min-h-[60vh] place-items-center text-muted">
            <span className="inline-flex items-center gap-2">
              <Icon className="animate-spin" name="progress_activity" />
              Cargando panel…
            </span>
          </div>
        ) : error || !store ? (
          <div className="card mx-auto max-w-xl p-8 text-center">
            <Icon className="text-[48px] text-danger" name="error" />
            <h1 className="mt-4 font-display text-3xl font-semibold text-primary">
              No fue posible cargar el comercio
            </h1>
            <p className="mt-2 text-sm text-muted">{error}</p>
          </div>
        ) : (
          <>
            <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow">Administración del comercio</p>
                <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
                  {store.name}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  {store.storeCategoryName} · {store.neighborhood},{' '}
                  {store.city}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="ghost-button"
                  to={`/comercio/${store.id}`}
                >
                  <Icon name="visibility" />
                  Ver página pública
                </Link>
                <Link
                  className="primary-button"
                  to="/mi-comercio/productos"
                >
                  <Icon name="add" />
                  Publicar producto
                </Link>
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [
                  'storefront',
                  'Estado',
                  store.isOpen ? 'Abierto' : 'Cerrado',
                  store.isOpen ? 'text-success' : 'text-muted',
                ],
                [
                  'category',
                  'Categorías',
                  String(categories.length),
                  'text-primary',
                ],
                [
                  'restaurant_menu',
                  'Productos',
                  String(products.length),
                  'text-primary',
                ],
                [
                  'check_circle',
                  'Disponibles',
                  String(products.filter((product) => product.isAvailable).length),
                  'text-success',
                ],
              ].map(([icon, label, value, color]) => (
                <article className="card p-5" key={label}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-panel text-primary">
                      <Icon name={icon} />
                    </span>
                    <strong className={`font-display text-3xl ${color}`}>
                      {value}
                    </strong>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-muted">
                    {label}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Catálogo</p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-primary">
                      Productos recientes
                    </h2>
                  </div>
                  <Link
                    className="text-sm font-bold text-accent hover:underline"
                    to="/mi-comercio/productos"
                  >
                    Administrar
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div
                      className="flex items-center gap-3 rounded-xl border border-line p-3"
                      key={product.id}
                    >
                      <span className="grid size-11 place-items-center rounded-xl bg-panel text-primary">
                        <Icon name="restaurant" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-primary">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted">
                          {product.productCategoryName}
                        </p>
                      </div>
                      <strong className="text-sm text-primary">
                        ${product.price.toFixed(2)}
                      </strong>
                    </div>
                  ))}
                  {!products.length ? (
                    <p className="rounded-xl bg-panel p-5 text-center text-sm text-muted">
                      Aún no has publicado productos.
                    </p>
                  ) : null}
                </div>
              </article>

              <article className="card p-6">
                <p className="eyebrow">Siguiente paso</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-primary">
                  Completa tu catálogo
                </h2>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon className="text-success" name="check_circle" />
                    <div>
                      <p className="text-sm font-bold text-primary">
                        Comercio registrado
                      </p>
                      <p className="text-xs text-muted">
                        Ya puede consultarse desde MariaDB.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon
                      className={
                        categories.length ? 'text-success' : 'text-warning'
                      }
                      name={categories.length ? 'check_circle' : 'pending'}
                    />
                    <div>
                      <p className="text-sm font-bold text-primary">
                        Crea categorías
                      </p>
                      <p className="text-xs text-muted">
                        Organiza el menú para facilitar la consulta.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon
                      className={
                        products.length ? 'text-success' : 'text-warning'
                      }
                      name={products.length ? 'check_circle' : 'pending'}
                    />
                    <div>
                      <p className="text-sm font-bold text-primary">
                        Publica productos
                      </p>
                      <p className="text-xs text-muted">
                        Los clientes los verán en la página pública.
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  className="secondary-button mt-7 w-full"
                  to="/mi-comercio/perfil"
                >
                  Editar información del comercio
                </Link>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
