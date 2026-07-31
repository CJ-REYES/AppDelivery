import type { AuthUser } from './auth'

export type UserProfile = AuthUser

export type UpdateProfileInput = {
  firstName: string
  lastName: string
  phoneNumber: string | null
}

export type Address = {
  id: string
  label: string
  street: string
  exteriorNumber: string
  interiorNumber: string | null
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  references: string | null
  latitude: number | null
  longitude: number | null
  isDefault: boolean
  createdAt: string
}

export type SaveAddressInput = {
  label: string
  street: string
  exteriorNumber: string
  interiorNumber: string | null
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  references: string | null
  latitude: number | null
  longitude: number | null
  isDefault: boolean
}
