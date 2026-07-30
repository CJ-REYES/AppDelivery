import { useState } from 'react'
import { OrderCard } from '../../components/cards/OrderCard'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { images } from '../../data/mockData'

type Tab = 'En curso' | 'Anteriores' | 'Cancelados'

export function OrdersPage() {
  const [tab, setTab] = useState<Tab>('En curso')

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader cartCount={0} />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Historial y seguimiento</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">Mis pedidos</h1>
        <p className="mt-2 text-sm text-muted">Gestiona tus pedidos en curso y revisa tu historial.</p>

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-line">
          {(['En curso', 'Anteriores', 'Cancelados'] as Tab[]).map((item) => (
            <button
              className={`shrink-0 border-b-2 px-5 py-3 text-sm font-bold transition ${
                tab === item ? 'border-accent text-accent' : 'border-transparent text-muted'
              }`}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <section className="mt-7 space-y-4">
          {tab === 'En curso' ? (
            <OrderCard
              active
              date="Hoy, 9:42 a. m."
              image={images.burger}
              name="Maya Burger"
              order="#AD-2048"
              total="$290 MXN"
            />
          ) : null}
          {tab === 'Anteriores' ? (
            <>
              <OrderCard
                date="18 jul 2026"
                image={images.tacos}
                name="La Pizzería Local"
                order="#AD-1992"
                total="$245 MXN"
              />
              <OrderCard
                date="11 jul 2026"
                image={images.healthy}
                name="Green Bowl Center"
                order="#AD-1887"
                total="$322 MXN"
              />
            </>
          ) : null}
          {tab === 'Cancelados' ? (
            <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-panel text-primary">
                <span className="material-symbols-outlined text-[30px]">receipt_long</span>
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-primary">
                No tienes pedidos cancelados
              </h2>
              <p className="mt-2 text-sm text-muted">Aquí aparecerán si cancelas algún pedido.</p>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
