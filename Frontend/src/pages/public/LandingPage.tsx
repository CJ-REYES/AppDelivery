import { Link } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { PublicHeader } from '../../components/layout/PublicHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { categories, images } from '../../data/mockData'

export function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-background">
      <PublicHeader />
      <main>
        <section className="hero-grid relative min-h-screen pt-28">
          <div className="page-shell grid min-h-[760px] items-center gap-12 pb-20 lg:grid-cols-[1.12fr_.88fr]">
            <div className="relative z-10">
              <p className="eyebrow mb-6">Delivery local, sencillo y rápido</p>
              <h1 className="max-w-4xl font-display text-[clamp(3.4rem,7vw,6.5rem)] font-bold leading-[.93] tracking-[-0.04em] text-primary">
                Todo lo que quieres, directo hasta tu{' '}
                <span className="text-accent">puerta.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted md:text-lg">
                Comida, productos y comercios locales en un solo lugar. Pide fácilmente y recibe
                donde estés.
              </p>
              <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_12px_45px_rgba(23,33,29,.1)] sm:flex-row">
                <label className="relative flex flex-1 items-center">
                  <span className="sr-only">Dirección de entrega</span>
                  <Icon className="absolute left-4 text-muted" name="location_on" />
                  <input
                    className="w-full rounded-xl border-0 bg-transparent py-3 pl-12 pr-4 text-sm focus:ring-0"
                    placeholder="Ingresa tu dirección de entrega"
                  />
                </label>
                <Link className="primary-button shrink-0" to="/inicio">
                  Explorar comercios
                  <Icon className="text-[19px]" name="arrow_forward" />
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
                <div className="flex -space-x-2">
                  {[images.owner, images.driver, images.customer].map((image, index) => (
                    <img
                      alt=""
                      className="size-8 rounded-full border-2 border-background object-cover"
                      key={image}
                      src={image}
                      style={{ zIndex: 3 - index }}
                    />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1">
                  <Icon className="text-[17px] text-warning" filled name="star" />
                  4.9 de calificación
                </span>
                <span>Más de 1,500 pedidos locales</span>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[570px] w-full max-w-[520px] lg:block">
              <div className="absolute inset-8 rounded-[48px] bg-primary-soft" />
              <img
                alt="Hamburguesa artesanal de Maya Burger"
                className="absolute inset-x-20 bottom-4 top-4 h-[530px] w-[360px] rounded-[38px] object-cover shadow-2xl"
                src={images.burger}
              />
              <article className="card absolute -left-6 bottom-24 w-64 p-4">
                <span className="status-pill bg-warning/25 text-[#7b5200]">Popular</span>
                <h2 className="mt-3 font-display text-xl font-semibold text-primary">
                  Hamburguesa Maya
                </h2>
                <p className="mt-1 text-xs text-muted">Maya Burger · 25 min</p>
                <div className="mt-4 flex items-center justify-between">
                  <strong>$149 MXN</strong>
                  <span className="grid size-10 place-items-center rounded-full bg-accent text-white">
                    <Icon name="add" />
                  </span>
                </div>
              </article>
              <article className="card absolute -right-6 top-24 w-60 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-panel text-primary">
                    <Icon name="delivery_dining" />
                  </span>
                  <div>
                    <p className="text-xs text-muted">Pedido en camino</p>
                    <p className="font-display text-lg font-semibold text-primary">12–18 min</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-panel-strong">
                  <div className="h-full w-3/4 rounded-full bg-accent" />
                </div>
                <p className="mt-2 text-xs font-semibold text-success">Tu repartidor ya salió</p>
              </article>
            </div>
          </div>
        </section>

        <section className="page-shell -mt-10 relative z-10 pb-24">
          <div className="grid gap-3 overflow-hidden rounded-[32px] bg-primary p-3 md:grid-cols-3">
            {[images.owner, images.driver, images.customer].map((image, index) => (
              <article className="group relative h-72 overflow-hidden rounded-2xl" key={image}>
                <img
                  alt={['Comercio local', 'Repartidor de AppDelivery', 'Cliente satisfecho'][index]}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  src={image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent" />
                <p className="absolute bottom-5 left-5 font-display text-2xl font-semibold text-white">
                  {['+120 comercios locales', 'Entrega rápida', '4.9 de calificación'][index]}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-shell py-20" id="comercios">
          <div className="max-w-2xl">
            <p className="eyebrow">Para cada antojo</p>
            <h2 className="section-title mt-3">Todo lo que necesitas, en un mismo lugar</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map(([icon, name]) => (
              <Link
                className="card card-hover flex min-h-32 flex-col items-center justify-center gap-3 p-4 text-center"
                key={name}
                to={`/buscar?categoria=${encodeURIComponent(name)}`}
              >
                <span className="grid size-12 place-items-center rounded-full bg-panel text-primary">
                  <Icon name={icon} />
                </span>
                <span className="text-xs font-bold text-primary">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-primary-soft py-24 text-white" id="como-funciona">
          <div className="page-shell">
            <p className="eyebrow">En tres pasos</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold md:text-5xl">
              De tu comercio favorito hasta tu puerta
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                ['01', 'Elige tu comercio', 'Descubre negocios locales cerca de ti.'],
                ['02', 'Agrega tus productos', 'Arma tu pedido y revisa el total con claridad.'],
                ['03', 'Recibe tu pedido', 'Sigue el avance y recibe sin complicaciones.'],
              ].map(([number, title, copy]) => (
                <article className="rounded-3xl bg-white/8 p-7" key={number}>
                  <span className="font-display text-5xl font-semibold text-accent">{number}</span>
                  <h3 className="mt-8 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell py-24">
          <div className="rounded-[36px] bg-[#ffddcf] px-6 py-14 text-center md:px-14">
            <p className="eyebrow">Empieza hoy</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold text-primary md:text-6xl">
              Tus favoritos están más cerca de lo que imaginas
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link className="primary-button" to="/inicio">
                Comenzar a pedir
              </Link>
              <Link className="secondary-button" to="/registro-comercio">
                Registrar mi comercio
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
