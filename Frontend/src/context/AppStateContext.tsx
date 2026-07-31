/* oxlint-disable react/only-export-components */
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Product } from '../types/catalog'

export type CustomerProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
}

export type Address = {
  id: string
  label: string
  street: string
  neighborhood: string
  city: string
  postalCode: string
  receiver: string
  phone: string
  references: string
  latitude: number | null
  longitude: number | null
  isPrimary: boolean
}

export type PaymentMethod = {
  id: string
  brand: string
  last4: string
  expiry: string
  holder: string
  isPrimary: boolean
}

export type MerchantProfile = {
  registered: boolean
  name: string
  category: string
  description: string
  address: string
  phone: string
  schedule: string
  deliveryFee: string
  logo: string
  cover: string
  isOpen: boolean
}

export type DriverProfile = {
  registered: boolean
  fullName: string
  email: string
  phone: string
  photo: string
  vehicle: string
  plate: string
  rating: number
  deliveries: number
  identification: boolean
  license: boolean
  insurance: boolean
}

export type CartItem = {
  productId: string
  storeId: string
  name: string
  price: number
  imageUrl: string | null
  stockQuantity: number
  quantity: number
}

type AppState = {
  profile: CustomerProfile
  addresses: Address[]
  paymentMethods: PaymentMethod[]
  merchant: MerchantProfile
  driver: DriverProfile
  cart: CartItem[]
}

type AppStateContextValue = AppState & {
  updateProfile: (profile: CustomerProfile) => void
  saveAddress: (address: Address) => void
  removeAddress: (id: string) => void
  setPrimaryAddress: (id: string) => void
  savePaymentMethod: (paymentMethod: PaymentMethod) => void
  removePaymentMethod: (id: string) => void
  setPrimaryPaymentMethod: (id: string) => void
  saveMerchant: (merchant: MerchantProfile) => void
  saveDriver: (driver: DriverProfile) => void
  addCartProduct: (product: Product, quantity?: number) => void
  updateCartQuantity: (productId: string, delta: number) => void
  clearCart: () => void
}

const defaultState: AppState = {
  profile: {
    firstName: 'Carlos',
    lastName: 'Reyes',
    email: 'carlos.reyes@example.com',
    phone: '+52 999 123 4567',
    avatar: '',
  },
  addresses: [
    {
      id: 'casa',
      label: 'Casa',
      street: 'Calle 60 #425',
      neighborhood: 'Centro',
      city: 'Mérida, Yucatán',
      postalCode: '97000',
      receiver: 'Carlos Reyes',
      phone: '+52 999 123 4567',
      references: 'Casa color crema, portón verde.',
      latitude: 20.9674,
      longitude: -89.5926,
      isPrimary: true,
    },
    {
      id: 'oficina',
      label: 'Oficina',
      street: 'Avenida Itzáes #310',
      neighborhood: 'García Ginerés',
      city: 'Mérida, Yucatán',
      postalCode: '97070',
      receiver: 'Carlos Reyes',
      phone: '+52 999 123 4567',
      references: 'Recepción del edificio.',
      latitude: 20.9902,
      longitude: -89.6241,
      isPrimary: false,
    },
  ],
  paymentMethods: [
    {
      id: 'visa-4242',
      brand: 'Visa',
      last4: '4242',
      expiry: '08/29',
      holder: 'Carlos Reyes',
      isPrimary: true,
    },
  ],
  merchant: {
    registered: false,
    name: 'La Placita Kanasín',
    category: 'Restaurante local',
    description: 'Sabores y productos locales preparados todos los días.',
    address: 'Calle 21 #112, Kanasín, Yucatán',
    phone: '+52 999 234 5678',
    schedule: 'Lun–Dom · 09:00–22:00',
    deliveryFee: '25',
    logo: '',
    cover: '',
    isOpen: true,
  },
  driver: {
    registered: false,
    fullName: 'Carlos Reyes',
    email: 'carlos.reyes@example.com',
    phone: '+52 999 123 4567',
    photo: '',
    vehicle: 'Motocicleta',
    plate: '',
    rating: 4.9,
    deliveries: 1248,
    identification: false,
    license: false,
    insurance: false,
  },
  cart: [],
}

