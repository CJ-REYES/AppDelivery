import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../../components/cards/ProductCard'
import { Icon } from '../../components/common/Icon'
import { ProductModal } from '../../components/common/ProductModal'
import { SectionHeading } from '../../components/common/SectionHeading'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAppState } from '../../context/AppStateContext'
import { catalogApi } from '../../services/catalogApi'
import type { Product, StoreDetail } from '../../types/catalog'

export function StorePage() {
  const { storeId = '' } = useParams()
  const [store, setStore] = useState<StoreDetail | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const {
    cart,
    addCartProduct,
    updateCartQuantity,
  } = useAppState()
  const storeCart = cart.filter((item) => item.storeId === storeId)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    Promise.all([
      catalogApi.getStore(storeId),
      catalogApi.getProducts(storeId),
    ])
      .then(([nextStore, nextProducts]) => {
        if (!active) return
        setStore(nextStore)
        setProducts(nextProducts)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el comercio.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [storeId])

  const cartTotal = useMemo(
    () =>
      storeCart.reduce(
        (total, line) => total + line.price * line.quantity,
        0,
      ),
    [storeCart],
  )
  const itemCount = storeCart.reduce(
    (total, line) => total + line.quantity,
    0,
  )

  const productSections = useMemo(
    () =>
      (store?.productCategories ?? [])
        .filter((category) => category.isActive)
        .map((category) => ({
          category,
          products: products.filter(
            (product) => product.productCategoryId === category.id,
          ),
        }))
        .filter((section) => section.products.length > 0),
    [products, store?.productCategories],
  )

  function addProduct(product: Product, quantity = 1) {
    addCartProduct(product, quantity)
    setSelectedProduct(null)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  function updateLine(id: string, delta: number) {
    updateCartQuantity(id, delta)
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted">
        <span className="inline-flex items-center gap-2">
          <Icon className="animate-spin" name="progress_activity" />
          Cargando comercio…
        </span>
      </main>
    )
  }

  if (error || !store) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="max-w-md">
          <Icon className="text-[52px] text-primary" name="store_off" />
          <h1 className="mt-4 font-display text-4xl font-semibold text-primary">
            Comercio no disponible
          </h1>
          <p className="mt-3 text-sm text-muted">
            {error || 'No encontramos el comercio solicitado.'}
          </p>
          <Link className="primary-button mt-6" to="/buscar">
            Explorar comercios
          </Link>
        </div>
      </main>
    )
  }

  const initials = store.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background pb-24 pt-20 lg:pb-0">
      <ClientHeader cartCount={itemCount} />
      <main>
        <section className="relative h-72 overflow-hidden bg-primary md:h-[420px]">
          {store.coverImageUrl ? (
            <img
              alt={`Portada de ${store.name}`}
              className="h-full w-full object-cover"
              src={store.coverImageUrl}
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-primary-soft to-primary">
              <Icon className="text-[130px] text-white/10" name="storefront" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/15" />
          <div className="page-shell absolute inset-x-0 bottom-8 flex items-end gap-5 text-white">
            {store.logoUrl ? (
              <img
                alt={`Logotipo de ${store.name}`}
                className="size-20 shrink-0 rounded-2xl border-4 border-white bg-panel object-cover shadow-xl"
                src={store.logoUrl}
              />
            ) : (
              <span className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-panel font-display text-3xl font-bold text-primary shadow-xl">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <span
                  className={`status-pill ${
                    store.isOpen ? 'bg-success' : 'bg-muted'
                  } text-white`}
                >
                  {store.isOpen ? 'Abierto' : 'Cerrado'}
                </span>
                <span className="status-pill bg-white/90 text-primary">
                  {store.storeCategoryName}
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold md:text-6xl">
                {store.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/75">
                {store.description}
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white">
          <div className="page-shell flex flex-wrap items-center gap-5 py-5 text-sm font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon className="text-warning" filled name="star" />
              <strong className="text-primary">
                {store.ratingCount > 0
                  ? store.ratingAverage.toFixed(1)
                  : 'Nuevo'}
              </strong>
              {store.ratingCount > 0
                ? ` (${store.ratingCount} reseñas)`
                : null}
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="schedule" />
              {store.estimatedDeliveryMinutesMin}–
              {store.estimatedDeliveryMinutesMax} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="delivery_dining" />{' '}
              {store.deliveryFee === 0
                ? 'Envío gratis'
                : `$${store.deliveryFee.toFixed(2)} MXN`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="location_on" />
              {store.neighborhood}, {store.city}
            </span>
          </div>
        </section>

        {productSections.length ? (
          <div className="sticky top-20 z-30 border-b border-line bg-background/95 backdrop-blur">
            <nav className="page-shell no-scrollbar flex gap-2 overflow-x-auto py-3">
              {productSections.map(({ category }, index) => (
                <a
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                    index === 0
                      ? 'bg-primary text-white'
                      : 'bg-white text-primary hover:bg-panel'
                  }`}
                  href={`#category-${category.id}`}
                  key={category.id}
                >
                  {category.name}
                </a>
              ))}
            </nav>
          </div>
        ) : null}

        <div className="page-shell grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
          <section>
            {productSections.length ? (
              <div className="space-y-12">
                {productSections.map(({ category, products: items }) => (
                  <div id={`category-${category.id}`} key={category.id}>
                    <SectionHeading
                      description={`${items.length} productos disponibles`}
                      title={category.name}
                    />
                    <div className="grid gap-4 xl:grid-cols-2">
                      {items.map((product) => (
                        <ProductCard
                          key={product.id}
                          onAdd={setSelectedProduct}
                          product={product}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card grid min-h-72 place-items-center p-8 text-center">
                <div>
                  <Icon
                    className="text-[48px] text-primary"
                    name="menu_book"
                  />
                  <h2 className="mt-4 font-display text-2xl font-semibold text-primary">
                    Catálogo en preparación
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    Este comercio aún no tiene productos disponibles.
                  </p>
                </div>
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            <div className="card sticky top-40 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Tu pedido
                </h2>
                <span className="status-pill bg-panel text-primary">
                  {itemCount} artículos
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {storeCart.length ? (
                  storeCart.map((line) => (
                    <div
                      className="flex items-center gap-3"
                      key={line.productId}
                    >
                      <span className="grid size-12 place-items-center rounded-xl bg-panel text-primary">
                        <Icon name="restaurant" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-primary">
                          {line.name}
                        </p>
                        <p className="text-xs text-muted">
                          ${line.price.toFixed(2)} MXN
                        </p>
                      </div>
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          aria-label="Disminuir"
                          className="grid size-8 place-items-center"
                          onClick={() => updateLine(line.productId, -1)}
                          type="button"
                        >
                          <Icon className="text-[17px]" name="remove" />
                        </button>
                        <span className="text-xs font-bold">
                          {line.quantity}
                        </span>
                        <button
                          aria-label="Aumentar"
                          className="grid size-8 place-items-center"
                          onClick={() => updateLine(line.productId, 1)}
                          type="button"
                        >
                          <Icon className="text-[17px]" name="add" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted">
                    Tu carrito está vacío.
                  </p>
                )}
              </div>
              <div className="my-5 border-t border-line" />
              <div className="flex justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <strong>${cartTotal.toFixed(2)} MXN</strong>
              </div>
              <Link
                className={`primary-button mt-5 w-full ${
                  storeCart.length ? '' : 'pointer-events-none opacity-50'
                }`}
                to="/checkout"
              >
                Ir al carrito
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />

      {itemCount > 0 ? (
        <Link
          className="fixed inset-x-4 bottom-4 z-40 flex min-h-14 items-center justify-between rounded-full bg-accent px-5 font-bold text-white shadow-xl lg:hidden"
          to="/checkout"
        >
          <span>{itemCount} productos</span>
          <span>Ver carrito · ${cartTotal.toFixed(2)} MXN</span>
        </Link>
      ) : null}

      {added ? (
        <div className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl">
          <Icon className="text-success" name="check_circle" />
          Producto agregado
        </div>
      ) : null}
      {selectedProduct ? (
        <ProductModal
          key={selectedProduct.id}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(quantity) => addProduct(selectedProduct, quantity)}
          product={selectedProduct}
        />
      ) : null}
    </div>
  )
}
