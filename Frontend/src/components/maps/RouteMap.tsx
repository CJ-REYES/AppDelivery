import { useEffect, useMemo } from 'react'
import { divIcon, latLngBounds } from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { GeoPoint } from '../../types/routing'

type RouteMapProps = {
  geometry: GeoPoint[]
  pickup: GeoPoint
  dropoff: GeoPoint
  driver?: GeoPoint | null
  className?: string
}

function markerIcon(kind: 'store' | 'home' | 'driver') {
  const icon =
    kind === 'store'
      ? 'storefront'
      : kind === 'home'
        ? 'home'
        : 'delivery_dining'
  return divIcon({
    className: '',
    html: `<span class="map-marker map-marker-${kind}"><span class="material-symbols-outlined">${icon}</span></span>`,
    iconAnchor: [22, 44],
    iconSize: [44, 44],
  })
}

const icons = {
  store: markerIcon('store'),
  home: markerIcon('home'),
  driver: markerIcon('driver'),
}

function FitRoute({ points }: { points: GeoPoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length < 2) return
    map.fitBounds(
      latLngBounds(
        points.map((point) => [point.latitude, point.longitude]),
      ),
      { padding: [36, 36] },
    )
  }, [map, points])

  return null
}

export function RouteMap({
  geometry,
  pickup,
  dropoff,
  driver,
  className = 'h-[420px]',
}: RouteMapProps) {
  const boundsPoints = useMemo(
    () => [
      ...(geometry.length ? geometry : [pickup, dropoff]),
      ...(driver ? [driver] : []),
    ],
    [driver, dropoff, geometry, pickup],
  )

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-line bg-panel ${className}`}
    >
      <MapContainer
        center={[pickup.latitude, pickup.longitude]}
        className="h-full w-full"
        scrollWheelZoom
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRoute points={boundsPoints} />
        {geometry.length > 1 ? (
          <Polyline
            pathOptions={{ color: '#fe6a2b', weight: 6, opacity: 0.85 }}
            positions={geometry.map((point) => [
              point.latitude,
              point.longitude,
            ])}
          />
        ) : null}
        <Marker
          icon={icons.store}
          position={[pickup.latitude, pickup.longitude]}
        />
        <Marker
          icon={icons.home}
          position={[dropoff.latitude, dropoff.longitude]}
        />
        {driver ? (
          <Marker
            icon={icons.driver}
            position={[driver.latitude, driver.longitude]}
          />
        ) : null}
      </MapContainer>
    </div>
  )
}
