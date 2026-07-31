import { Link } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'

const benefits = {
  merchant: ['Publica tu menú y fotografías', 'Gestiona pedidos y disponibilidad', 'Diseña el perfil de tu restaurante'],
  driver: ['Acepta entregas disponibles', 'Consulta ganancias e historial', 'Construye tu calificación'],
}

export function RoleOnboardingPage() {
  const { user } = useAuth()
  const merchantRegistered = user?.roles.includes('Merchant') ?? false
  const driverRegistered = user?.roles.includes('Driver') ?? false

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader cartCount={0} />
      <main className="page-shell py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Una cuenta, tres posibilidades</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-primary md:text-6xl">
            Haz crecer tu actividad con AppDelivery
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
            Conserva tu cuenta de cliente y activa también un perfil de restaurante,
            repartidor o ambos. Tus datos de acceso siguen siendo los mismos.
          </p>
        </div>

        <section className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
          <article className="card card-hover overflow-hidden">
            <div className="bg-primary p-7 text-white">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/12">
                <Icon className="text-[30px]" name="storefront" />
              </span>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-white/55">Para comercios</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Vende con tu restaurante</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Registra tu negocio, personaliza su página y administra comida, imágenes y pedidos.
              </p>
            </div>
            <div className="p-7">
              <ul className="space-y-3">
                {benefits.merchant.map((benefit) => (
                  <li className="flex items-center gap-3 text-sm text-muted" key={benefit}>
                    <Icon className="text-[20px] text-success" name="check_circle" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                className="primary-button mt-7 w-full"
                to={
                  merchantRegistered
                    ? '/mi-comercio'
                    : '/registro-comercio'
                }
              >
                {merchantRegistered
                  ? 'Ir a mi restaurante'
                  : 'Registrar mi restaurante'}
                <Icon className="text-[18px]" name="arrow_forward" />
              </Link>
            </div>
          </article>

          <article className="card card-hover overflow-hidden">
            <div className="bg-[#ffe9df] p-7 text-primary">
              <span className="grid size-14 place-items-center rounded-2xl bg-white">
                <Icon className="text-[30px] text-accent" name="two_wheeler" />
              </span>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-accent">Para repartidores</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Reparte en tus horarios</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Crea tu perfil, registra tu vehículo y consulta entregas, desempeño y calificaciones.
              </p>
            </div>
            <div className="p-7">
              <ul className="space-y-3">
                {benefits.driver.map((benefit) => (
                  <li className="flex items-center gap-3 text-sm text-muted" key={benefit}>
                    <Icon className="text-[20px] text-success" name="check_circle" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                className="secondary-button mt-7 w-full"
                to={
                  driverRegistered
                    ? '/repartidor'
                    : '/registro-repartidor'
                }
              >
                {driverRegistered ? 'Ir a mis entregas' : 'Quiero repartir'}
                <Icon className="text-[18px]" name="arrow_forward" />
              </Link>
            </div>
          </article>
        </section>

        <div className="mx-auto mt-8 flex max-w-5xl items-start gap-3 rounded-2xl border border-line bg-white p-5">
          <Icon className="text-success" name="verified_user" />
          <div>
            <p className="text-sm font-bold text-primary">Tu cuenta de cliente no cambia</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Podrás cambiar entre los perfiles desde tu cuenta. El registro de negocio o repartidor
              solo agrega nuevas herramientas.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
