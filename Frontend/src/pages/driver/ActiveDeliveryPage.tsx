import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { RouteMap } from '../../components/maps/RouteMap'
import { RoleHeader } from '../../components/layout/RoleHeader'
import { useAuth } from '../../context/AuthContext'
import {
  advanceDelivery,
  getActiveDelivery,
  getDriverProfile,
  updateDriverLocation,
} from '../../services/driverApi'
import type {
  ActiveDelivery,
  DeliveryAssignmentStatus,
  DriverProfile,
} from '../../types/driver'

const deliverySteps: Array<{
  status: DeliveryAssignmentStatus
  label: string
}> = [
  { status: 'Accepted', label: 'Entrega aceptada' },
  { status: 'HeadingToStore', label: 'En camino al comercio' },
  { status: 'PickedUp', label: 'Pedido recolectado' },
  { status: 'OutForDelivery', label: 'En camino al cliente' },
  { status: 'Delivered', label: 'Entregado' },
]

const nextStatus: Partial<
  Record<DeliveryAssignmentStatus, DeliveryAssignmentStatus>
> = {
  Accepted: 'HeadingToStore',
  HeadingToStore: 'PickedUp',
  PickedUp: 'OutForDelivery',
  OutForDelivery: 'Delivered',
}

const actionLabel: Partial<Record<DeliveryAssignmentStatus, string>> = {
  Accepted: 'Iniciar ruta al comercio',
  HeadingToStore: 'Confirmar recolección',
  PickedUp: 'Iniciar ruta al cliente',
  OutForDelivery: 'Marcar como entregado',
}