const AppStateContext = createContext<AppStateContextValue | null>(null)
const cartStorageKey = 'appdelivery.cart'

function loadCart(): CartItem[] {
  try {
    const value = window.localStorage.getItem(cartStorageKey)
    return value ? (JSON.parse(value) as CartItem[]) : []
  } catch {
    return []
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    ...defaultState,
    cart: loadCart(),
  }))

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(state.cart))
  }, [state.cart])

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      updateProfile: (profile) => setState((current) => ({ ...current, profile })),
      saveAddress: (address) =>
        setState((current) => {
          const exists = current.addresses.some((item) => item.id === address.id)
          const next = exists
            ? current.addresses.map((item) => (item.id === address.id ? address : item))
            : [...current.addresses, address]

          return {
            ...current,
            addresses: address.isPrimary
              ? next.map((item) => ({ ...item, isPrimary: item.id === address.id }))
              : next,
          }
        }),
      removeAddress: (id) =>
        setState((current) => {
          const next = current.addresses.filter((item) => item.id !== id)
          if (next.length && !next.some((item) => item.isPrimary)) {
            next[0] = { ...next[0], isPrimary: true }
          }
          return { ...current, addresses: next }
        }),
      setPrimaryAddress: (id) =>
        setState((current) => ({
          ...current,
          addresses: current.addresses.map((item) => ({ ...item, isPrimary: item.id === id })),
        })),
      savePaymentMethod: (paymentMethod) =>
        setState((current) => {
          const exists = current.paymentMethods.some((item) => item.id === paymentMethod.id)
          const next = exists
            ? current.paymentMethods.map((item) =>
                item.id === paymentMethod.id ? paymentMethod : item,
              )
            : [...current.paymentMethods, paymentMethod]

          return {
            ...current,
            paymentMethods: paymentMethod.isPrimary
              ? next.map((item) => ({ ...item, isPrimary: item.id === paymentMethod.id }))
              : next,
          }
        }),
      removePaymentMethod: (id) =>
        setState((current) => {
          const next = current.paymentMethods.filter((item) => item.id !== id)
          if (next.length && !next.some((item) => item.isPrimary)) {
            next[0] = { ...next[0], isPrimary: true }
          }
          return { ...current, paymentMethods: next }
        }),
      setPrimaryPaymentMethod: (id) =>
        setState((current) => ({
          ...current,
          paymentMethods: current.paymentMethods.map((item) => ({
            ...item,
            isPrimary: item.id === id,
          })),
        })),
      saveMerchant: (merchant) => setState((current) => ({ ...current, merchant })),
      saveDriver: (driver) => setState((current) => ({ ...current, driver })),
      addCartProduct: (product, quantity = 1) =>
        setState((current) => {
          const baseCart = current.cart.some(
            (item) => item.storeId !== product.storeId,
          )
            ? []
            : current.cart
          const existing = baseCart.find(
            (item) => item.productId === product.id,
          )
          const nextQuantity = Math.min(
            product.stockQuantity,
            (existing?.quantity ?? 0) + quantity,
          )
          const item: CartItem = {
            productId: product.id,
            storeId: product.storeId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stockQuantity: product.stockQuantity,
            quantity: nextQuantity,
          }
          return {
            ...current,
            cart: existing
              ? baseCart.map((currentItem) =>
                  currentItem.productId === product.id ? item : currentItem,
                )
              : [...baseCart, item],
          }
        }),
      updateCartQuantity: (productId, delta) =>
        setState((current) => ({
          ...current,
          cart: current.cart
            .map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: Math.min(
                      item.stockQuantity,
                      Math.max(0, item.quantity + delta),
                    ),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      clearCart: () =>
        setState((current) => ({
          ...current,
          cart: [],
        })),
    }),
    [state],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState debe utilizarse dentro de AppStateProvider')
  }
  return context
}
