export type PaymentMethodType = 'Card' | 'Cash'

export type PaymentMethod = {
  id: string
  type: PaymentMethodType
  displayName: string
  provider: string | null
  cardBrand: string | null
  lastFourDigits: string | null
  expirationMonth: number | null
  expirationYear: number | null
  isDefault: boolean
  createdAt: string
}

export type SavePaymentMethodInput = {
  type: PaymentMethodType
  displayName: string
  provider: string | null
  cardBrand: string | null
  lastFourDigits: string | null
  expirationMonth: number | null
  expirationYear: number | null
  isDefault: boolean
}
