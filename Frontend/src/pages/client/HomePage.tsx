import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StoreCard } from '../../components/cards/StoreCard'
import { Icon } from '../../components/common/Icon'
import { SectionHeading } from '../../components/common/SectionHeading'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { categories, images, stores } from '../../data/mockData'

export function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/buscar${search ? `?q=${encodeURIComponent(search)}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader />
      <main className="page-shell py-10 md:py-16">
        <section>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-accent">Viernes, 24 de julio</p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
                Hola, Carlos
              </h1>
              <p className="mt-2 text-lg text-muted">¿Qué se te antoja hoy?</p>
            </div>
            <button className="ghost-button w-fit !justify-start" type="button">
              <Icon className="text-accent" name="location_on" />
              Calle 60 #425, Centro
              <Icon className="text-[18px]" name="expand_more" />
            </button>
          </div>
          <form
            className="relative mt-8 max-w-3xl shadow-[0_8px_35px_rgba(23,33,29,.08)]"
            onSubmit={submitSearch}
          >
            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" name="search" />
            <input
              className="field min-h-14 rounded-2xl border-0 pl-14 pr-32 text-base"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar restaurantes, platillos o antojos…"
              value={search}
            />
            <button className="primary-button absolute right-1.5 top-1.5 !min-h-11 !px-5" type="submit">
              Buscar
            </button>
          </form>
        </section>

        <section className="mt-9">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3">
            {categories.map(([icon, name], index) => (
              <Link
                className={`flex min-w-24 flex-col items-center gap-2 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${
                  index === 0
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-primary hover:bg-panel'
                }`}
                key={name}
                to={`/buscar?categoria=${encodeURIComponent(name)}`}
              >
                <Icon name={icon} />
                <span className="text-[11px] font-bold">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative mt-8 overflow-hidden rounded-[28px] bg-primary-soft p-6 text-white md:p-10">
          <img
            alt=""
            className="absolute inset-y-0 right-0 hidden w-1/2 object-cover opacity-45 md:block"
            src={images.burger}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-soft via-primary-soft/95 to-transparent" />
          <div className="relative max-w-lg">
            <span className="status-pill bg-accent text-white">Bienvenido a AppDelivery</span>
            <h2 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
              Envío gratis en tu primer pedido
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Descubre los sabores de tu zona y apoya a comercios locales.
            </p>
            <Link className="primary-button mt-6" to="/buscar">
              Pedir ahora
              <Icon className="text-[18px]" name="arrow_forward" />
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            action={
              <Link className="text-sm font-bold text-accent hover:underline" to="/buscar">
                Ver todos
              </Link>
            }
            description="Opciones disponibles cerca de tu dirección"
            title="Comercios cerca de ti"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <div>
            <SectionHeading title="Entrega rápida" />
            <div className="grid gap-5 sm:grid-cols-2">
              {stores.slice(0, 2).map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading title="Tu pedido reciente" />
            <article className="card h-[calc(100%-52px)] p-5">
              <div className="flex items-center gap-4">
                <img alt="Maya Burger" className="size-16 rounded-xl object-cover" src={images.burger} />
                <div>
                  <h3 className="font-display text-xl font-semibold text-primary">Maya Burger</h3>
                  <p className="text-xs text-muted">Pedido #AD-1042</p>
                </div>
              </div>
              <div className="my-6 border-t border-line" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">2 productos</span>
                <strong>$249 MXN</strong>
              </div>
              <Link className="secondary-button mt-6 w-full" to="/comercio/maya-burger">
                Volver a pedir
              </Link>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
