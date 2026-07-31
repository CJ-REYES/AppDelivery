import { apiRequest } from '../lib/api'
import type {
  Address,
  SaveAddressInput,
  UpdateProfileInput,
  UserProfile,
} from '../types/account'

export const accountApi = {
  getProfile: (token: string) =>
    apiRequest<UserProfile>('/users/me', {}, token),

  updateProfile: (input: UpdateProfileInput, token: string) =>
    apiRequest<UserProfile>(
      '/users/me',
      { method: 'PUT', body: JSON.stringify(input) },
      token,
    ),

  getAddresses: (token: string) =>
    apiRequest<Address[]>('/addresses', {}, token),

  getAddress: (addressId: string, token: string) =>
    apiRequest<Address>(`/addresses/${addressId}`, {}, token),

  createAddress: (input: SaveAddressInput, token: string) =>
    apiRequest<Address>(
      '/addresses',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),

  updateAddress: (
    addressId: string,
    input: SaveAddressInput,
    token: string,
  ) =>
    apiRequest<Address>(
      `/addresses/${addressId}`,
      { method: 'PUT', body: JSON.stringify(input) },
      token,
    ),

  deleteAddress: (addressId: string, token: string) =>
    apiRequest<void>(
      `/addresses/${addressId}`,
      { method: 'DELETE' },
      token,
    ),

  setDefaultAddress: (addressId: string, token: string) =>
    apiRequest<Address>(
      `/addresses/${addressId}/default`,
      { method: 'PATCH' },
      token,
    ),
}
