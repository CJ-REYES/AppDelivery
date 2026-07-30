import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { images } from '../../data/mockData'

const timeline = [
  ['receipt_long', 'Pedido recibido', '9:42 a. m.'],
  ['skillet', 'En preparación', '9:47 a. m.'],
  ['takeout_dining', 'Listo para recolección', '10:06 a. m.'],
  ['delivery_dining', 'En camino', '10:12 a. m.'],
  ['home', 'Entregado', 'Pendiente'],
] as const

export function TrackingPage() {
  const [detailsOpen, setDetailsOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader cartCount={0} />
      <main className="page-shell py-10 md:py-14">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Pedido #AD-2048</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
              ¡Pedido en camino!
            </h1>
            <p className="mt-2 text-sm text-muted">Tu pedido llegará aproximadamente en 15–20 min.</p>
          </div>
          <Link className="ghost-button w-fit" to="/pedidos">
            Ver todos mis pedidos
          </Link>
        </div>

        <section className="card mt-8 p-5 md:p-7">
          <div className="grid gap-6 md:grid-cols-5">
            {timeline.map(([icon, label, time], index) => {
              const complete = index < 3
              const current = index === 3
              return (
                <div className="relative flex gap-4 md:flex-col md:items-center md:text-center" key={label}>
                  {index < timeline.length - 1 ? (
                    <span
                      className={`absolute left-[21px] top-11 h-[calc(100%+24px)] w-0.5 md:left-1/2 md:top-[21px] md:h-0.5 md:w-[calc(100%+24px)] ${
                        complete ? 'bg-accent' : 'bg-line'
                      }`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-full ${
                      complete
                        ? 'bg-accent text-white'
                        : current
                          ? 'animate-pulse bg-primary text-white ring-8 ring-primary/8'
                          : 'bg-panel-strong text-muted'
                    }`}
                  >
                    <Icon className="text-[20px]" name={complete ? 'check' : icon} />
                  </span>
                  <div className="pb-7 md:pb-0">
                    <p className={`text-sm font-bold ${current ? 'text-accent' : 'text-primary'}`}>
                      {label}
                    </p>
                    <p className="mt-1 text-xs text-muted">{time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[1fr_340px]">
          <section className="card overflow-hidden">
            <div className="map-surface relative h-[360px] overflow-hidden">
              <div className="absolute left-[14%] top-[22%] h-2 w-2 rounded-full bg-primary/30" />
              <div className="absolute left-[20%] top-[38%] h-1.5 w-[64%] rotate-[8deg] rounded-full bg-accent/55" />
              <span className="absolute left-[18%] top-[31%] grid size-12 place-items-center rounded-full bg-white text-primary shadow-lg">
                <Icon name="storefront" />
              </span>
              <span className="absolute right-[18%] top-[46%] grid size-14 place-items-center rounded-full bg-accent text-white shadow-xl ring-8 ring-accent/15">
                <Icon name="delivery_dining" />
              </span>
              <span className="absolute bottom-[20%] right-[10%] grid size-12 place-items-center rounded-full bg-primary text-white shadow-lg">
                <Icon name="home" />
              </span>
              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur">
                <p className="text-xs font-semibold text-muted">Estado actual</p>
                <p className="mt-1 font-display text-xl font-semibold text-primary">En camino a tu dirección</p>
                <p className="mt-1 text-xs text-muted">Esta vista no usa rastreo GPS en vivo.</p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Recoge en</p>
                <p className="mt-2 font-bold text-primary">Maya Burger</p>
                <p className="mt-1 text-xs text-muted">Calle 47, Centro, Mérida</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Entrega en</p>
                <p className="mt-2 font-bold text-primary">Casa · Carlos Reyes</p>
                <p className="mt-1 text-xs text-muted">Calle 60 #425, Centro</p>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <article className="card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Tu repartidor</p>
              <div className="mt-4 flex items-center gap-4">
                <img alt="Carlos Méndez" className="size-16 rounded-full object-cover" src={images.driver} />
                <div>
                  <h2 className="font-display text-xl font-semibold text-primary">Carlos Méndez</h2>
                  <p className="text-xs text-muted">Motocicleta · Placa 42-9KT</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-primary">
                    <Icon className="text-[15px] text-warning" filled name="star" /> 4.9
                  </p>
                </div>
              </div>
              <button className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white" type="button">
                <Icon name="chat" />
                Contactar por WhatsApp
              </button>
            </article>

            <article className="card overflow-hidden">
              <button
                aria-expanded={detailsOpen}
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setDetailsOpen((value) => !value)}
                type="button"
              >
                <span className="font-display text-xl font-semibold text-primary">Resumen del pedido</span>
                <Icon name={detailsOpen ? 'expand_less' : 'expand_more'} />
              </button>
              {detailsOpen ? (
                <div className="border-t border-line px-5 pb-5 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Hamburguesa Maya × 1</span>
                    <span>$149</span>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <span className="text-muted">Papas grandes × 1</span>
                    <span>$65</span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-line pt-4 font-bold text-primary">
                    <span>Total</span>
                    <span>$290 MXN</span>
                  </div>
                </div>
              ) : null}
            </article>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
