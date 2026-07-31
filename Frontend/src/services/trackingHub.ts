import {
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr'

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:5258/api'
).replace(/\/$/, '')

const backendBaseUrl = apiBaseUrl.endsWith('/api')
  ? apiBaseUrl.slice(0, -4)
  : apiBaseUrl

export type TrackingUpdateEvent = {
  orderId: string
  reason: string
  occurredAt: string
}

export function createTrackingConnection(accessToken: string) {
  return new HubConnectionBuilder()
    .withUrl(`${backendBaseUrl}/hubs/tracking`, {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
    .configureLogging(LogLevel.Warning)
    .build()
}
