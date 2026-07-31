import { apiRequest } from '../lib/api'
import type { OrderTracking } from '../types/driver'

export function getOrderTracking(
  orderId: string,
  accessToken: string,
) {
  return apiRequest<OrderTracking>(
    `/tracking/orders/${orderId}`,
    {},
    accessToken,
  )
}
