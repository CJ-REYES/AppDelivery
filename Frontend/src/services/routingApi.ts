import { apiRequest } from '../lib/api'
import type { GeoPoint, RouteResult } from '../types/routing'

export function previewBestRoute(
  origin: GeoPoint,
  destination: GeoPoint,
  accessToken: string,
  waypoint?: GeoPoint | null,
  profile: RouteResult['profile'] = 'driving',
) {
  return apiRequest<RouteResult>(
    '/routes/best',
    {
      method: 'POST',
      body: JSON.stringify({
        origin,
        waypoint: waypoint ?? null,
        destination,
        profile,
      }),
    },
    accessToken,
  )
}