export function ActiveDeliveryPage() {
  const { accessToken } = useAuth()
  const [delivery, setDelivery] = useState<ActiveDelivery | null>(null)
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const lastLocationSentAt = useRef(0)
  const assignmentId = delivery?.assignmentId

  useEffect(() => {
    if (!accessToken) return
    Promise.all([
      getActiveDelivery(accessToken),
      getDriverProfile(accessToken),
    ])
      .then(([active, driverProfile]) => {
        setDelivery(active)
        setProfile(driverProfile)
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar la entrega.',
        ),
      )
      .finally(() => setLoading(false))
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !assignmentId || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now()
        if (now - lastLocationSentAt.current < 10_000) return
        lastLocationSentAt.current = now

        try {
          const updatedProfile = await updateDriverLocation(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            accessToken,
          )
          setProfile(updatedProfile)
          setDelivery(await getActiveDelivery(accessToken))
          setLocationMessage('Ubicación compartida en tiempo real.')
        } catch {
          setLocationMessage(
            'La ubicación no pudo actualizarse; se intentará nuevamente.',
          )
        }
      },
      () =>
        setLocationMessage(
          'Autoriza el GPS para que el cliente vea tu avance.',
        ),
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 12_000,
      },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [accessToken, assignmentId])

  async function advance() {
    if (!accessToken || !delivery) return
    const target = nextStatus[delivery.status]
    if (!target) return

    setWorking(true)
    setError('')
    try {
      const updated = await advanceDelivery(
        delivery.assignmentId,
        target,
        accessToken,
      )
      setDelivery(updated)
      setProfile(await getDriverProfile(accessToken))
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible actualizar la entrega.',
      )
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted">
        Calculando la ruta…
      </main>
    )
  }

  if (!delivery) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <Icon className="text-5xl text-muted" name="route" />
          <h1 className="mt-4 font-display text-4xl text-primary">
            No tienes una entrega activa
          </h1>
          <p className="mt-3 text-sm text-muted">{error}</p>
          <Link className="primary-button mt-6" to="/repartidor">
            Ver entregas disponibles
          </Link>
        </div>
      </main>
    )
  }

  const currentStep = Math.max(
    0,
    deliverySteps.findIndex((step) => step.status === delivery.status),
  )
  const completed = delivery.status === 'Delivered'
  const driverPoint =
    profile?.currentLatitude != null &&
    profile.currentLongitude != null
      ? {
          latitude: profile.currentLatitude,
          longitude: profile.currentLongitude,
        }
      : null

  return (
    <div className="min-h-screen bg-background pb-28 pt-20 md:pb-8">
      <RoleHeader
        driverStatus={profile?.availabilityStatus}
        role="Repartidor"
      />
      <main className="page-shell py-6 md:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <div className="relative">
              <RouteMap
                driver={driverPoint}
                dropoff={{
                  latitude: delivery.dropoff.latitude,
                  longitude: delivery.dropoff.longitude,
                }}
                geometry={delivery.route.geometry}
                pickup={{
                  latitude: delivery.pickup.latitude,
                  longitude: delivery.pickup.longitude,
                }}
              />
              <div className="absolute left-4 top-4 z-[400] max-w-xs rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
                <p className="text-xs font-semibold text-muted">
                  Entrega {delivery.orderNumber}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-primary">
                  {deliverySteps[currentStep]?.label}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {(delivery.route.distanceMeters / 1000).toFixed(1)} km ·{' '}
                  {Math.ceil(delivery.route.durationSeconds / 60)} min
                  {delivery.route.isEstimated ? ' aprox.' : ''}
                </p>
              </div>
            </div>

            <article className="card p-5 md:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="eyebrow">Estado de la entrega</p>
                <span className="status-pill bg-success/10 text-success">
                  <Icon className="text-[17px]" name="gps_fixed" />
                  {locationMessage || 'Esperando señal GPS…'}
                </span>
              </div>
              <div className="mt-5">
                {deliverySteps.map((step, index) => {
                  const active = index === currentStep
                  const done = index < currentStep || completed
                  return (
                    <div
                      className="relative flex gap-4 pb-6 last:pb-0"
                      key={step.status}
                    >
                      {index < deliverySteps.length - 1 ? (
                        <span
                          className={`absolute left-5 top-10 h-[calc(100%-16px)] w-0.5 ${
                            done ? 'bg-accent' : 'bg-line'
                          }`}
                        />
                      ) : null}
                      <span
                        className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                          done
                            ? 'bg-accent text-white'
                            : active
                              ? 'bg-primary text-white ring-8 ring-primary/8'
                              : 'bg-panel text-muted'
                        }`}
                      >
                        <Icon
                          className="text-[19px]"
                          name={done ? 'check' : 'circle'}
                        />
                      </span>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            active ? 'text-accent' : 'text-primary'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {done
                            ? 'Completado'
                            : active
                              ? 'Estado actual'
                              : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </article>
          </section>

          <aside className="space-y-5">
            <article className="card p-5">
              <p className="eyebrow">Recoge en</p>
              <h2 className="mt-3 font-display text-xl font-semibold text-primary">
                {delivery.pickup.name}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {delivery.pickup.address}
              </p>
              {delivery.pickup.phoneNumber ? (
                <a
                  className="ghost-button mt-4 w-full"
                  href={`tel:${delivery.pickup.phoneNumber}`}
                >
                  <Icon name="call" /> Llamar al comercio
                </a>
              ) : null}
            </article>

            <article className="card p-5">
              <p className="eyebrow">Entrega a</p>
              <h2 className="mt-3 font-display text-xl font-semibold text-primary">
                {delivery.dropoff.name}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {delivery.dropoff.address}
              </p>
              {delivery.dropoff.phoneNumber ? (
                <a
                  className="ghost-button mt-4 w-full"
                  href={`tel:${delivery.dropoff.phoneNumber}`}
                >
                  <Icon name="call" /> Llamar al cliente
                </a>
              ) : null}
            </article>

            <article className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  Ganancia estimada
                </span>
                <strong className="text-lg text-success">
                  ${delivery.driverEarnings.toFixed(2)} MXN
                </strong>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">
                  Distancia restante
                </span>
                <strong>
                  {(delivery.route.distanceMeters / 1000).toFixed(1)} km
                </strong>
              </div>
            </article>
            {error ? (
              <p className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                {error}
              </p>
            ) : null}
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:static md:mx-auto md:mt-2 md:max-w-7xl md:border-0 md:bg-transparent md:px-12">
        {completed ? (
          <Link className="primary-button w-full !bg-success" to="/repartidor/historial">
            <Icon name="check_circle" />
            Entrega completada · Ver historial
          </Link>
        ) : (
          <button
            className="primary-button w-full"
            disabled={working}
            onClick={advance}
            type="button"
          >
            {working
              ? 'Actualizando…'
              : actionLabel[delivery.status] ?? 'Avanzar estado'}
            <Icon name="arrow_forward" />
          </button>
        )}
        <p className="mt-2 text-center text-[10px] text-muted">
          Al avanzar confirmas que completaste el estado anterior.
        </p>
      </div>
    </div>
  )
}
