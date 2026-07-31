import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { RouteMap } from '../../components/maps/RouteMap'
import { RoleHeader } from '../../components/layout/RoleHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import {
  acceptDelivery,
  getAvailableDeliveries,
  getDriverProfile,
  getDriverSummary,
  rejectDelivery,
  setDriverAvailability,
  updateDriverLocation,
} from '../../services/driverApi'
import { previewBestRoute } from '../../services/routingApi'
import type {
  AvailableDelivery,
  DriverProfile,
  DriverSummary,
} from '../../types/driver'
import type { RouteResult } from '../../types/routing'

export function DriverDashboardPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [summary, setSummary] = useState<DriverSummary | null>(null)
  const [deliveries, setDeliveries] = useState<AvailableDelivery[]>([])
  const [selected, setSelected] = useState<AvailableDelivery | null>(null)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [locationError, setLocationError] = useState('')

  const loadAvailable = useCallback(async (
    driverProfile: DriverProfile,
  ) => {
    if (!accessToken) return
    const items = await getAvailableDeliveries(accessToken)
    setDeliveries(items)
    const first = items[0] ?? null
    setSelected(first)

    if (
      first &&
      driverProfile.currentLatitude != null &&
      driverProfile.currentLongitude != null
    ) {
      setRoute(
        await previewBestRoute(
          {
            latitude: driverProfile.currentLatitude,
            longitude: driverProfile.currentLongitude,
          },
          {
            latitude: first.dropoff.latitude,
            longitude: first.dropoff.longitude,
          },
          accessToken,
          {
            latitude: first.pickup.latitude,
            longitude: first.pickup.longitude,
          },
          driverProfile.vehicleType === 'Bicycle'
            ? 'cycling'
            : 'driving',
        ),
      )
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    Promise.all([
      getDriverProfile(accessToken),
      getDriverSummary(accessToken),
    ])
      .then(async ([driverProfile, driverSummary]) => {
        setProfile(driverProfile)
        setSummary(driverSummary)

        if (
          driverProfile.availabilityStatus === 'Available' &&
          driverProfile.currentLatitude != null &&
          driverProfile.currentLongitude != null
        ) {
          await loadAvailable(driverProfile)
        }
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el panel.',
        ),
      )
      .finally(() => setLoading(false))
  }, [accessToken, loadAvailable])

  function enableAvailability() {
    if (!accessToken) return
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no permite obtener la ubicación.')
      return
    }

    setWorking(true)
    setError('')
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          let driverProfile = await updateDriverLocation(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            accessToken,
          )
          driverProfile = await setDriverAvailability(
            'Available',
            accessToken,
          )
          setProfile(driverProfile)
          await loadAvailable(driverProfile)
        } catch (reason) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'No fue posible activar la disponibilidad.',
          )
        } finally {
          setWorking(false)
        }
      },
      () => {
        setLocationError(
          'Autoriza la ubicación para calcular las entregas más eficientes.',
        )
        setWorking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 20_000,
      },
    )
  }

  async function disableAvailability() {
    if (!accessToken) return
    setWorking(true)
    try {
      setProfile(
        await setDriverAvailability('Offline', accessToken),
      )
      setDeliveries([])
      setSelected(null)
      setRoute(null)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible cambiar la disponibilidad.',
      )
    } finally {
      setWorking(false)
    }
  }

  async function selectDelivery(delivery: AvailableDelivery) {
    if (
      !accessToken ||
      profile?.currentLatitude == null ||
      profile.currentLongitude == null
    ) {
      return
    }

    setSelected(delivery)
    setRoute(null)
    try {
      setRoute(
        await previewBestRoute(
          {
            latitude: profile.currentLatitude,
            longitude: profile.currentLongitude,
          },
          {
            latitude: delivery.dropoff.latitude,
            longitude: delivery.dropoff.longitude,
          },
          accessToken,
          {
            latitude: delivery.pickup.latitude,
            longitude: delivery.pickup.longitude,
          },
          profile.vehicleType === 'Bicycle'
            ? 'cycling'
            : 'driving',
        ),
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible calcular la ruta.',
      )
    }
  }

  async function accept(orderId: string) {
    if (!accessToken) return
    setWorking(true)
    setError('')
    try {
      await acceptDelivery(orderId, accessToken)
      navigate('/repartidor/entrega-activa')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible aceptar la entrega.',
      )
      if (profile) await loadAvailable(profile)
    } finally {
      setWorking(false)
    }
  }

  async function reject(orderId: string) {
    if (!accessToken) return
    setWorking(true)
    setError('')
    try {
      await rejectDelivery(
        orderId,
        accessToken,
        'El repartidor eligió otra entrega.',
      )
      if (profile) await loadAvailable(profile)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible rechazar la entrega.',
      )
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <RoleHeader
        driverStatus={profile?.availabilityStatus}
        role="Repartidor"
      />
      <main className="page-shell py-10 md:py-14">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Asignación eficiente</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
              Entregas disponibles
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Se ordenan por distancia total, tiempo y ganancia. La primera
              opción es la más eficiente desde tu ubicación actual.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-primary px-5 py-4 text-white shadow-lg">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Icon name="receipt_long" />
                {summary?.completedToday ?? 0} entregas hoy
              </p>
              <p className="mt-1 text-xs text-white/60">
                Ganancias: ${(summary?.earningsToday ?? 0).toFixed(2)} MXN
              </p>
            </div>
            {profile?.availabilityStatus === 'OnDelivery' ? (
              <Link
                className="primary-button"
                to="/repartidor/entrega-activa"
              >
                Ver entrega activa
              </Link>
            ) : profile?.availabilityStatus === 'Available' ? (
              <button
                className="ghost-button"
                disabled={working}
                onClick={disableAvailability}
                type="button"
              >
                <Icon name="pause_circle" />
                Dejar de recibir
              </button>
            ) : (
              <button
                className="primary-button"
                disabled={working}
                onClick={enableAvailability}
                type="button"
              >
                <Icon name="my_location" />
                {working ? 'Localizando…' : 'Empezar a recibir'}
              </button>
            )}
          </div>
        </div>

        {locationError || error ? (
          <p className="mt-6 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {locationError || error}
          </p>
        ) : null}

        {selected ? (
          <section className="mt-8 grid items-start gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative">
              <RouteMap
                driver={
                  profile?.currentLatitude != null &&
                  profile.currentLongitude != null
                    ? {
                        latitude: profile.currentLatitude,
                        longitude: profile.currentLongitude,
                      }
                    : null
                }
                dropoff={{
                  latitude: selected.dropoff.latitude,
                  longitude: selected.dropoff.longitude,
                }}
                geometry={route?.geometry ?? []}
                pickup={{
                  latitude: selected.pickup.latitude,
                  longitude: selected.pickup.longitude,
                }}
              />
              <div className="absolute left-4 top-4 z-[400] max-w-xs rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
                <p className="eyebrow">Vista de ruta</p>
                <h2 className="mt-1 font-display text-2xl text-primary">
                  {selected.pickup.name}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {(selected.totalDistanceMeters / 1000).toFixed(1)} km ·{' '}
                  {selected.estimatedMinutes} min
                </p>
              </div>
            </div>
            <article className="card p-6">
              <span className="status-pill bg-success/10 text-success">
                {selected.isRecommended
                  ? 'Ruta recomendada'
                  : 'Ruta seleccionada'}
              </span>
              <p className="eyebrow mt-5">{selected.orderNumber}</p>
              <h2 className="mt-2 font-display text-3xl text-primary">
                {selected.pickup.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Recoge en {selected.pickup.address} y entrega en{' '}
                {selected.dropoff.address}.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-panel p-4">
                  <dt className="text-xs text-muted">Ganancia</dt>
                  <dd className="mt-1 font-bold text-success">
                    ${selected.driverEarnings.toFixed(2)}
                  </dd>
                </div>
                <div className="rounded-xl bg-panel p-4">
                  <dt className="text-xs text-muted">Productos</dt>
                  <dd className="mt-1 font-bold text-primary">
                    {selected.itemCount}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  className="ghost-button w-full"
                  disabled={working}
                  onClick={() => reject(selected.orderId)}
                  type="button"
                >
                  <Icon name="cancel" />
                  Rechazar
                </button>
                <button
                  className="primary-button w-full"
                  disabled={working}
                  onClick={() => accept(selected.orderId)}
                  type="button"
                >
                  <Icon name="check_circle" />
                  Aceptar
                </button>
              </div>
            </article>
          </section>
        ) : null}

        <section className="mt-8">
          {loading ? (
            <p className="py-10 text-center text-muted">
              Cargando panel…
            </p>
          ) : profile?.availabilityStatus !== 'Available' ? (
            <div className="card p-10 text-center">
              <Icon
                className="text-5xl text-accent"
                name="location_searching"
              />
              <h2 className="mt-4 font-display text-3xl text-primary">
                Activa tu ubicación
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
                La ubicación se utiliza para recomendar pedidos cercanos y
                calcular la ruta más eficiente.
              </p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="card p-10 text-center">
              <Icon
                className="text-5xl text-muted"
                name="inventory_2"
              />
              <h2 className="mt-4 font-display text-3xl text-primary">
                No hay entregas listas
              </h2>
              <p className="mt-2 text-sm text-muted">
                Actualizaremos la lista cuando un comercio marque un pedido
                como listo para recoger.
              </p>
              <button
                className="ghost-button mt-5"
                onClick={() => {
                  if (profile) void loadAvailable(profile)
                }}
                type="button"
              >
                <Icon name="refresh" />
                Actualizar
              </button>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {deliveries.map((delivery) => (
                <article
                  className={`card card-hover p-5 ${
                    selected?.orderId === delivery.orderId
                      ? 'ring-2 ring-accent'
                      : ''
                  }`}
                  key={delivery.orderId}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{delivery.orderNumber}</p>
                      <h3 className="mt-1 font-display text-2xl text-primary">
                        {delivery.pickup.name}
                      </h3>
                    </div>
                    <strong className="text-success">
                      ${delivery.driverEarnings.toFixed(2)}
                    </strong>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-muted">
                    <p className="flex gap-2">
                      <Icon
                        className="text-[19px] text-primary"
                        name="route"
                      />
                      {(delivery.totalDistanceMeters / 1000).toFixed(1)} km
                      totales · {delivery.estimatedMinutes} min
                    </p>
                    <p className="flex gap-2">
                      <Icon
                        className="text-[19px] text-primary"
                        name="near_me"
                      />
                      {(delivery.distanceToPickupMeters / 1000).toFixed(1)} km
                      hasta el comercio
                    </p>
                  </div>
                  {delivery.isRecommended ? (
                    <span className="status-pill mt-5 bg-success/10 text-success">
                      Mejor eficiencia
                    </span>
                  ) : null}
                  <button
                    className="ghost-button mt-5 w-full"
                    onClick={() => selectDelivery(delivery)}
                    type="button"
                  >
                    <Icon name="map" />
                    Ver ruta
                  </button>
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
