import { apiRequest } from '../lib/api'
import type {
  PaymentMethod,
  SavePaymentMethodInput,
} from '../types/payment'

export const paymentApi = {
  getAll: (token: string) =>
    apiRequest<PaymentMethod[]>('/payment-methods', {}, token),

  create: (input: SavePaymentMethodInput, token: string) =>
    apiRequest<PaymentMethod>(
      '/payment-methods',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),

  setDefault: (paymentMethodId: string, token: string) =>
    apiRequest<PaymentMethod>(
      `/payment-methods/${paymentMethodId}/default`,
      { method: 'PATCH' },
      token,
    ),

  delete: (paymentMethodId: string, token: string) =>
    apiRequest<void>(
      `/payment-methods/${paymentMethodId}`,
      { method: 'DELETE' },
      token,
    ),
}
