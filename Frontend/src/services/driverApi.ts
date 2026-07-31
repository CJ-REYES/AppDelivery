import { apiRequest } from '../lib/api'
import type {
  ActiveDelivery,
  AvailableDelivery,
  DeliveryAssignmentStatus,
  DeliveryHistory,
  DriverAvailabilityStatus,
  DriverProfile,
  DriverSummary,
  SaveDriverProfileInput,
} from '../types/driver'
import type { GeoPoint } from '../types/routing'

export function getDriverProfile(accessToken: string) {
  return apiRequest<DriverProfile>('/drivers/me', {}, accessToken)
}

export function registerDriver(
  input: SaveDriverProfileInput,
  accessToken: string,
) {
  return apiRequest<DriverProfile>(
    '/drivers',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    accessToken,
  )
}

export function updateDriver(
  input: SaveDriverProfileInput,
  accessToken: string,
) {
  return apiRequest<DriverProfile>(
    '/drivers/me',
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
    accessToken,
  )
}

export function setDriverAvailability(
  status: DriverAvailabilityStatus,
  accessToken: string,
) {
  return apiRequest<DriverProfile>(
    '/drivers/me/availability',
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    accessToken,
  )
}

export function updateDriverLocation(
  point: GeoPoint,
  accessToken: string,
) {
  return apiRequest<DriverProfile>(
    '/drivers/me/location',
    {
      method: 'PUT',
      body: JSON.stringify(point),
    },
    accessToken,
  )
}

export function getDriverSummary(accessToken: string) {
  return apiRequest<DriverSummary>(
    '/drivers/me/summary',
    {},
    accessToken,
  )
}

export function getAvailableDeliveries(accessToken: string) {
  return apiRequest<AvailableDelivery[]>(
    '/delivery-assignments/available',
    {},
    accessToken,
  )
}

export function acceptDelivery(orderId: string, accessToken: string) {
  return apiRequest<ActiveDelivery>(
    `/delivery-assignments/orders/${orderId}/accept`,
    { method: 'POST' },
    accessToken,
  )
}

export function rejectDelivery(
  orderId: string,
  accessToken: string,
  reason: string | null = null,
) {
  return apiRequest<void>(
    `/delivery-assignments/orders/${orderId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
    accessToken,
  )
}

export function getActiveDelivery(accessToken: string) {
  return apiRequest<ActiveDelivery>(
    '/delivery-assignments/active',
    {},
    accessToken,
  )
}

export function advanceDelivery(
  assignmentId: string,
  status: DeliveryAssignmentStatus,
  accessToken: string,
  driverNotes: string | null = null,
) {
  return apiRequest<ActiveDelivery>(
    `/delivery-assignments/${assignmentId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, driverNotes }),
    },
    accessToken,
  )
}

export function getDeliveryHistory(accessToken: string) {
  return apiRequest<DeliveryHistory[]>(
    '/delivery-assignments/history',
    {},
    accessToken,
  )
}
