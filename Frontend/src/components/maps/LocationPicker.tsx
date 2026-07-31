import { useCallback, useEffect, useRef, useState } from 'react'
import { divIcon, type LatLngExpression } from 'leaflet'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { GeoPoint } from '../../types/routing'
import { Icon } from '../common/Icon'

type LocationPickerProps = {
  value: GeoPoint | null
  onChange: (value: GeoPoint) => void
  title?: string
  description?: string
}

const mexicoCenter: LatLngExpression = [23.6345, -102.5528]
let lastKnownLocation: GeoPoint | null = null
let pendingLocation: Promise<GeoPoint> | null = null

function requestBrowserLocation(forceRefresh = false) {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error('Este navegador no permite obtener la ubicación.'),
    )
  }

  if (!forceRefresh && lastKnownLocation) {
    return Promise.resolve(lastKnownLocation)
  }

  if (!pendingLocation) {
    pendingLocation = new Promise<GeoPoint>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          lastKnownLocation = point
          resolve(point)
        },
        () => {
          reject(
            new Error(
              'No fue posible obtener tu ubicación. Autoriza el acceso o marca el punto manualmente.',
            ),
          )
        },
        {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: forceRefresh ? 0 : 30_000,
        },
      )
    }).finally(() => {
      pendingLocation = null
    })
  }

  return pendingLocation
}
const locationIcon = divIcon({
  className: '',
  html: '<span class="map-marker map-marker-location"><span class="material-symbols-outlined">location_on</span></span>',
  iconAnchor: [22, 44],
  iconSize: [44, 44],
})

function MapClickHandler({
  onChange,
}: {
  onChange: (value: GeoPoint) => void
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      })
    },
  })
  return null
}

function RecenterMap({ value }: { value: GeoPoint | null }) {
  const map = useMap()

  useEffect(() => {
    if (value) {
      map.flyTo([value.latitude, value.longitude], 16, {
        duration: 0.7,
      })
    }
  }, [map, value])

  return null
}

export function LocationPicker({
  value,
  onChange,
  title = 'Ubicación exacta',
  description = 'Haz clic en el mapa o usa tu ubicación actual.',
}: LocationPickerProps) {
  const [locationError, setLocationError] = useState('')
  const [locating, setLocating] = useState(false)
  const autoLocateAttempted = useRef(false)

  const locateCurrentPosition = useCallback(async (forceRefresh = true) => {
    setLocating(true)
    setLocationError('')
    try {
      onChange(await requestBrowserLocation(forceRefresh))
    } catch (reason) {
      setLocationError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible obtener tu ubicación.',
      )
    } finally {
      setLocating(false)
    }
  }, [onChange])

  useEffect(() => {
    if (value || autoLocateAttempted.current) return
    autoLocateAttempted.current = true
    void locateCurrentPosition(false)
  }, [locateCurrentPosition, value])

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-bold text-primary">{title}</h3>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
        <button
          className="ghost-button !min-h-10 !px-4"
          disabled={locating}
          onClick={() => void locateCurrentPosition()}
          type="button"
        >
          <Icon className="text-[18px]" name="my_location" />
          {locating ? 'Localizando…' : 'Usar mi ubicación'}
        </button>
      </div>
      <div className="h-80">
        <MapContainer
          center={value
            ? [value.latitude, value.longitude]
            : mexicoCenter}
          className="h-full w-full"
          scrollWheelZoom
          zoom={value ? 16 : 5}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={onChange} />
          <RecenterMap value={value} />
          {value ? (
            <Marker
              icon={locationIcon}
              position={[value.latitude, value.longitude]}
            />
          ) : null}
        </MapContainer>
      </div>
      <div className="flex flex-col justify-between gap-2 bg-panel/55 px-4 py-3 text-xs sm:flex-row sm:items-center">
        <span className={value ? 'text-success' : 'text-muted'}>
          {value
            ? 'Punto confirmado para calcular rutas.'
            : locating
              ? 'Obteniendo tu ubicación actual…'
              : 'Selecciona un punto para continuar.'}
        </span>
        {value ? (
          <code className="font-semibold text-primary">
            {value.latitude.toFixed(7)}, {value.longitude.toFixed(7)}
          </code>
        ) : null}
      </div>
      {locationError ? (
        <p className="border-t border-danger/20 bg-danger/5 px-4 py-3 text-xs text-danger">
          {locationError}
        </p>
      ) : null}
    </section>
  )
}
