import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/cards/ProductCard'
import { Icon } from '../../components/common/Icon'
import { ProductModal } from '../../components/common/ProductModal'
import { SectionHeading } from '../../components/common/SectionHeading'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { images, products, type Product } from '../../data/mockData'

type CartLine = {
  product: Product
  quantity: number
}

export function StorePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartLine[]>([
    { product: products[0], quantity: 1 },
    { product: products[3], quantity: 1 },
  ])
  const [added, setAdded] = useState(false)

  const cartTotal = useMemo(
    () => cart.reduce((total, line) => total + line.product.price * line.quantity, 0),
    [cart],
  )
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0)

  function addProduct(product: Product, quantity = 1) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line,
        )
      }
      return [...current, { product, quantity }]
    })
    setSelectedProduct(null)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  function updateLine(id: string, delta: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === id
            ? { ...line, quantity: Math.max(0, line.quantity + delta) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-20 lg:pb-0">
      <ClientHeader cartCount={itemCount} />
      <main>
        <section className="relative h-72 overflow-hidden md:h-[420px]">
          <img alt="Interior de Maya Burger" className="h-full w-full object-cover" src={images.burger} />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10" />
          <div className="page-shell absolute inset-x-0 bottom-8 flex items-end gap-5 text-white">
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-panel font-display text-3xl font-bold text-primary shadow-xl">
              MB
            </span>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="status-pill bg-success text-white">Abierto</span>
                <span className="status-pill bg-white/90 text-primary">Entrega rápida</span>
              </div>
              <h1 className="font-display text-4xl font-semibold md:text-6xl">Maya Burger</h1>
              <p className="mt-2 max-w-xl text-sm text-white/75">
                Hamburguesas artesanales con ingredientes locales y sabores inspirados en Yucatán.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white">
          <div className="page-shell flex flex-wrap items-center gap-5 py-5 text-sm font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon className="text-warning" filled name="star" />
              <strong className="text-primary">4.9</strong> (328 reseñas)
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="schedule" /> 20–30 min
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="delivery_dining" /> $25 MXN
            </span>
            <button className="ml-auto icon-button border border-line" type="button">
              <Icon name="favorite" />
            </button>
          </div>
        </section>

        <div className="sticky top-20 z-30 border-b border-line bg-background/95 backdrop-blur">
          <nav className="page-shell no-scrollbar flex gap-2 overflow-x-auto py-3">
            {['Más populares', 'Hamburguesas', 'Complementos', 'Bebidas'].map((category, index) => (
              <a
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  index === 0 ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-panel'
                }`}
                href="#menu"
                key={category}
              >
                {category}
              </a>
            ))}
          </nav>
        </div>

        <div className="page-shell grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
          <section id="menu">
            <SectionHeading
              description="Los favoritos de nuestros clientes"
              title="Más populares"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {products.slice(0, 3).map((product) => (
                <ProductCard key={product.id} onAdd={setSelectedProduct} product={product} />
              ))}
            </div>
            <div className="mt-12">
              <SectionHeading title="Hamburguesas y complementos" />
              <div className="grid gap-4 xl:grid-cols-2">
                {products.slice(3).map((product) => (
                  <ProductCard key={product.id} onAdd={setSelectedProduct} product={product} />
                ))}
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="card sticky top-40 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-primary">Tu pedido</h2>
                <span className="status-pill bg-panel text-primary">{itemCount} artículos</span>
              </div>
              <div className="mt-5 space-y-4">
                {cart.length ? (
                  cart.map((line) => (
                    <div className="flex items-center gap-3" key={line.product.id}>
                      <img
                        alt=""
                        className="size-12 rounded-xl object-cover"
                        src={line.product.image}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-primary">{line.product.name}</p>
                        <p className="text-xs text-muted">${line.product.price} MXN</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full border border-line">
                        <button
                          aria-label="Disminuir"
                          className="grid size-8 place-items-center"
                          onClick={() => updateLine(line.product.id, -1)}
                          type="button"
                        >
                          <Icon className="text-[17px]" name="remove" />
                        </button>
                        <span className="text-xs font-bold">{line.quantity}</span>
                        <button
                          aria-label="Aumentar"
                          className="grid size-8 place-items-center"
                          onClick={() => updateLine(line.product.id, 1)}
                          type="button"
                        >
                          <Icon className="text-[17px]" name="add" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted">Tu carrito está vacío.</p>
                )}
              </div>
              <div className="my-5 border-t border-line" />
              <div className="flex justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <strong>${cartTotal} MXN</strong>
              </div>
              <Link className="primary-button mt-5 w-full" to="/checkout">
                Ir al carrito
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />

      <Link
        className="fixed inset-x-4 bottom-4 z-40 flex min-h-14 items-center justify-between rounded-full bg-accent px-5 font-bold text-white shadow-xl lg:hidden"
        to="/checkout"
      >
        <span>{itemCount} productos</span>
        <span>Ver carrito · ${cartTotal} MXN</span>
      </Link>

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
