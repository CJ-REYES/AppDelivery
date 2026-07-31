export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'ReadyForPickup'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'

export type PaymentStatus =
  | 'Pending'
  | 'Authorized'
  | 'Paid'
  | 'Failed'
  | 'Refunded'

export type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string | null
}

export type OrderStatusHistory = {
  status: OrderStatus
  changedByRole: string
  note: string | null
  createdAt: string
}

export type Order = {
  id: string
  orderNumber: string
  storeId: string
  storeName: string
  storeLogoUrl: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  deliveryFee: number
  serviceFee: number
  discountAmount: number
  total: number
  deliveryRecipientName: string
  deliveryPhoneNumber: string
  deliveryAddress: string
  deliveryLatitude: number | null
  deliveryLongitude: number | null
  customerNotes: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  deliveredAt: string | null
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
}

export type CreateOrderInput = {
  storeId: string
  deliveryAddressId: string
  paymentMethodId: string | null
  customerNotes: string | null
  items: Array<{
    productId: string
    quantity: number
    notes: string | null
  }>
}

export type MerchantSalesSummary = {
  totalOrders: number
  pendingOrders: number
  activeOrders: number
  deliveredOrders: number
  cancelledOrders: number
  grossSales: number
  salesToday: number
}
