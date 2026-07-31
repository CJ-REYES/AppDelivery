import { apiRequest } from '../lib/api'
import type {
  Product,
  ProductCategory,
  SaveProductCategoryInput,
  SaveProductInput,
  SaveStoreInput,
  StoreCategory,
  StoreDetail,
  StoreSummary,
} from '../types/catalog'

export const catalogApi = {
  getStoreCategories: () =>
    apiRequest<StoreCategory[]>('/catalog/store-categories'),

  searchStores: (options: {
    search?: string
    storeCategoryId?: number
    openOnly?: boolean
  } = {}) => {
    const params = new URLSearchParams()

    if (options.search) params.set('search', options.search)
    if (options.storeCategoryId) {
      params.set('storeCategoryId', String(options.storeCategoryId))
    }
    if (options.openOnly) params.set('openOnly', 'true')

    const query = params.size ? `?${params.toString()}` : ''
    return apiRequest<StoreSummary[]>(`/catalog/stores${query}`)
  },

  getStore: (storeId: string) =>
    apiRequest<StoreDetail>(`/catalog/stores/${storeId}`),

  getProducts: (
    storeId: string,
    options: { search?: string; productCategoryId?: string } = {},
  ) => {
    const params = new URLSearchParams()
    if (options.search) params.set('search', options.search)
    if (options.productCategoryId) {
      params.set('productCategoryId', options.productCategoryId)
    }
    const query = params.size ? `?${params.toString()}` : ''
    return apiRequest<Product[]>(
      `/catalog/stores/${storeId}/products${query}`,
    )
  },
}

export const merchantCatalogApi = {
  getStore: (token: string) =>
    apiRequest<StoreDetail>('/merchant/store', {}, token),

  createStore: (input: SaveStoreInput, token: string) =>
    apiRequest<StoreDetail>(
      '/merchant/store',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),

  updateStore: (input: SaveStoreInput, token: string) =>
    apiRequest<StoreDetail>(
      '/merchant/store',
      { method: 'PUT', body: JSON.stringify(input) },
      token,
    ),

  deactivateStore: (token: string) =>
    apiRequest<void>(
      '/merchant/store',
      { method: 'DELETE' },
      token,
    ),

  getCategories: (token: string) =>
    apiRequest<ProductCategory[]>('/merchant/categories', {}, token),

  createCategory: (input: SaveProductCategoryInput, token: string) =>
    apiRequest<ProductCategory>(
      '/merchant/categories',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),

  updateCategory: (
    categoryId: string,
    input: SaveProductCategoryInput,
    token: string,
  ) =>
    apiRequest<ProductCategory>(
      `/merchant/categories/${categoryId}`,
      { method: 'PUT', body: JSON.stringify(input) },
      token,
    ),

  deleteCategory: (categoryId: string, token: string) =>
    apiRequest<void>(
      `/merchant/categories/${categoryId}`,
      { method: 'DELETE' },
      token,
    ),

  getProducts: (token: string) =>
    apiRequest<Product[]>('/merchant/products', {}, token),

  createProduct: (input: SaveProductInput, token: string) =>
    apiRequest<Product>(
      '/merchant/products',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),

  updateProduct: (
    productId: string,
    input: SaveProductInput,
    token: string,
  ) =>
    apiRequest<Product>(
      `/merchant/products/${productId}`,
      { method: 'PUT', body: JSON.stringify(input) },
      token,
    ),

  deleteProduct: (productId: string, token: string) =>
    apiRequest<void>(
      `/merchant/products/${productId}`,
      { method: 'DELETE' },
      token,
    ),
}
