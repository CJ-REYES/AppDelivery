import { apiRequest } from '../lib/api'
import type {
  CreateOrderInput,
  MerchantSalesSummary,
  Order,
  OrderStatus,
} from '../types/order'

export const orderApi = {
  create: (input: CreateOrderInput, token: string) =>
    apiRequest<Order>(
      '/orders',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),

  getMine: (token: string) =>
    apiRequest<Order[]>('/orders', {}, token),

  get: (orderId: string, token: string) =>
    apiRequest<Order>(`/orders/${orderId}`, {}, token),

  getLatest: (token: string, trackableOnly = false) =>
    apiRequest<Order | null>(
      `/orders/latest?trackableOnly=${trackableOnly}`,
      {},
      token,
    ),

  cancel: (orderId: string, reason: string, token: string) =>
    apiRequest<Order>(
      `/orders/${orderId}/cancel`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      },
      token,
    ),
}

export const merchantOrderApi = {
  getAll: (token: string) =>
    apiRequest<Order[]>('/merchant/orders', {}, token),

  get: (orderId: string, token: string) =>
    apiRequest<Order>(`/merchant/orders/${orderId}`, {}, token),

  getSummary: (token: string) =>
    apiRequest<MerchantSalesSummary>(
      '/merchant/orders/summary',
      {},
      token,
    ),

  updateStatus: (
    orderId: string,
    status: OrderStatus,
    note: string | null,
    token: string,
  ) =>
    apiRequest<Order>(
      `/merchant/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      },
      token,
    ),
}
