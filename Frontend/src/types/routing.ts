export type GeoPoint = {
  latitude: number
  longitude: number
}

export type RouteResult = {
  distanceMeters: number
  durationSeconds: number
  geometry: GeoPoint[]
  isEstimated: boolean
  profile: 'driving' | 'cycling' | 'walking'
}
