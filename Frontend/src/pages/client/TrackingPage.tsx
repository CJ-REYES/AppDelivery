import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { RouteMap } from '../../components/maps/RouteMap'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import { orderApi } from '../../services/orderApi'
import { getOrderTracking } from '../../services/trackingApi'
import {
  createTrackingConnection,
  type TrackingUpdateEvent,
} from '../../services/trackingHub'
import type {
  DeliveryAssignmentStatus,
  OrderTracking,
} from '../../types/driver'

const states: Array<{
  status: DeliveryAssignmentStatus
  label: string
}> = [
  { status: 'Accepted', label: 'Entrega asignada' },
  { status: 'HeadingToStore', label: 'Va al comercio' },
  { status: 'PickedUp', label: 'Pedido recogido' },
  { status: 'OutForDelivery', label: 'En camino a tu dirección' },
  { status: 'Delivered', label: 'Entregado' },
]

export function TrackingPage() {
  const { orderId } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasRecentOrder, setHasRecentOrder] = useState(true)
  const [realTimeConnected, setRealTimeConnected] = useState(false)

  useEffect(() => {
    if (!accessToken || orderId) return
    let active = true
    orderApi
      .getLatest(accessToken, true)
      .then((order) => {
        if (!active) return
        if (order?.id) {
          navigate(`/seguimiento/${order.id}`, { replace: true })
        } else {
          setHasRecentOrder(false)
          setLoading(false)
        }
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible buscar tu pedido reciente.',
        )
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, navigate, orderId])

  useEffect(() => {
    if (!accessToken || !orderId) return
    let active = true
    const connection = createTrackingConnection(accessToken)

    async function load() {
      try {
        const response = await getOrderTracking(orderId!, accessToken!)
        if (active) {
          setTracking(response)
          setError('')
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'No fue posible consultar el seguimiento.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    connection.on(
      'orderUpdated',
      (event: TrackingUpdateEvent) => {
        if (event.orderId.toLowerCase() === orderId.toLowerCase()) {
          void load()
        }
      },
    )
    connection.onreconnecting(() => {
      if (active) setRealTimeConnected(false)
    })
    connection.onreconnected(() => {
      if (!active) return
      setRealTimeConnected(true)
      void connection.invoke('SubscribeToOrder', orderId)
    })
    connection.onclose(() => {
      if (active) setRealTimeConnected(false)
    })

    async function startRealTime() {
      try {
        await connection.start()
        await connection.invoke('SubscribeToOrder', orderId)
        if (active) setRealTimeConnected(true)
      } catch {
        if (active) setRealTimeConnected(false)
      }
    }

    void startRealTime()
    const timer = window.setInterval(() => void load(), 30_000)
    return () => {
      active = false
      window.clearInterval(timer)
      void connection.stop()
    }
  }, [accessToken, orderId])

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <ClientHeader cartCount={0} />
        <main className="page-shell grid min-h-[70vh] place-items-center py-12">
          <div className="card w-full max-w-xl p-7 text-center">
            <Icon className="text-5xl text-accent" name="route" />
            <h1 className="mt-4 font-display text-4xl text-primary">
              {loading
                ? 'Buscando tu pedido reciente'
                : hasRecentOrder
                  ? 'Seguimiento no disponible'
                  : 'No tienes pedidos en curso'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              {loading
                ? 'Abriremos automáticamente el seguimiento más reciente.'
                : error ||
                  'Crea un pedido o abre uno desde tu historial para seguirlo.'}
            </p>
            {!loading ? (
              <button
                className="primary-button mt-5 w-full"
                onClick={() => navigate('/pedidos')}
                type="button"
              >
                Ir a Mis pedidos
              </button>
            ) : null}
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <ClientHeader cartCount={0} />
      <main className="page-shell py-8 md:py-12">
        {loading ? (
          <p className="py-20 text-center text-muted">
            Localizando al repartidor…
          </p>
        ) : error && !tracking ? (
          <div className="card mx-auto max-w-xl p-8 text-center">
            <Icon className="text-5xl text-danger" name="location_off" />
            <h1 className="mt-4 font-display text-3xl text-primary">
              Seguimiento no disponible
            </h1>
            <p className="mt-3 text-sm text-danger">{error}</p>
          </div>
        ) : tracking ? (
          <>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">
                  Pedido {tracking.orderNumber}
                </p>
                <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
                  Sigue tu entrega
                </h1>
              </div>
              <span className="status-pill w-fit bg-success/10 text-success">
                <Icon className="text-[18px]" name="sync" />
                {realTimeConnected
                  ? 'Seguimiento en tiempo real'
                  : 'Reconectando · respaldo cada 30 segundos'}
              </span>
            </div>

            <section className="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
              <div className="relative">
                <RouteMap
                  driver={
                    tracking.driverLatitude != null &&
                    tracking.driverLongitude != null
                      ? {
                          latitude: tracking.driverLatitude,
                          longitude: tracking.driverLongitude,
                        }
                      : null
                  }
                  dropoff={{
                    latitude: tracking.dropoff.latitude,
                    longitude: tracking.dropoff.longitude,
                  }}
                  geometry={tracking.route.geometry}
                  pickup={{
                    latitude: tracking.pickup.latitude,
                    longitude: tracking.pickup.longitude,
                  }}
                />
                <div className="absolute bottom-4 left-4 z-[400] max-w-sm rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
                  <p className="text-xs font-semibold text-muted">
                    Estado actual
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-primary">
                    {states.find(
                      (state) =>
                        state.status === tracking.deliveryStatus,
                    )?.label ?? 'Preparando tu pedido'}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {(tracking.route.distanceMeters / 1000).toFixed(1)} km ·{' '}
                    {Math.ceil(tracking.route.durationSeconds / 60)} min
                    {tracking.route.isEstimated ? ' aprox.' : ''}
                  </p>
                </div>
              </div>

              <aside className="space-y-5">
                <article className="card p-5">
                  <p className="eyebrow">Ruta</p>
                  <div className="mt-4 space-y-5">
                    <div className="flex gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-panel text-primary">
                        <Icon name="storefront" />
                      </span>
                      <div>
                        <strong className="text-primary">
                          {tracking.pickup.name}
                        </strong>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {tracking.pickup.address}
                        </p>
                      </div>
                    </div>
                    <div className="ml-5 h-6 border-l-2 border-dashed border-line" />
                    <div className="flex gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white">
                        <Icon name="home" />
                      </span>
                      <div>
                        <strong className="text-primary">
                          {tracking.dropoff.name}
                        </strong>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {tracking.dropoff.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="card p-5">
                  <p className="eyebrow">Tu repartidor</p>
                  <h2 className="mt-3 font-display text-2xl text-primary">
                    {tracking.driverName ?? 'Buscando repartidor'}
                  </h2>
                  <p className="mt-2 text-xs text-muted">
                    {tracking.driverLocationUpdatedAt
                      ? `GPS actualizado ${new Date(
                          tracking.driverLocationUpdatedAt,
                        ).toLocaleTimeString('es-MX')}`
                      : 'Todavía no hay una ubicación en vivo.'}
                  </p>
                  {tracking.driverPhoneNumber ? (
                    <a
                      className="ghost-button mt-4 w-full"
                      href={`tel:${tracking.driverPhoneNumber}`}
                    >
                      <Icon name="call" />
                      Llamar
                    </a>
                  ) : null}
                </article>
                {error ? (
                  <p className="rounded-xl bg-warning/10 p-3 text-xs text-primary">
                    La última actualización falló; conservamos la ruta
                    anterior.
                  </p>
                ) : null}
              </aside>
            </section>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  )
}
