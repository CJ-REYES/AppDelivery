export type StoreCategory = {
  id: number
  name: string
  slug: string
  iconName: string | null
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
  displayOrder: number
  isActive: boolean
}

export type Product = {
  id: string
  storeId: string
  productCategoryId: string
  productCategoryName: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  isAvailable: boolean
  isFeatured: boolean
  preparationTimeMinutes: number
  createdAt: string
  updatedAt: string
}

export type StoreSummary = {
  id: string
  storeCategoryId: number
  storeCategoryName: string
  storeCategorySlug: string
  name: string
  slug: string
  description: string
  logoUrl: string | null
  coverImageUrl: string | null
  deliveryFee: number
  minimumOrderAmount: number
  estimatedDeliveryMinutesMin: number
  estimatedDeliveryMinutesMax: number
  ratingAverage: number
  ratingCount: number
  isOpen: boolean
}

export type StoreDetail = StoreSummary & {
  phoneNumber: string
  email: string | null
  street: string
  exteriorNumber: string
  interiorNumber: string | null
  neighborhood: string
  city: string
  state: string
  postalCode: string
  latitude: number | null
  longitude: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  productCategories: ProductCategory[]
}

export type SaveStoreInput = {
  storeCategoryId: number
  name: string
  description: string
  phoneNumber: string
  email: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  street: string
  exteriorNumber: string
  interiorNumber: string | null
  neighborhood: string
  city: string
  state: string
  postalCode: string
  latitude: number | null
  longitude: number | null
  deliveryFee: number
  minimumOrderAmount: number
  estimatedDeliveryMinutesMin: number
  estimatedDeliveryMinutesMax: number
  isOpen: boolean
}

export type SaveProductCategoryInput = {
  name: string
  displayOrder: number
  isActive: boolean
}

export type SaveProductInput = {
  productCategoryId: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  isAvailable: boolean
  isFeatured: boolean
  preparationTimeMinutes: number
}
