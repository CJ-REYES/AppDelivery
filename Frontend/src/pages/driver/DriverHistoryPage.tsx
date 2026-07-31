import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { RoleHeader } from '../../components/layout/RoleHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import {
  getDeliveryHistory,
  getDriverProfile,
  getDriverSummary,
} from '../../services/driverApi'
import type {
  DeliveryHistory,
  DriverAvailabilityStatus,
  DriverSummary,
} from '../../types/driver'

export function DriverHistoryPage() {
  const { accessToken } = useAuth()
  const [history, setHistory] = useState<DeliveryHistory[]>([])
  const [summary, setSummary] = useState<DriverSummary | null>(null)
  const [status, setStatus] =
    useState<DriverAvailabilityStatus>('Offline')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) return
    Promise.all([
      getDeliveryHistory(accessToken),
      getDriverSummary(accessToken),
      getDriverProfile(accessToken),
    ])
      .then(([items, driverSummary, profile]) => {
        setHistory(items)
        setSummary(driverSummary)
        setStatus(profile.availabilityStatus)
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el historial.',
        ),
      )
      .finally(() => setLoading(false))
  }, [accessToken])

  const filtered = useMemo(
    () =>
      history.filter((delivery) =>
        `${delivery.storeName} ${delivery.customerName} ${delivery.orderNumber}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [history, query],
  )

  return (
    <div className="min-h-screen bg-background pt-20">
      <RoleHeader driverStatus={status} role="Repartidor" />
      <main className="page-shell py-10 md:py-14">
        <div className="max-w-4xl">
          <p className="eyebrow">Tu desempeño</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
            Pedidos repartidos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Historial de pedidos entregados y ganancias calculadas por el
            backend desde MariaDB.
          </p>
        </div>

        <section className="mt-9 grid gap-5 md:grid-cols-3">
          <article className="card p-6">
            <Icon className="text-primary" name="local_shipping" />
            <p className="mt-5 text-sm font-bold text-primary">
              Entregas totales
            </p>
            <strong className="mt-2 block font-display text-4xl text-primary">
              {summary?.completedDeliveries ?? 0}
            </strong>
            <span className="text-xs font-semibold text-success">
              {summary?.completedToday ?? 0} hoy
            </span>
          </article>
          <article className="card p-6">
            <Icon className="text-warning" name="star" filled />
            <p className="mt-5 text-sm font-bold text-primary">
              Calificación promedio
            </p>
            <strong className="mt-2 block font-display text-4xl text-primary">
              {(summary?.ratingAverage ?? 0).toFixed(1)}
            </strong>
            <span className="text-xs text-muted">
              {summary?.ratingCount ?? 0} evaluaciones
            </span>
          </article>
          <article className="rounded-2xl bg-primary-soft p-6 text-white shadow-lg">
            <Icon name="payments" />
            <p className="mt-5 text-sm font-bold">
              Ganancias de la semana
            </p>
            <strong className="mt-2 block font-display text-4xl">
              ${(summary?.earningsThisWeek ?? 0).toFixed(2)}
            </strong>
            <span className="text-xs text-white/60">MXN</span>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-center">
            <h2 className="font-display text-3xl font-semibold text-primary">
              Historial de pedidos
            </h2>
            <label className="relative max-w-xs">
              <Icon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted"
                name="search"
              />
              <input
                className="field !py-2.5 pl-10"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pedido, comercio o cliente…"
                value={query}
              />
            </label>
          </div>
          {loading ? (
            <p className="py-10 text-center text-sm text-muted">
              Cargando entregas…
            </p>
          ) : error ? (
            <p className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <div className="card mt-5 p-10 text-center">
              <Icon
                className="text-4xl text-muted"
                name="history_toggle_off"
              />
              <h3 className="mt-3 font-display text-2xl text-primary">
                Sin entregas para mostrar
              </h3>
              <p className="mt-2 text-sm text-muted">
                Las entregas completadas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filtered.map((delivery) => (
                <article
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                  key={delivery.assignmentId}
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-panel text-center text-xs text-primary">
                    <span>
                      <strong className="block text-base">
                        {new Date(delivery.deliveredAt).getDate()}
                      </strong>
                      {new Date(delivery.deliveredAt).toLocaleDateString(
                        'es-MX',
                        { month: 'short' },
                      )}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">{delivery.orderNumber}</p>
                    <h3 className="mt-1 font-bold text-primary">
                      {delivery.storeName}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Cliente: {delivery.customerName} ·{' '}
                      {(delivery.distanceMeters / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <strong className="text-success">
                      ${delivery.driverEarnings.toFixed(2)} MXN
                    </strong>
                    <span className="status-pill bg-success/10 text-success">
                      Completada
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
